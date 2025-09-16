{
  "quick_tasting_implementation_plan": {
    "project_overview": {
      "name": "FlavorWheel Quick Tasting Feature",
      "version": "1.0.0",
      "description": "Comprehensive implementation plan for quick tasting functionality in the FlavorWheel mobile-first tasting application",
      "created_date": "2025-01-27",
      "target_platform": "Mobile-first (375x667px iPhone SE)",
      "tech_stack": "Next.js 15.2.4, TypeScript, Supabase PostgreSQL, Tailwind CSS 3.4.9"
    },
    
    "1_specific_requirements": {
      "functional_requirements": {
        "quick_access": {
          "description": "Users can select Quick Tasting from main menu",
          "acceptance_criteria": [
            "Quick Tasting option visible on dashboard",
            "Single tap access to start tasting",
            "No complex setup required"
          ]
        },
        "category_selection": {
          "description": "Users choose category from dropdown (Coffee, Wine, Beer, Spirits, etc.)",
          "acceptance_criteria": [
            "Dropdown with predefined categories",
            "Category affects flavor wheel options",
            "Default category based on user preference"
          ]
        },
        "item_management": {
          "description": "Add items with name, optional photo, aroma, flavor, notes, and 0-100 score",
          "acceptance_criteria": [
            "Item name input (required)",
            "Photo upload (optional)",
            "Aroma notes text area",
            "Flavor notes text area",
            "Other notes text area",
            "Score slider (0-100)",
            "Auto-save functionality"
          ]
        },
        "session_completion": {
          "description": "End and save tasting with one tap",
          "acceptance_criteria": [
            "Single save button",
            "Confirmation dialog",
            "Data persistence to database",
            "Success feedback to user"
          ]
        }
      },
      "non_functional_requirements": {
        "performance": {
          "response_time": "< 2 seconds for all operations",
          "auto_save_debounce": "500ms delay",
          "image_upload_limit": "5MB max file size"
        },
        "usability": {
          "mobile_optimization": "Touch targets minimum 44px",
          "accessibility": "WCAG 2.1 AA compliance",
          "offline_support": "Local storage for draft tastings"
        },
        "security": {
          "data_privacy": "User data isolated via RLS",
          "input_validation": "Zod schema validation",
          "image_security": "Supabase Storage with RLS"
        }
      }
    },
    
    "2_database_interactions": {
      "new_tables_required": {
        "quick_tastings": {
          "purpose": "Store quick tasting session metadata",
          "schema": {
            "id": "uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "user_id": "uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE",
            "category": "text NOT NULL (Coffee, Wine, Beer, Spirits, etc.)",
            "session_name": "text",
            "created_at": "timestamp with time zone DEFAULT now() NOT NULL",
            "updated_at": "timestamp with time zone DEFAULT now() NOT NULL",
            "completed_at": "timestamp with time zone",
            "total_items": "integer DEFAULT 0",
            "average_score": "decimal(4,2)",
            "notes": "text",
            "is_completed": "boolean DEFAULT false"
          },
          "indexes": [
            "CREATE INDEX idx_quick_tastings_user_id ON quick_tastings(user_id)",
            "CREATE INDEX idx_quick_tastings_category ON quick_tastings(category)",
            "CREATE INDEX idx_quick_tastings_created_at ON quick_tastings(created_at DESC)"
          ]
        },
        "quick_tasting_items": {
          "purpose": "Store individual items within quick tasting sessions",
          "schema": {
            "id": "uuid PRIMARY KEY DEFAULT gen_random_uuid()",
            "tasting_id": "uuid NOT NULL REFERENCES quick_tastings(id) ON DELETE CASCADE",
            "item_name": "text NOT NULL",
            "photo_url": "text",
            "aroma_notes": "text",
            "flavor_notes": "text",
            "other_notes": "text",
            "score": "integer CHECK (score >= 0 AND score <= 100)",
            "created_at": "timestamp with time zone DEFAULT now() NOT NULL",
            "updated_at": "timestamp with time zone DEFAULT now() NOT NULL",
            "order_index": "integer DEFAULT 0"
          },
          "indexes": [
            "CREATE INDEX idx_quick_tasting_items_tasting_id ON quick_tasting_items(tasting_id)",
            "CREATE INDEX idx_quick_tasting_items_order ON quick_tasting_items(tasting_id, order_index)"
          ]
        }
      },
      "rls_policies": {
        "quick_tastings_policies": [
          {
            "name": "Users can view own quick tastings",
            "action": "SELECT",
            "rule": "auth.uid() = user_id"
          },
          {
            "name": "Users can create own quick tastings",
            "action": "INSERT",
            "rule": "auth.uid() = user_id"
          },
          {
            "name": "Users can update own quick tastings",
            "action": "UPDATE",
            "rule": "auth.uid() = user_id"
          },
          {
            "name": "Users can delete own quick tastings",
            "action": "DELETE",
            "rule": "auth.uid() = user_id"
          }
        ],
        "quick_tasting_items_policies": [
          {
            "name": "Users can view own tasting items",
            "action": "SELECT",
            "rule": "EXISTS (SELECT 1 FROM quick_tastings WHERE id = tasting_id AND user_id = auth.uid())"
          },
          {
            "name": "Users can create own tasting items",
            "action": "INSERT",
            "rule": "EXISTS (SELECT 1 FROM quick_tastings WHERE id = tasting_id AND user_id = auth.uid())"
          },
          {
            "name": "Users can update own tasting items",
            "action": "UPDATE",
            "rule": "EXISTS (SELECT 1 FROM quick_tastings WHERE id = tasting_id AND user_id = auth.uid())"
          },
          {
            "name": "Users can delete own tasting items",
            "action": "DELETE",
            "rule": "EXISTS (SELECT 1 FROM quick_tastings WHERE id = tasting_id AND user_id = auth.uid())"
          }
        ]
      },
      "triggers_and_functions": {
        "update_tasting_stats": {
          "purpose": "Automatically update quick_tastings statistics when items change",
          "function": "CREATE OR REPLACE FUNCTION update_quick_tasting_stats() RETURNS trigger AS $$ BEGIN IF TG_OP = 'DELETE' THEN UPDATE quick_tastings SET total_items = (SELECT COUNT(*) FROM quick_tasting_items WHERE tasting_id = OLD.tasting_id), average_score = (SELECT AVG(score) FROM quick_tasting_items WHERE tasting_id = OLD.tasting_id AND score IS NOT NULL), updated_at = now() WHERE id = OLD.tasting_id; RETURN OLD; ELSE UPDATE quick_tastings SET total_items = (SELECT COUNT(*) FROM quick_tasting_items WHERE tasting_id = NEW.tasting_id), average_score = (SELECT AVG(score) FROM quick_tasting_items WHERE tasting_id = NEW.tasting_id AND score IS NOT NULL), updated_at = now() WHERE id = NEW.tasting_id; RETURN NEW; END IF; END; $$ LANGUAGE plpgsql;",
          "triggers": [
            "CREATE TRIGGER trg_update_tasting_stats_insert AFTER INSERT ON quick_tasting_items FOR EACH ROW EXECUTE FUNCTION update_quick_tasting_stats();",
            "CREATE TRIGGER trg_update_tasting_stats_update AFTER UPDATE ON quick_tasting_items FOR EACH ROW EXECUTE FUNCTION update_quick_tasting_stats();",
            "CREATE TRIGGER trg_update_tasting_stats_delete AFTER DELETE ON quick_tasting_items FOR EACH ROW EXECUTE FUNCTION update_quick_tasting_stats();"
          ]
        },
        "update_profile_stats": {
          "purpose": "Update user profile tastings_count when quick tastings are completed",
          "function": "CREATE OR REPLACE FUNCTION update_profile_tasting_count() RETURNS trigger AS $$ BEGIN IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN UPDATE profiles SET tastings_count = tastings_count + 1, last_tasted_at = now(), updated_at = now() WHERE user_id = NEW.user_id; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;",
          "trigger": "CREATE TRIGGER trg_update_profile_tasting_count AFTER UPDATE ON quick_tastings FOR EACH ROW EXECUTE FUNCTION update_profile_tasting_count();"
        }
      }
    },
    
    "3_workflow_and_data_flow": {
      "component_architecture": {
        "pages": {
          "quick_tasting_page": {
            "path": "/quick-tasting",
            "components": [
              "QuickTastingHeader",
              "CategorySelector",
              "TastingItemsList",
              "AddItemForm",
              "TastingActions"
            ]
          }
        },
        "components": {
          "QuickTastingHeader": {
            "purpose": "Display session info and progress",
            "props": ["sessionName", "category", "itemCount", "averageScore"]
          },
          "CategorySelector": {
            "purpose": "Dropdown for selecting tasting category",
            "props": ["selectedCategory", "onCategoryChange", "categories"]
          },
          "TastingItemsList": {
            "purpose": "Display and manage tasting items",
            "props": ["items", "onItemUpdate", "onItemDelete"]
          },
          "AddItemForm": {
            "purpose": "Form for adding new tasting items",
            "props": ["onItemAdd", "category"]
          },
          "TastingItemCard": {
            "purpose": "Individual item display and editing",
            "props": ["item", "onUpdate", "onDelete", "isEditing"]
          },
          "ScoreSlider": {
            "purpose": "0-100 score input with visual feedback",
            "props": ["value", "onChange", "min", "max"]
          },
          "PhotoUpload": {
            "purpose": "Image upload with preview",
            "props": ["onUpload", "currentUrl", "maxSize"]
          }
        }
      },
      "data_flow_sequence": {
        "session_start": [
          "User navigates to /quick-tasting",
          "Create new quick_tastings record with user_id",
          "Set default category from user preferences",
          "Initialize empty items array in state",
          "Display empty session interface"
        ],
        "add_item": [
          "User fills AddItemForm",
          "Validate form data with Zod schema",
          "Upload photo to Supabase Storage (if provided)",
          "Insert new quick_tasting_items record",
          "Trigger updates quick_tastings statistics",
          "Update local state with new item",
          "Show success toast notification"
        ],
        "edit_item": [
          "User clicks edit on TastingItemCard",
          "Enable inline editing mode",
          "Auto-save changes with 500ms debounce",
          "Update quick_tasting_items record",
          "Trigger updates statistics",
          "Update local state",
          "Show save indicator"
        ],
        "complete_session": [
          "User clicks 'Complete Tasting' button",
          "Show confirmation dialog",
          "Update quick_tastings.is_completed = true",
          "Update quick_tastings.completed_at = now()",
          "Trigger updates profile.tastings_count",
          "Navigate to tasting summary page",
          "Show completion success message"
        ]
      },
      "state_management": {
        "local_state": {
          "currentTasting": "QuickTasting object",
          "tastingItems": "Array of TastingItem objects",
          "isLoading": "boolean for async operations",
          "isDirty": "boolean for unsaved changes",
          "selectedCategory": "string for current category"
        },
        "auto_save_strategy": {
          "trigger_events": ["item name change", "score change", "notes change"],
          "debounce_delay": "500ms",
          "error_handling": "Retry with exponential backoff",
          "offline_support": "Store in localStorage, sync when online"
        }
      }
    },
    
    "4_dependencies_and_constraints": {
      "technical_dependencies": {
        "existing_systems": {
          "supabase_auth": {
            "requirement": "User must be authenticated",
            "integration": "Use auth.uid() for RLS policies"
          },
          "profiles_table": {
            "requirement": "User profile must exist",
            "integration": "Foreign key relationship to profiles.user_id"
          },
          "supabase_storage": {
            "requirement": "Photo upload functionality",
            "integration": "Create 'tasting-photos' bucket with RLS"
          }
        },
        "design_system_integration": {
          "color_palette": "Use Mexican-inspired colors from design tokens",
          "typography": "Crimson Text for headings, Inter for body",
          "spacing": "8px base unit spacing scale",
          "components": "Follow established button, card, and form patterns",
          "responsive_design": "Mobile-first with 375px minimum width"
        },
        "external_libraries": {
          "react_toastify": "User feedback notifications",
          "zod": "Form validation schemas",
          "tailwind_css": "Styling with design tokens",
          "next_js_router": "Navigation between pages"
        }
      },
      "constraints": {
        "performance_constraints": {
          "mobile_optimization": "Must work smoothly on iPhone SE (375x667px)",
          "image_size_limit": "5MB maximum for photo uploads",
          "auto_save_frequency": "Maximum 1 request per 500ms",
          "offline_capability": "Basic functionality without internet"
        },
        "business_constraints": {
          "user_data_privacy": "All data isolated per user via RLS",
          "category_limitations": "Predefined categories only (Coffee, Wine, Beer, etc.)",
          "score_range": "0-100 integer values only",
          "session_persistence": "Sessions must be recoverable if app closes"
        },
        "technical_constraints": {
          "database_limits": "Supabase free tier row limits",
          "storage_limits": "Supabase free tier storage limits",
          "api_rate_limits": "Supabase API rate limiting",
          "browser_compatibility": "Modern mobile browsers only"
        }
      }
    },
    
    "5_technical_considerations": {
      "performance_optimization": {
        "database_optimization": {
          "indexing_strategy": "Indexes on user_id, category, created_at for fast queries",
          "query_optimization": "Use SELECT with specific columns, avoid SELECT *",
          "connection_pooling": "Leverage Supabase connection pooling",
          "pagination": "Implement pagination for large tasting histories"
        },
        "frontend_optimization": {
          "lazy_loading": "Lazy load images and non-critical components",
          "debounced_auto_save": "Prevent excessive API calls during typing",
          "optimistic_updates": "Update UI immediately, sync with server",
          "image_compression": "Compress images before upload"
        },
        "caching_strategy": {
          "browser_cache": "Cache static assets and images",
          "local_storage": "Store draft tastings locally",
          "supabase_cache": "Leverage Supabase built-in caching"
        }
      },
      "security_considerations": {
        "data_protection": {
          "rls_enforcement": "All tables protected with Row Level Security",
          "input_validation": "Zod schemas for all user inputs",
          "sql_injection_prevention": "Parameterized queries via Supabase client",
          "xss_prevention": "Sanitize all user-generated content"
        },
        "file_upload_security": {
          "file_type_validation": "Only allow image files (jpg, png, webp)",
          "file_size_limits": "5MB maximum file size",
          "virus_scanning": "Leverage Supabase Storage security",
          "access_control": "RLS policies on storage buckets"
        }
      },
      "accessibility_implementation": {
        "wcag_compliance": {
          "color_contrast": "Minimum 4.5:1 contrast ratio",
          "keyboard_navigation": "Full keyboard accessibility",
          "screen_reader_support": "Proper ARIA labels and roles",
          "focus_management": "Visible focus indicators"
        },
        "mobile_accessibility": {
          "touch_targets": "Minimum 44px touch target size",
          "gesture_support": "Swipe gestures for item management",
          "voice_input": "Support for voice notes (future enhancement)"
        }
      },
      "error_handling": {
        "network_errors": {
          "offline_detection": "Detect network status changes",
          "retry_logic": "Exponential backoff for failed requests",
          "user_feedback": "Clear error messages with recovery options",
          "data_recovery": "Restore from localStorage on reconnection"
        },
        "validation_errors": {
          "real_time_validation": "Validate inputs as user types",
          "error_highlighting": "Visual indicators for invalid fields",
          "helpful_messages": "Specific, actionable error messages"
        }
      },
      "integration_points": {
        "future_features": {
          "flavor_wheel_integration": "Data structure supports AI flavor analysis",
          "social_sharing": "Tasting data can be shared publicly",
          "competition_mode": "Quick tastings can be converted to competitions",
          "export_functionality": "Data structure supports PDF export"
        },
        "analytics_integration": {
          "user_behavior_tracking": "Track tasting patterns and preferences",
          "performance_monitoring": "Monitor app performance and errors",
          "usage_analytics": "Understand feature adoption and usage"
        }
      },
      "implementation_priority": {
        "phase_1_mvp": [
          "Database schema creation",
          "Basic CRUD operations",
          "Simple UI components",
          "Auto-save functionality"
        ],
        "phase_2_enhancement": [
          "Photo upload integration",
          "Advanced form validation",
          "Offline support",
          "Performance optimization"
        ],
        "phase_3_polish": [
          "Advanced accessibility features",
          "Analytics integration",
          "Error recovery mechanisms",
          "User experience refinements"
        ]
      }
    },
    
    "implementation_steps": [
      {
        "step": 1,
        "title": "Database Schema Setup",
        "description": "Create quick_tastings and quick_tasting_items tables with RLS policies",
        "estimated_time": "2 hours",
        "dependencies": ["Existing profiles table"]
      },
      {
        "step": 2,
        "title": "Core Components Development",
        "description": "Build QuickTastingPage, TastingItemCard, and AddItemForm components",
        "estimated_time": "8 hours",
        "dependencies": ["Database schema", "Design tokens"]
      },
      {
        "step": 3,
        "title": "Auto-save Implementation",
        "description": "Implement debounced auto-save with error handling",
        "estimated_time": "4 hours",
        "dependencies": ["Core components"]
      },
      {
        "step": 4,
        "title": "Photo Upload Integration",
        "description": "Integrate Supabase Storage for photo uploads",
        "estimated_time": "6 hours",
        "dependencies": ["Core functionality"]
      },
      {
        "step": 5,
        "title": "Testing and Optimization",
        "description": "Comprehensive testing, performance optimization, and accessibility audit",
        "estimated_time": "6 hours",
        "dependencies": ["All previous steps"]
      }
    ],
    
    "success_metrics": {
      "user_experience": {
        "task_completion_rate": "> 95% for creating a quick tasting",
        "average_session_time": "< 5 minutes for 3-item tasting",
        "user_satisfaction": "> 4.5/5 rating"
      },
      "technical_performance": {
        "page_load_time": "< 2 seconds on 3G connection",
        "auto_save_reliability": "> 99% success rate",
        "error_rate": "< 1% of all operations"
      },
      "business_impact": {
        "feature_adoption": "> 80% of active users try quick tasting",
        "retention_improvement": "10% increase in weekly active users",
        "data_quality": "> 90% of tastings have complete data"
      }
    }
  }
}