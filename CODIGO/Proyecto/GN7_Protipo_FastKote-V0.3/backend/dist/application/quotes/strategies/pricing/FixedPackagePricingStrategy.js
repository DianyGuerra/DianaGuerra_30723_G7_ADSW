import { roundMoney } from './PricingStrategy.js';
export class FixedPackagePricingStrategy {
    supports(input) {
        return Boolean(input.packageRecord?.basePrice) && !input.customItems?.length;
    }
    calculate(input) {
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
