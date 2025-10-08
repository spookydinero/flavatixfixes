/**
 * Tasting Templates Library
 * Industry-standard templates for various tasting categories
 */

export interface TastingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: TemplateField[];
  scoringMethod?: 'sum' | 'average' | 'weighted';
  maxScore?: number;
  icon?: string;
  isOfficial?: boolean;
}

export interface TemplateField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'slider' | 'select' | 'multiselect' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  weight?: number; // For weighted scoring
  category?: 'aroma' | 'flavor' | 'texture' | 'appearance' | 'overall';
}

// Study Mode specific template interfaces
export interface StudyModeTemplateCategory {
  name: string;
  hasText: boolean;
  hasScale: boolean;
  hasBoolean: boolean;
  scaleMax?: number;
  rankInSummary: boolean;
  sortOrder?: number;
}

export interface StudyModeTemplate {
  id: string;
  name: string;
  description: string;
  baseCategory: string;
  categories: StudyModeTemplateCategory[];
  isSystemTemplate: boolean;
}

/**
 * CMS Wine Grid Template
 * Court of Master Sommeliers Deductive Tasting Grid
 */
export const CMS_WINE_GRID: TastingTemplate = {
  id: 'cms-wine-grid',
  name: 'CMS Wine Grid',
  description: 'Court of Master Sommeliers Deductive Tasting Grid - Industry standard for wine evaluation',
  category: 'wine',
  isOfficial: true,
  icon: '🍷',
  scoringMethod: 'weighted',
  maxScore: 100,
  fields: [
    // Appearance
    {
      id: 'clarity',
      label: 'Clarity',
      type: 'select',
      category: 'appearance',
      required: true,
      options: ['Clear', 'Hazy', 'Cloudy'],
      weight: 5
    },
    {
      id: 'intensity',
      label: 'Intensity',
      type: 'select',
      category: 'appearance',
      required: true,
      options: ['Pale', 'Medium', 'Deep'],
      weight: 5
    },
    {
      id: 'color',
      label: 'Color',
      type: 'select',
      category: 'appearance',
      required: true,
      options: ['Straw', 'Yellow', 'Gold', 'Amber', 'Pink', 'Salmon', 'Copper', 'Ruby', 'Purple', 'Garnet', 'Tawny', 'Brown'],
      weight: 5
    },
    // Nose
    {
      id: 'condition',
      label: 'Condition',
      type: 'select',
      category: 'aroma',
      required: true,
      options: ['Clean', 'Unclean'],
      weight: 5
    },
    {
      id: 'intensity_nose',
      label: 'Intensity (Nose)',
      type: 'select',
      category: 'aroma',
      required: true,
      options: ['Light', 'Medium', 'Pronounced'],
      weight: 5
    },
    {
      id: 'aroma_characteristics',
      label: 'Aroma Characteristics',
      type: 'multiselect',
      category: 'aroma',
      required: true,
      options: ['Fruit', 'Floral', 'Spice', 'Earth', 'Oak', 'Other'],
      weight: 15
    },
    {
      id: 'aroma_notes',
      label: 'Specific Aroma Notes',
      type: 'textarea',
      category: 'aroma',
      placeholder: 'Describe specific aromas detected...',
      weight: 10
    },
    // Palate
    {
      id: 'sweetness',
      label: 'Sweetness',
      type: 'select',
      category: 'flavor',
      required: true,
      options: ['Bone Dry', 'Dry', 'Off-Dry', 'Medium Sweet', 'Sweet', 'Luscious'],
      weight: 5
    },
    {
      id: 'acidity',
      label: 'Acidity',
      type: 'select',
      category: 'flavor',
      required: true,
      options: ['Low', 'Medium Minus', 'Medium', 'Medium Plus', 'High'],
      weight: 5
    },
    {
      id: 'tannin',
      label: 'Tannin',
      type: 'select',
      category: 'flavor',
      required: true,
      options: ['Low', 'Medium Minus', 'Medium', 'Medium Plus', 'High'],
      weight: 5
    },
    {
      id: 'alcohol',
      label: 'Alcohol',
      type: 'select',
      category: 'flavor',
      required: true,
      options: ['Low', 'Medium', 'High'],
      weight: 5
    },
    {
      id: 'body',
      label: 'Body',
      type: 'select',
      category: 'texture',
      required: true,
      options: ['Light', 'Medium', 'Full'],
      weight: 5
    },
    {
      id: 'flavor_intensity',
      label: 'Flavor Intensity',
      type: 'select',
      category: 'flavor',
      required: true,
      options: ['Delicate', 'Medium', 'Powerful'],
      weight: 5
    },
    {
      id: 'flavor_characteristics',
      label: 'Flavor Characteristics',
      type: 'multiselect',
      category: 'flavor',
      required: true,
      options: ['Fruit', 'Floral', 'Spice', 'Earth', 'Oak', 'Other'],
      weight: 10
    },
    {
      id: 'finish',
      label: 'Finish',
      type: 'select',
      category: 'flavor',
      required: true,
      options: ['Short', 'Medium', 'Long'],
      weight: 5
    },
    // Conclusions
    {
      id: 'quality_level',
      label: 'Quality Level',
      type: 'select',
      category: 'overall',
      required: true,
      options: ['Faulty', 'Poor', 'Acceptable', 'Good', 'Very Good', 'Outstanding'],
      weight: 10
    }
  ]
};

