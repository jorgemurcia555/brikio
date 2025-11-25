export interface UnitOption {
  value: string;
  label: string;
  abbreviation: string;
}

export const UNIT_OPTIONS: UnitOption[] = [
  { value: 'm²', label: 'Square Meter', abbreviation: 'm²' },
  { value: 'ft²', label: 'Square Foot', abbreviation: 'ft²' },
  { value: 'ml', label: 'Linear Meter', abbreviation: 'ml' },
  { value: 'ft', label: 'Linear Foot', abbreviation: 'ft' },
  { value: 'm³', label: 'Cubic Meter', abbreviation: 'm³' },
  { value: 'kg', label: 'Kilogram', abbreviation: 'kg' },
  { value: 'lb', label: 'Pound', abbreviation: 'lb' },
  { value: 'saco', label: 'Bag', abbreviation: 'saco' },
  { value: 'pza', label: 'Piece', abbreviation: 'pza' },
  { value: 'l', label: 'Liter', abbreviation: 'l' },
  { value: 'gal', label: 'Gallon', abbreviation: 'gal' },
  { value: 'ton', label: 'Ton', abbreviation: 'ton' },
  { value: 'hr', label: 'Hour', abbreviation: 'hr' },
  { value: 'day', label: 'Day', abbreviation: 'day' },
  { value: 'unit', label: 'Unit', abbreviation: 'unit' },
];

