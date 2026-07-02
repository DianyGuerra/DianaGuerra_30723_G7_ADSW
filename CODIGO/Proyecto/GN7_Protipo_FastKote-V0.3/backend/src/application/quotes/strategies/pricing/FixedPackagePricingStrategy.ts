import { PricingInput, PricingResult, PricingStrategy, roundMoney } from './PricingStrategy.js';

export class FixedPackagePricingStrategy implements PricingStrategy {
  supports(input: PricingInput) {
    return Boolean(input.packageRecord?.basePrice) && !input.customItems?.length;
  }

  calculate(input: PricingInput): PricingResult {
    const price = Number(input.packageRecord.basePrice);
    const items = [{
      description: input.packageRecord.name,
      category: 'Paquete base',
      quantity: 1,
      unitPrice: price,
      subtotal: price,
    }];
    const subtotal = roundMoney(price);
    const discount = roundMoney(input.discount ?? 0);
    const tax = roundMoney((subtotal - discount) * input.taxRate);
    const total = roundMoney(subtotal - discount + tax);
    return { subtotal, discount, tax, total, items };
  }
}