/**
 * SCA Coffee Cupping Form
 * Specialty Coffee Association Standard Cupping Protocol
 */
export const SCA_COFFEE_CUPPING: TastingTemplate = {
  id: 'sca-coffee-cupping',
  name: 'SCA Coffee Cupping Form',
  description: 'Specialty Coffee Association standard cupping protocol for coffee evaluation',
  category: 'coffee',
  isOfficial: true,
  icon: '☕',
  scoringMethod: 'sum',
  maxScore: 100,
  fields: [
    {
      id: 'fragrance_aroma',
      label: 'Fragrance/Aroma',
      type: 'slider',
      category: 'aroma',
      required: true,
      min: 6,
      max: 10,
      step: 0.25,
      weight: 1
    },
    {
      id: 'flavor',
      label: 'Flavor',
      type: 'slider',
      category: 'flavor',
      required: true,
      min: 6,
      max: 10,
      step: 0.25,
      weight: 1
    },
    {
      id: 'aftertaste',
      label: 'Aftertaste',
      type: 'slider',
      category: 'flavor',
      required: true,
      min: 6,
      max: 10,
      step: 0.25,
      weight: 1
    },
    {
      id: 'acidity',
      label: 'Acidity',
      type: 'slider',
      category: 'flavor',
      required: true,
      min: 6,
      max: 10,
      step: 0.25,
      weight: 1
    },
    {
      id: 'body',
      label: 'Body',
      type: 'slider',
      category: 'texture',
      required: true,
      min: 6,
      max: 10,
      step: 0.25,
      weight: 1
    },
    {
      id: 'balance',
      label: 'Balance',
      type: 'slider',
      category: 'overall',
      required: true,
      min: 6,
      max: 10,
      step: 0.25,
      weight: 1
    },
    {
      id: 'uniformity',
      label: 'Uniformity',
      type: 'slider',
      category: 'overall',
      required: true,
      min: 0,
      max: 10,
      step: 2,
      weight: 1
    },
    {
      id: 'clean_cup',
      label: 'Clean Cup',
      type: 'slider',
      category: 'overall',
      required: true,
      min: 0,
      max: 10,
      step: 2,
      weight: 1
    },
    {
      id: 'sweetness',
      label: 'Sweetness',
      type: 'slider',
      category: 'flavor',
      required: true,
      min: 0,
      max: 10,
      step: 2,
      weight: 1
    },
    {
      id: 'overall',
      label: 'Overall',
      type: 'slider',
      category: 'overall',
      required: true,
      min: 6,
      max: 10,
      step: 0.25,
      weight: 1
    },
    {
      id: 'defects',
      label: 'Defects',
      type: 'number',
      category: 'overall',
      min: 0,
      max: 10,
      placeholder: 'Number of defects found',
      weight: -1
    },
    {
      id: 'notes',
      label: 'Cupping Notes',
      type: 'textarea',
      category: 'overall',
      placeholder: 'Detailed tasting notes...'
    }
  ]
};

