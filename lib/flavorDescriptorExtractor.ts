/**
 * Flavor Descriptor Extractor
 *
 * This service extracts and categorizes flavor/aroma descriptors from text.
 * Uses a hybrid approach: keyword matching + AI categorization
 */

export interface ExtractedDescriptor {
  text: string;
  type: 'aroma' | 'flavor' | 'texture' | 'metaphor';
  category: string | null;
  subcategory: string | null;
  confidence: number;
  intensity?: number;
}

export interface DescriptorExtractionResult {
  descriptors: ExtractedDescriptor[];
  totalFound: number;
  extractionMethod: 'keyword' | 'ai' | 'hybrid';
}

// Comprehensive flavor taxonomy
const FLAVOR_TAXONOMY = {
  aroma: {
    Fruity: {
      subcategories: ['Citrus', 'Berry', 'Stone Fruit', 'Tropical', 'Dried Fruit'],
      keywords: {
        Citrus: ['lemon', 'lime', 'orange', 'grapefruit', 'citrus', 'bergamot', 'tangerine', 'mandarin'],
        Berry: ['strawberry', 'raspberry', 'blackberry', 'blueberry', 'cranberry', 'cherry', 'currant'],
        'Stone Fruit': ['peach', 'apricot', 'plum', 'nectarine', 'cherry'],
        Tropical: ['mango', 'pineapple', 'papaya', 'passion fruit', 'guava', 'lychee', 'coconut'],
        'Dried Fruit': ['raisin', 'prune', 'fig', 'date', 'dried apricot']
      }
    },
    Floral: {
      subcategories: ['White Flowers', 'Rose', 'Violet', 'Herb Flowers'],
      keywords: {
        'White Flowers': ['jasmine', 'honeysuckle', 'elderflower', 'acacia', 'white flower'],
        Rose: ['rose', 'rose petal', 'turkish rose'],
        Violet: ['violet', 'iris', 'lavender'],
        'Herb Flowers': ['chamomile', 'hibiscus', 'geranium']
      }
    },
    Spicy: {
      subcategories: ['Pungent', 'Sweet Spice', 'Herbal Spice'],
      keywords: {
        Pungent: ['pepper', 'black pepper', 'white pepper', 'ginger', 'clove'],
        'Sweet Spice': ['cinnamon', 'nutmeg', 'cardamom', 'anise', 'star anise', 'allspice'],
        'Herbal Spice': ['thyme', 'oregano', 'rosemary', 'sage', 'basil', 'mint']
      }
    },
    Earthy: {
      subcategories: ['Forest', 'Mineral', 'Mushroom', 'Tobacco'],
      keywords: {
        Forest: ['woody', 'forest floor', 'moss', 'damp earth', 'soil', 'cedar', 'pine'],
        Mineral: ['mineral', 'wet stone', 'flint', 'chalk', 'slate', 'petrichor'],
        Mushroom: ['mushroom', 'truffle', 'forest mushroom', 'porcini'],
        Tobacco: ['tobacco', 'cigar', 'pipe tobacco', 'leather']
      }
    },
    Woody: {
      subcategories: ['Oak', 'Cedar', 'Resinous', 'Smoky'],
      keywords: {
        Oak: ['oak', 'barrel', 'vanilla', 'toast', 'caramel wood'],
        Cedar: ['cedar', 'sandalwood', 'pine', 'birch'],
        Resinous: ['resin', 'sap', 'pine resin', 'incense'],
        Smoky: ['smoke', 'smoked', 'peat', 'charcoal', 'burnt', 'ash']
      }
    },
    Sweet: {
      subcategories: ['Caramel', 'Chocolate', 'Honey', 'Vanilla'],
      keywords: {
        Caramel: ['caramel', 'butterscotch', 'toffee', 'dulce de leche'],
        Chocolate: ['chocolate', 'cocoa', 'dark chocolate', 'milk chocolate', 'cacao'],
        Honey: ['honey', 'honeyed', 'beeswax', 'mead'],
        Vanilla: ['vanilla', 'vanillin', 'vanilla bean']
      }
    },
    Nutty: {
      subcategories: ['Tree Nuts', 'Roasted'],
      keywords: {
        'Tree Nuts': ['almond', 'walnut', 'hazelnut', 'pecan', 'macadamia', 'pistachio'],
        Roasted: ['roasted nuts', 'toasted', 'nutty', 'malt']
      }
    }
  },
  flavor: {
    Sweet: {
      subcategories: ['Sugary', 'Honey', 'Fruit Sweet'],
      keywords: {
        Sugary: ['sweet', 'sugar', 'syrup', 'molasses', 'candy'],
        Honey: ['honey', 'honeyed', 'nectar'],
        'Fruit Sweet': ['ripe fruit', 'fruit sweetness', 'jam', 'preserves']
      }
    },
    Sour: {
      subcategories: ['Citric', 'Fermented', 'Tart'],
      keywords: {
        Citric: ['citric acid', 'lemon juice', 'sour citrus'],
        Fermented: ['fermented', 'sour', 'tangy', 'acidic'],
        Tart: ['tart', 'sharp', 'puckering']
      }
    },
    Bitter: {
      subcategories: ['Coffee', 'Dark Chocolate', 'Herbal'],
      keywords: {
        Coffee: ['coffee', 'espresso', 'roasted coffee'],
        'Dark Chocolate': ['dark chocolate', 'bitter chocolate', 'cacao'],
        Herbal: ['bitter herbs', 'gentian', 'wormwood']
      }
    },
    Salty: {
      subcategories: ['Marine', 'Mineral'],
      keywords: {
        Marine: ['salty', 'sea salt', 'ocean', 'brine', 'seaweed', 'oyster'],
        Mineral: ['mineral', 'saline']
      }
    },
    Umami: {
      subcategories: ['Savory', 'Meaty'],
      keywords: {
        Savory: ['umami', 'savory', 'broth', 'soy', 'miso'],
        Meaty: ['meaty', 'beef', 'chicken broth', 'bone broth']
      }
    }
  },
  texture: {
    Mouthfeel: {
      subcategories: ['Body', 'Smoothness', 'Astringency'],
      keywords: {
        Body: ['full-bodied', 'light-bodied', 'medium-bodied', 'heavy', 'thin', 'watery'],
        Smoothness: ['smooth', 'silky', 'velvety', 'creamy', 'oily', 'rich'],
        Astringency: ['astringent', 'drying', 'tannic', 'grippy', 'chalky']
      }
    },
    Temperature: {
      subcategories: ['Hot', 'Cooling'],
      keywords: {
        Hot: ['hot', 'warming', 'burn', 'heat'],
        Cooling: ['cooling', 'menthol', 'fresh', 'crisp']
      }
    }
  },
  metaphor: {
    Mood: {
      subcategories: ['Emotional', 'Character'],
      keywords: {
        Emotional: ['brooding', 'joyful', 'melancholy', 'cheerful', 'contemplative', 'energetic'],
        Character: ['elegant', 'rustic', 'refined', 'bold', 'subtle', 'delicate', 'robust']
      }
    },
    Place: {
      subcategories: ['Indoor', 'Outdoor', 'Abstract'],
      keywords: {
        Indoor: ['library', 'kitchen', 'cellar', 'parlor', 'study'],
        Outdoor: ['seaside', 'forest', 'garden', 'mountain', 'countryside'],
        Abstract: ['old world', 'new world', 'ancient', 'modern']
      }
    },
    Temporal: {
      subcategories: ['Age', 'Season', 'Time of Day'],
      keywords: {
        Age: ['youthful', 'mature', 'aged', 'fresh', 'old', 'ancient'],
        Season: ['spring', 'summer', 'autumn', 'winter', 'autumnal'],
        'Time of Day': ['morning', 'evening', 'twilight', 'dawn', 'dusk']
      }
    }
  }
};

