export interface BomItem {
  qty: number;
  part: string;
  source: string;
  priceUsd: number; // in cents
  url?: string;
  notes?: string;
  /**
   * bulk: buy ahead in batches — cheap, reusable, worth pre-kitting
   * per_order: source per order — expensive/specialized, no benefit to holding stock
   * in_house: Mac Falcon produces/prints this itself
   * digital: no physical procurement needed
   */
  procure: "bulk" | "per_order" | "in_house" | "digital";
  /**
   * Suggested batch size when procure === "bulk"
   */
  batchSize?: number;
}

export type ProductSpecs = Record<string, string>;
