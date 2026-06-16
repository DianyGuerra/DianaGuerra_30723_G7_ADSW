import { Mediator } from '../../application/mediator/Mediator.js';
import { LoginUserHandler } from '../../application/auth/LoginUser.handler.js';
import { ListClientsHandler } from '../../application/clients/ListClients.handler.js';
import { GetClientHandler } from '../../application/clients/GetClient.handler.js';
import { CreateClientHandler } from '../../application/clients/CreateClient.handler.js';
import { UpdateClientHandler } from '../../application/clients/UpdateClient.handler.js';
import { ListEmployeesHandler } from '../../application/employees/ListEmployees.handler.js';
import { CreateEmployeeHandler } from '../../application/employees/CreateEmployee.handler.js';
import { UpdateEmployeeHandler } from '../../application/employees/UpdateEmployee.handler.js';
import { DeactivateEmployeeHandler } from '../../application/employees/DeactivateEmployee.handler.js';
import { AssignRolesHandler } from '../../application/employees/AssignRoles.handler.js';
import { ListRolesHandler } from '../../application/employees/ListRoles.handler.js';
import { ListQuotesHandler } from '../../application/quotes/ListQuotes.handler.js';
import { CreateQuoteHandler } from '../../application/quotes/CreateQuote.handler.js';
import { UpdateQuoteHandler } from '../../application/quotes/UpdateQuote.handler.js';
import { UpdateQuoteStatusHandler } from '../../application/quotes/UpdateQuoteStatus.handler.js';
import { ListCalendarHandler } from '../../application/quotes/ListCalendar.handler.js';
import { ListPackagesHandler } from '../../application/quotes/ListPackages.handler.js';
import { GenerateQuotePdfHandler } from '../../application/quotes/GenerateQuotePdf.handler.js';
import { SendQuoteWhatsAppHandler } from '../../application/quotes/SendQuoteWhatsApp.handler.js';
import { PricingContext } from '../../application/quotes/strategies/pricing/PricingContext.js';
import { QuoteStatusContext } from '../../application/quotes/strategies/status/QuoteStatusContext.js';
import { PrismaAuthRepository } from '../../infrastructure/repositories/PrismaAuthRepository.js';
import { PrismaClientRepository } from '../../infrastructure/repositories/PrismaClientRepository.js';
import { PrismaEmployeeRepository } from '../../infrastructure/repositories/PrismaEmployeeRepository.js';
import { PrismaQuoteRepository } from '../../infrastructure/repositories/PrismaQuoteRepository.js';
import { JwtService } from '../../infrastructure/services/JwtService.js';
import { PasswordHasher } from '../../infrastructure/services/PasswordHasher.js';
import { PdfQuoteService } from '../../infrastructure/services/PdfQuoteService.js';
import { WhatsAppGateway } from '../../infrastructure/services/WhatsAppGateway.js';

export function createMediator() {
  const mediator = new Mediator();

  const authRepository = new PrismaAuthRepository();
  const clientRepository = new PrismaClientRepository();
  const employeeRepository = new PrismaEmployeeRepository();
  const quoteRepository = new PrismaQuoteRepository();
  const pricingContext = new PricingContext();
  const statusContext = new QuoteStatusContext();
  const pdfService = new PdfQuoteService();
  const whatsappGateway = new WhatsAppGateway();

  mediator.register('auth.login', new LoginUserHandler(authRepository, new PasswordHasher(), new JwtService()));

  mediator.register('clients.list', new ListClientsHandler(clientRepository));
  mediator.register('clients.get', new GetClientHandler(clientRepository));
  mediator.register('clients.create', new CreateClientHandler(clientRepository));
  mediator.register('clients.update', new UpdateClientHandler(clientRepository));

  mediator.register('employees.list', new ListEmployeesHandler(employeeRepository));
  mediator.register('employees.create', new CreateEmployeeHandler(employeeRepository, new PasswordHasher()));
  mediator.register('employees.update', new UpdateEmployeeHandler(employeeRepository));
  mediator.register('employees.deactivate', new DeactivateEmployeeHandler(employeeRepository));
  mediator.register('employees.assignRoles', new AssignRolesHandler(employeeRepository));
  mediator.register('roles.list', new ListRolesHandler(employeeRepository));

  mediator.register('quotes.list', new ListQuotesHandler(quoteRepository));
  mediator.register('quotes.create', new CreateQuoteHandler(quoteRepository, pricingContext));
  mediator.register('quotes.update', new UpdateQuoteHandler(quoteRepository, pricingContext));
  mediator.register('quotes.updateStatus', new UpdateQuoteStatusHandler(quoteRepository, statusContext));
  mediator.register('quotes.pdf', new GenerateQuotePdfHandler(quoteRepository, pdfService));
  mediator.register('quotes.sendWhatsapp', new SendQuoteWhatsAppHandler(quoteRepository, pdfService, whatsappGateway));
  mediator.register('calendar.list', new ListCalendarHandler(quoteRepository));
  mediator.register('catalog.packages', new ListPackagesHandler(quoteRepository));

  return mediator;
}