/**
 * Whiskey Tasting Template
 * Comprehensive whiskey evaluation form
 */
export const WHISKEY_TASTING: TastingTemplate = {
  id: 'whiskey-tasting',
  name: 'Whiskey Tasting Wheel',
  description: 'Comprehensive whiskey evaluation template based on industry standards',
  category: 'spirits',
  icon: '🥃',
  scoringMethod: 'average',
  maxScore: 100,
  fields: [
    {
      id: 'appearance',
      label: 'Appearance',
      type: 'select',
      category: 'appearance',
      options: ['Clear', 'Pale Gold', 'Gold', 'Amber', 'Deep Amber', 'Copper', 'Mahogany'],
      weight: 10
    },
    {
      id: 'nose_intensity',
      label: 'Nose Intensity',
      type: 'slider',
      category: 'aroma',
      min: 1,
      max: 10,
      step: 1,
      weight: 15
    },
    {
      id: 'nose_notes',
      label: 'Nose Notes',
      type: 'multiselect',
      category: 'aroma',
      options: ['Vanilla', 'Caramel', 'Oak', 'Smoke', 'Peat', 'Fruit', 'Spice', 'Floral', 'Honey', 'Chocolate', 'Nuts', 'Leather'],
      weight: 20
    },
    {
      id: 'palate_sweetness',
      label: 'Sweetness',
      type: 'slider',
      category: 'flavor',
      min: 1,
      max: 10,
      step: 1,
      weight: 10
    },
    {
      id: 'palate_spice',
      label: 'Spice',
      type: 'slider',
      category: 'flavor',
      min: 1,
      max: 10,
      step: 1,
      weight: 10
    },
    {
      id: 'body',
      label: 'Body',
      type: 'select',
      category: 'texture',
      options: ['Light', 'Medium-Light', 'Medium', 'Medium-Full', 'Full'],
      weight: 10
    },
    {
      id: 'finish_length',
      label: 'Finish Length',
      type: 'slider',
      category: 'flavor',
      min: 1,
      max: 10,
      step: 1,
      weight: 15
    },
    {
      id: 'overall_score',
      label: 'Overall Score',
      type: 'slider',
      category: 'overall',
      min: 1,
      max: 100,
      step: 1,
      weight: 10
    }
  ]
};

// Export all templates
export const ALL_TEMPLATES: TastingTemplate[] = [
  CMS_WINE_GRID,
  SCA_COFFEE_CUPPING,
  WHISKEY_TASTING
];

// Helper function to get template by ID
export function getTemplateById(id: string): TastingTemplate | undefined {
  return ALL_TEMPLATES.find(t => t.id === id);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): TastingTemplate[] {
  return ALL_TEMPLATES.filter(t => t.category === category);
}

