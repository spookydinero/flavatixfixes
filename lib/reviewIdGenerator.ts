/**
 * Review ID Generator
 * 
 * Generates a unique Review ID in the format:
 * First 4 characters of Category + Name + Lot ID + Date
 * Example: WINECABE322-6/7/25
 */

export function generateReviewId(
  category: string,
  itemName: string,
  batchId: string,
  date?: Date
): string {
  // Use provided date or current date
  const reviewDate = date || new Date();
  
  // Format date as M/D/YY
  const month = reviewDate.getMonth() + 1; // 0-indexed
  const day = reviewDate.getDate();
  const year = reviewDate.getFullYear().toString().slice(-2);
  const formattedDate = `${month}/${day}/${year}`;
  
  // Get first 4 characters of category (uppercase)
  const categoryPrefix = category.slice(0, 4).toUpperCase();
  
  // Clean and get first 4 characters of item name (remove spaces, uppercase)
  const cleanedName = itemName.replace(/\s+/g, '').toUpperCase();
  const namePrefix = cleanedName.slice(0, 4);
  
  // Clean batch ID (remove spaces and special characters except hyphens)
  const cleanedBatchId = batchId.replace(/[^\w-]/g, '');
  
  // Construct Review ID
  const reviewId = `${categoryPrefix}${namePrefix}${cleanedBatchId}-${formattedDate}`;
  
  return reviewId;
}

/**
 * Parse a Review ID to extract its components
 */
export function parseReviewId(reviewId: string): {
  categoryPrefix: string;
  namePrefix: string;
  batchId: string;
  date: string;
} | null {
  // Expected format: CATENAME[BATCH]-M/D/YY
  const match = reviewId.match(/^([A-Z]{4})([A-Z]{4})(.+)-(\d{1,2}\/\d{1,2}\/\d{2})$/);
  
  if (!match) {
    return null;
  }
  
  return {
    categoryPrefix: match[1],
    namePrefix: match[2],
    batchId: match[3],
    date: match[4]
  };
}

/**
 * Validate a Review ID format
 */
export function isValidReviewId(reviewId: string): boolean {
  return parseReviewId(reviewId) !== null;
}

