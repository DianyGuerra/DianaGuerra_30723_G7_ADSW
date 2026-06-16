import { PricingInput, PricingResult, PricingStrategy, roundMoney } from './PricingStrategy.js';

export class CustomPricingStrategy implements PricingStrategy {
  supports(input: PricingInput) {
    return Boolean(input.customItems?.length);
  }

  calculate(input: PricingInput): PricingResult {
    const items = (input.customItems ?? []).map((item) => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: roundMoney(Number(item.quantity) * Number(item.unitPrice)),
    }));

    const subtotal = roundMoney(items.reduce((sum, item) => sum + item.subtotal, 0));
    const discount = roundMoney(input.discount ?? 0);
    const tax = roundMoney((subtotal - discount) * input.taxRate);
    const total = roundMoney(subtotal - discount + tax);
    return { subtotal, discount, tax, total, items };
  }
}
