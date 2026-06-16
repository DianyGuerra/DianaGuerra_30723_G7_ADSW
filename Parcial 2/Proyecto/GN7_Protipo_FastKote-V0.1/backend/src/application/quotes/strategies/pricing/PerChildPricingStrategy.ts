import { PricingInput, PricingResult, PricingStrategy, roundMoney } from './PricingStrategy.js';

export class PerChildPricingStrategy implements PricingStrategy {
  supports(input: PricingInput) {
    return Boolean(input.packageRecord?.pricePerChild);
  }

  calculate(input: PricingInput): PricingResult {
    const minChildren = Number(input.packageRecord.minChildren ?? 1);
    const childrenCount = Math.max(Number(input.childrenCount ?? minChildren), minChildren);
    const unitPrice = Number(input.packageRecord.pricePerChild);
    const subtotal = roundMoney(childrenCount * unitPrice);
    const discount = roundMoney(input.discount ?? 0);
    const tax = roundMoney((subtotal - discount) * input.taxRate);
    const total = roundMoney(subtotal - discount + tax);
    return {
      subtotal,
      discount,
      tax,
      total,
      items: [{
        description: `${input.packageRecord.name} (${childrenCount} niños/personas)`,
        category: 'Paquete por persona',
        quantity: childrenCount,
        unitPrice,
        subtotal,
      }],
    };
  }
}
