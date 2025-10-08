/**
 * Review Categories and Location Data
 * 
 * Defines all available categories and location options for reviews
 */

export const REVIEW_CATEGORIES = [
  'Red Wine',
  'White Wine',
  'Wine',
  'Coffee',
  'Beer',
  'Gin',
  'Whisky',
  'Scotch',
  'Bourbon',
  'Rum',
  'Mezcal',
  'Agave Spirit',
  'Sotol',
  'Raicilla',
  'Perfume',
  'Olive Oil',
  'Chips',
  'Snacks',
  'Chocolate',
  'Dessert',
  'Cheese',
  'Meat'
] as const;

export type ReviewCategory = typeof REVIEW_CATEGORIES[number];

export const COUNTRIES = [
  'United States',
  'Mexico',
  'France',
  'Italy',
  'Spain',
  'Germany',
  'United Kingdom',
  'Canada',
  'Australia',
  'New Zealand',
  'Argentina',
  'Chile',
  'Brazil',
  'Colombia',
  'Peru',
  'Japan',
  'China',
  'India',
  'South Africa',
  'Portugal',
  'Greece',
  'Austria',
  'Switzerland',
  'Belgium',
  'Netherlands',
  'Ireland',
  'Scotland',
  'Other'
] as const;

export type Country = typeof COUNTRIES[number];

// US States
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
] as const;

// Mexican States
export const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato',
  'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos',
  'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro',
  'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
  'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
] as const;

/**
 * Get states for a specific country
 */
export function getStatesForCountry(country: string): readonly string[] {
  switch (country) {
    case 'United States':
      return US_STATES;
    case 'Mexico':
      return MEXICAN_STATES;
    default:
      return [];
  }
}

/**
 * Check if a country has states/provinces
 */
export function hasStates(country: string): boolean {
  return country === 'United States' || country === 'Mexico';
}