// Study Mode Templates
export const STUDY_MODE_TEMPLATES: StudyModeTemplate[] = [
  {
    id: 'cms-red-wine',
    name: 'CMS Red Wine',
    description: 'Court of Master Sommeliers approved red wine tasting template',
    baseCategory: 'Red Wine',
    isSystemTemplate: true,
    categories: [
      { name: 'Appearance', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 1 },
      { name: 'Clarity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 2 },
      { name: 'Brightness', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 3 },
      { name: 'Nose - Condition', hasText: true, hasScale: false, hasBoolean: true, rankInSummary: false, sortOrder: 4 },
      { name: 'Nose - Intensity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 5 },
      { name: 'Nose - Fruit Character', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 6 },
      { name: 'Palate - Acidity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 7 },
      { name: 'Palate - Tannin', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 8 },
      { name: 'Palate - Body', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 9 },
      { name: 'Palate - Flavor Character', hasText: true, hasScale: false, hasBoolean: false, rankInSummary: false, sortOrder: 10 },
      { name: 'Finish - Length', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 11 },
      { name: 'Complexity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 12 },
      { name: 'Overall Quality', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 13 }
    ]
  },
  {
    id: 'cms-white-wine',
    name: 'CMS White Wine',
    description: 'Court of Master Sommeliers approved white wine tasting template',
    baseCategory: 'White Wine',
    isSystemTemplate: true,
    categories: [
      { name: 'Appearance', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 1 },
      { name: 'Clarity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 2 },
      { name: 'Brightness', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 3 },
      { name: 'Nose - Condition', hasText: true, hasScale: false, hasBoolean: true, rankInSummary: false, sortOrder: 4 },
      { name: 'Nose - Intensity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 5 },
      { name: 'Nose - Fruit Character', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 6 },
      { name: 'Palate - Acidity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 7 },
      { name: 'Palate - Body', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 8 },
      { name: 'Palate - Flavor Character', hasText: true, hasScale: false, hasBoolean: false, rankInSummary: false, sortOrder: 9 },
      { name: 'Finish - Length', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 10 },
      { name: 'Complexity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 11 },
      { name: 'Overall Quality', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 12 }
    ]
  },
  {
    id: 'bjcp-beer',
    name: 'BJCP Beer',
    description: 'Beer Judge Certification Program tasting template',
    baseCategory: 'Beer',
    isSystemTemplate: true,
    categories: [
      { name: 'Aroma - Malt', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 1 },
      { name: 'Aroma - Hops', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 2 },
      { name: 'Appearance - Clarity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 3 },
      { name: 'Appearance - Head', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 4 },
      { name: 'Flavor - Malt', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 5 },
      { name: 'Flavor - Hops', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 6 },
      { name: 'Flavor - Bitterness', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 7 },
      { name: 'Flavor - Balance', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 8 },
      { name: 'Mouthfeel - Body', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 9 },
      { name: 'Mouthfeel - Carbonation', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 10 },
      { name: 'Overall Impression', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 11 }
    ]
  },
  {
    id: 'flavatix-mezcal',
    name: 'Flavatix Mezcal',
    description: 'Comprehensive mezcal and agave spirits tasting template',
    baseCategory: 'Mezcal',
    isSystemTemplate: true,
    categories: [
      { name: 'Appearance - Clarity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 1 },
      { name: 'Appearance - Pearls', hasText: true, hasScale: false, hasBoolean: true, rankInSummary: false, sortOrder: 2 },
      { name: 'Nose - Intensity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 3 },
      { name: 'Nose - Smoke Character', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 4 },
      { name: 'Nose - Agave Expression', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 5 },
      { name: 'Nose - Terroir Notes', hasText: true, hasScale: false, hasBoolean: false, rankInSummary: false, sortOrder: 6 },
      { name: 'Palate - Texture', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 7 },
      { name: 'Palate - Alcohol Integration', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 8 },
      { name: 'Palate - Complexity', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 9 },
      { name: 'Finish - Length', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 10 },
      { name: 'Overall Quality', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 11 }
    ]
  },
  {
    id: 'sca-coffee',
    name: 'SCA Coffee',
    description: 'Specialty Coffee Association cupping protocol',
    baseCategory: 'Coffee',
    isSystemTemplate: true,
    categories: [
      { name: 'Fragrance/Aroma', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 1 },
      { name: 'Flavor', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 2 },
      { name: 'Aftertaste', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 3 },
      { name: 'Acidity - Quality', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 4 },
      { name: 'Body - Quality', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 5 },
      { name: 'Balance', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 6 },
      { name: 'Sweetness', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 7 },
      { name: 'Clean Cup', hasText: false, hasScale: false, hasBoolean: true, rankInSummary: false, sortOrder: 8 },
      { name: 'Uniformity', hasText: false, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: false, sortOrder: 9 },
      { name: 'Overall', hasText: true, hasScale: true, hasBoolean: false, scaleMax: 100, rankInSummary: true, sortOrder: 10 },
      { name: 'Defects', hasText: true, hasScale: false, hasBoolean: false, rankInSummary: false, sortOrder: 11 }
    ]
  }
];

export function getStudyModeTemplateById(id: string): StudyModeTemplate | undefined {
  return STUDY_MODE_TEMPLATES.find(t => t.id === id);
}

export function getStudyModeTemplatesByCategory(category: string): StudyModeTemplate[] {
  return STUDY_MODE_TEMPLATES.filter(t =>
    t.baseCategory.toLowerCase().includes(category.toLowerCase())
  );
}

