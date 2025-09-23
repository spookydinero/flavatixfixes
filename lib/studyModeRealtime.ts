import { getSupabaseClient } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SuggestionUpdate {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  moderated_by?: string;
  moderated_at?: string;
}

export interface RoleUpdate {
  participant_id: string;
  role: 'host' | 'participant' | 'both';
  can_moderate: boolean;
  can_add_items: boolean;
}

export interface CollaborativeCallbacks {
  onSuggestionUpdate?: (update: SuggestionUpdate) => void;
  onRoleUpdate?: (update: RoleUpdate) => void;
  onItemApproved?: (itemId: string, itemName: string) => void;
  onParticipantJoined?: (participantId: string) => void;
  onHostUnresponsive?: () => void;
  onHostResponsive?: () => void;
}

/**
 * Real-time subscription manager for Study Mode collaborative features
 */
export class StudyModeRealtime {
  private supabase = getSupabaseClient();
  private channels: Map<string, RealtimeChannel> = new Map();
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();
  private lastHeartbeat: Map<string, number> = new Map();
  private unresponsiveTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Subscribe to collaborative updates for a specific tasting session
   */
  subscribeToTasting(tastingId: string, callbacks: CollaborativeCallbacks): () => void {
    const channelName = `tasting-${tastingId}`;

    // Clean up existing subscription if any
    this.unsubscribeFromTasting(tastingId);

    const channel = this.supabase.channel(channelName);

    // Subscribe to suggestion status changes
    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasting_item_suggestions',
          filter: `tasting_id=eq.${tastingId}`,
        },
        (payload) => {
          if (payload.new && callbacks.onSuggestionUpdate) {
            callbacks.onSuggestionUpdate({
              id: payload.new.id,
              status: payload.new.status,
              moderated_by: payload.new.moderated_by,
              moderated_at: payload.new.moderated_at,
            });
          }
        }
      )
      // Subscribe to new approved items
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quick_tasting_items',
          filter: `tasting_id=eq.${tastingId}`,
        },
        (payload) => {
          if (payload.new && callbacks.onItemApproved) {
            callbacks.onItemApproved(payload.new.id, payload.new.item_name);
          }
        }
      )
      // Subscribe to participant role changes
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasting_participants',
          filter: `tasting_id=eq.${tastingId}`,
        },
        (payload) => {
          if (payload.new && callbacks.onRoleUpdate) {
            callbacks.onRoleUpdate({
              participant_id: payload.new.id,
              role: payload.new.role,
              can_moderate: payload.new.can_moderate,
              can_add_items: payload.new.can_add_items,
            });
          }
        }
      )
      // Subscribe to new participants joining
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tasting_participants',
          filter: `tasting_id=eq.${tastingId}`,
        },
        (payload) => {
          if (payload.new && callbacks.onParticipantJoined) {
            callbacks.onParticipantJoined(payload.new.id);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Start heartbeat monitoring for host unresponsiveness detection
    this.startHeartbeatMonitoring(tastingId, callbacks);

    // Return unsubscribe function
    return () => this.unsubscribeFromTasting(tastingId);
  }

  /**
   * Unsubscribe from collaborative updates for a tasting session
   */
  unsubscribeFromTasting(tastingId: string): void {
    const channelName = `tasting-${tastingId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      this.supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }

    // Clean up heartbeat monitoring
    this.stopHeartbeatMonitoring(tastingId);
  }

  /**
   * Broadcast a custom event (for immediate UI updates)
   */
  broadcastEvent(tastingId: string, event: string, data: any): void {
    const channelName = `tasting-${tastingId}`;
    const channel = this.channels.get(channelName);

    if (channel) {
      channel.send({
        type: 'broadcast',
        event,
        payload: data,
      });
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    for (const channelName of Array.from(this.channels.keys())) {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unsubscribe();
      }
    }
    this.channels.clear();

    // Clean up all heartbeat monitoring
    for (const tastingId of Array.from(this.heartbeatIntervals.keys())) {
      this.stopHeartbeatMonitoring(tastingId);
    }
  }

  /**
   * Start heartbeat monitoring for host unresponsiveness detection
   */
  private startHeartbeatMonitoring(tastingId: string, callbacks: CollaborativeCallbacks): void {
    // Send initial heartbeat
    this.sendHeartbeat(tastingId);

    // Set up periodic heartbeat (every 30 seconds)
    const heartbeatInterval = setInterval(() => {
      this.sendHeartbeat(tastingId);
    }, 30000);

    this.heartbeatIntervals.set(tastingId, heartbeatInterval);

    // Set up unresponsiveness detection (2 minutes without heartbeat)
    const unresponsiveTimeout = setTimeout(() => {
      if (callbacks.onHostUnresponsive) {
        callbacks.onHostUnresponsive();
      }
    }, 120000); // 2 minutes

    this.unresponsiveTimeouts.set(tastingId, unresponsiveTimeout);
  }

  /**
   * Stop heartbeat monitoring for a tasting session
   */
  private stopHeartbeatMonitoring(tastingId: string): void {
    const heartbeatInterval = this.heartbeatIntervals.get(tastingId);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      this.heartbeatIntervals.delete(tastingId);
    }

    const unresponsiveTimeout = this.unresponsiveTimeouts.get(tastingId);
    if (unresponsiveTimeout) {
      clearTimeout(unresponsiveTimeout);
      this.unresponsiveTimeouts.delete(tastingId);
    }

    this.lastHeartbeat.delete(tastingId);
  }

  /**
   * Send a heartbeat signal
   */
  private sendHeartbeat(tastingId: string): void {
    this.lastHeartbeat.set(tastingId, Date.now());
    this.broadcastEvent(tastingId, 'heartbeat', { timestamp: Date.now() });
  }

  /**
   * Mark host as responsive (reset unresponsiveness timer)
   */
  markHostResponsive(tastingId: string, callbacks: CollaborativeCallbacks): void {
    // Clear existing unresponsiveness timeout
    const unresponsiveTimeout = this.unresponsiveTimeouts.get(tastingId);
    if (unresponsiveTimeout) {
      clearTimeout(unresponsiveTimeout);
    }

    // Set up new unresponsiveness detection
    const newTimeout = setTimeout(() => {
      if (callbacks.onHostUnresponsive) {
        callbacks.onHostUnresponsive();
      }
    }, 120000);

    this.unresponsiveTimeouts.set(tastingId, newTimeout);

    // Notify that host is responsive
    if (callbacks.onHostResponsive) {
      callbacks.onHostResponsive();
    }
  }
}

// Singleton instance
export const studyModeRealtime = new StudyModeRealtime();
