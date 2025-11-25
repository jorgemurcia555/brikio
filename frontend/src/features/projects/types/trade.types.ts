export type TradeSpecialtyId =
  | 'general-construction'
  | 'remodeling'
  | 'masonry-concrete'
  | 'carpentry-framing'
  | 'drywall-ceilings'
  | 'roofing'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'painting-finishing'
  | 'flooring'
  | 'landscaping-exteriors'
  | 'windows-doors'
  | 'metal-welding'
  | 'insulation'
  | 'interiors-cabinetry';

export interface TradeSpecialty {
  id: TradeSpecialtyId;
  label: string;
  labelEs: string;
}

export interface ResourceTemplate {
  id: string;
  tradeId: TradeSpecialtyId;
  label: string; // nombre corto que se ve en el chip
  description: string; // descripción que va al item
  defaultUnit: string; // 'm²', 'ft²', 'pieza', 'hr', etc.
  defaultQuantity: number;
  icon?: string; // nombre del icono de lucide-react
}

