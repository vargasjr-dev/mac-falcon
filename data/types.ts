export interface BomItem {
  qty: number;
  part: string;
  source: string;
  priceUsd: number; // in cents
  url?: string;
  notes?: string;
}

export type ProductSpecs = Record<string, string>;
