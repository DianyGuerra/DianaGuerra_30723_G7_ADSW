import { CustomPricingStrategy } from './CustomPricingStrategy.js';
import { FixedPackagePricingStrategy } from './FixedPackagePricingStrategy.js';
import { PerChildPricingStrategy } from './PerChildPricingStrategy.js';
import { PricingInput, PricingResult, PricingStrategy } from './PricingStrategy.js';

export class PricingContext {
  private readonly strategies: PricingStrategy[] = [
    new CustomPricingStrategy(),
    new PerChildPricingStrategy(),
    new FixedPackagePricingStrategy(),
  ];

  calculate(input: PricingInput): PricingResult {
    const strategy = this.strategies.find((candidate) => candidate.supports(input));
    if (!strategy) {
      throw new Error('No existe una estrategia de cálculo para la cotización enviada.');
    }
    return strategy.calculate(input);
  }
}