/**
 * Extract descriptors using keyword matching
 */
export function extractDescriptorsKeywordBased(text: string): ExtractedDescriptor[] {
  const descriptors: ExtractedDescriptor[] = [];
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+|[,;.]+/).filter(w => w.length > 2);

  // Check against taxonomy
  Object.entries(FLAVOR_TAXONOMY).forEach(([type, categories]) => {
    Object.entries(categories).forEach(([category, data]) => {
      Object.entries(data.keywords).forEach(([subcategory, keywords]) => {
        keywords.forEach((keyword: string) => {
          // Check if keyword appears in text
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          if (regex.test(lowerText)) {
            // Check if already added
            const exists = descriptors.some(d =>
              d.text.toLowerCase() === keyword.toLowerCase()
            );

            if (!exists) {
              descriptors.push({
                text: keyword,
                type: type as 'aroma' | 'flavor' | 'texture' | 'metaphor',
                category,
                subcategory,
                confidence: 0.85, // High confidence for exact keyword matches
              });
            }
          }
        });
      });
    });
  });

  return descriptors;
}

/**
 * Enhanced extraction with intensity detection
 */
export function extractDescriptorsWithIntensity(
  text: string,
  intensityScore?: number
): ExtractedDescriptor[] {
  const descriptors = extractDescriptorsKeywordBased(text);

  // Intensity modifiers
  const intensityWords = {
    high: ['strong', 'intense', 'powerful', 'bold', 'pronounced', 'dominant'],
    medium: ['moderate', 'noticeable', 'present', 'apparent'],
    low: ['subtle', 'faint', 'delicate', 'hint of', 'whisper', 'trace']
  };

  const lowerText = text.toLowerCase();

  descriptors.forEach(descriptor => {
    // If numeric intensity provided, use it
    if (intensityScore) {
      descriptor.intensity = intensityScore;
    } else {
      // Infer from text
      const descriptorIndex = lowerText.indexOf(descriptor.text.toLowerCase());
      if (descriptorIndex === -1) return;

      // Look at surrounding words (30 chars before)
      const context = lowerText.substring(
        Math.max(0, descriptorIndex - 30),
        descriptorIndex
      );

      if (intensityWords.high.some(word => context.includes(word))) {
        descriptor.intensity = 4;
      } else if (intensityWords.low.some(word => context.includes(word))) {
        descriptor.intensity = 2;
      } else {
        descriptor.intensity = 3; // Default medium
      }
    }
  });

  return descriptors;
}

