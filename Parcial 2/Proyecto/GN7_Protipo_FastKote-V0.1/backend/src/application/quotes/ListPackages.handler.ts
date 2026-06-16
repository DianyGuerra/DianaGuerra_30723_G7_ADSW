import { RequestHandler } from '../mediator/Mediator.js';
import { QuoteRepository } from '../../domain/repositories/QuoteRepository.js';

export class ListPackagesHandler implements RequestHandler {
  constructor(private readonly repository: QuoteRepository) {}

  handle() {
    return this.repository.listPackages();
  }
}
