export interface QuoteItemInput {
  description: string;
  category?: string;
  quantity: number;
  unitPrice: number;
}

export interface PricingInput {
  packageRecord?: any;
  childrenCount?: number;
  customItems?: QuoteItemInput[];
  discount?: number;
  taxRate: number;
}

export interface PricingResult {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: Array<QuoteItemInput & { subtotal: number }>;
}

export interface PricingStrategy {
  supports(input: PricingInput): boolean;
  calculate(input: PricingInput): PricingResult;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