/**
 * Extract descriptors from structured review data
 */
export function extractFromStructuredReview(reviewData: {
  aroma_notes?: string;
  flavor_notes?: string;
  texture_notes?: string;
  other_notes?: string;
  aroma_intensity?: number;
  flavor_intensity?: number;
}): ExtractedDescriptor[] {
  const allDescriptors: ExtractedDescriptor[] = [];

  // Extract from aroma notes
  if (reviewData.aroma_notes) {
    const aromaDescriptors = extractDescriptorsWithIntensity(
      reviewData.aroma_notes,
      reviewData.aroma_intensity
    );
    aromaDescriptors.forEach(d => {
      d.type = 'aroma';
      allDescriptors.push(d);
    });
  }

  // Extract from flavor notes
  if (reviewData.flavor_notes) {
    const flavorDescriptors = extractDescriptorsWithIntensity(
      reviewData.flavor_notes,
      reviewData.flavor_intensity
    );
    flavorDescriptors.forEach(d => {
      d.type = 'flavor';
      allDescriptors.push(d);
    });
  }

  // Extract from texture notes
  if (reviewData.texture_notes) {
    const textureDescriptors = extractDescriptorsKeywordBased(
      reviewData.texture_notes
    );
    textureDescriptors.forEach(d => {
      d.type = 'texture';
      allDescriptors.push(d);
    });
  }

  // Extract metaphors from other notes
  if (reviewData.other_notes) {
    const metaphorDescriptors = extractDescriptorsKeywordBased(
      reviewData.other_notes
    );
    metaphorDescriptors.forEach(d => {
      if (d.type === 'metaphor') {
        allDescriptors.push(d);
      }
    });
  }

  // Remove duplicates
  const uniqueDescriptors = allDescriptors.filter((descriptor, index, self) =>
    index === self.findIndex((d) =>
      d.text.toLowerCase() === descriptor.text.toLowerCase() &&
      d.type === descriptor.type
    )
  );

  return uniqueDescriptors;
}

/**
 * Main extraction function
 */
export function extractFlavorDescriptors(
  text: string,
  options?: {
    type?: 'aroma' | 'flavor' | 'texture' | 'metaphor';
    intensity?: number;
  }
): DescriptorExtractionResult {
  const descriptors = extractDescriptorsWithIntensity(text, options?.intensity);

  // Filter by type if specified
  const filteredDescriptors = options?.type
    ? descriptors.filter(d => d.type === options.type)
    : descriptors;

  return {
    descriptors: filteredDescriptors,
    totalFound: filteredDescriptors.length,
    extractionMethod: 'keyword'
  };
}

/**
 * Get all available categories for a given type
 */
export function getAvailableCategories(type: 'aroma' | 'flavor' | 'texture' | 'metaphor'): string[] {
  return Object.keys(FLAVOR_TAXONOMY[type] || {});
}

/**
 * Get subcategories for a given category
 */
export function getSubcategories(
  type: 'aroma' | 'flavor' | 'texture' | 'metaphor',
  category: string
): string[] {
  const categoryData = FLAVOR_TAXONOMY[type]?.[category];
  return categoryData?.subcategories || [];
}
