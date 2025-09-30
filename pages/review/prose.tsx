import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { ChevronLeft } from 'lucide-react';
import ProseReviewForm, { ProseReviewFormData } from '@/components/review/ProseReviewForm';
import { generateReviewId } from '@/lib/reviewIdGenerator';

const ProseReviewPage: React.FC = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = getSupabaseClient() as any;

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const handlePhotoUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `review-${Date.now()}.${fileExt}`;
    const filePath = `${user!.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('tasting-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('tasting-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (data: ProseReviewFormData, action: 'done' | 'save' | 'new') => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Generate Review ID
      const reviewId = generateReviewId(
        data.category,
        data.item_name,
        data.batch_id || '',
        new Date()
      );

      // Determine status based on action
      const status = action === 'done' ? 'completed' : 'in_progress';

      // Insert review into database
      const { data: review, error } = await supabase
        .from('prose_reviews')
        .insert({
          user_id: user.id,
          review_id: reviewId,
          item_name: data.item_name,
          picture_url: data.picture_url,
          brand: data.brand,
          country: data.country,
          state: data.state,
          region: data.region,
          vintage: data.vintage,
          batch_id: data.batch_id,
          upc_barcode: data.upc_barcode,
          category: data.category,
          review_content: data.review_content,
          status: status
        })
        .select()
        .single();

      if (error) throw error;

      if (action === 'done') {
        toast.success('Prose review completed!');
        router.push(`/review/summary/${review.id}?type=prose`);
      } else if (action === 'save') {
        toast.success('Prose review saved for later');
        router.push('/review/my-reviews');
      } else if (action === 'new') {
        toast.success('Prose review completed! Starting new review...');
        router.reload();
      }
    } catch (error) {
      console.error('Error saving prose review:', error);
      toast.error('Failed to save prose review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-sm"></div>
          <div className="text-text-primary text-h4 font-body font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-zinc-200 min-h-screen">
      <main id="main-content">
        <div className="container mx-auto px-md py-lg max-w-4xl">
          {/* Header */}
          <div className="mb-lg">
            <button
              onClick={() => router.push('/review')}
              className="flex items-center text-text-secondary hover:text-text-primary mb-sm transition-colors font-body"
            >
              <ChevronLeft size={20} className="mr-2" />
              Back to Reviews
            </button>
            <h1 className="text-h1 font-heading font-bold text-text-primary mb-xs">
              Prose Review
            </h1>
            <p className="text-body font-body text-text-secondary">
              Write your review in your own words
            </p>
          </div>

          {/* Prose Review Form */}
          <ProseReviewForm
            onSubmit={handleSubmit}
            onPhotoUpload={handlePhotoUpload}
            isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
};

export default ProseReviewPage;

