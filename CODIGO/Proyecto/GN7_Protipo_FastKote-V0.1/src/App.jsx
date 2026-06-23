import { useMemo, useState } from "react";
import { useNavigationController } from "./controllers/useNavigationController";
import { usePackagesController } from "./controllers/usePackagesController";
import { useQuotesController } from "./controllers/useQuotesController";
import { useServicesController } from "./controllers/useServicesController";
import { useSuppliesController } from "./controllers/useSuppliesController";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginScreen } from "./components/layout/LoginScreen";
import { clientsSeed } from "./models/clients.model";
import { fastKoteCatalog } from "./services/catalogAdapter.service";
import { runSelfChecks } from "./tests/selfChecks";
import { CalendarView } from "./views/CalendarView";
import { ClientsView } from "./views/ClientsView";
import { DashboardView } from "./views/DashboardView";
import { EmployeesView } from "./views/EmployeesView";
import { PackagesView } from "./views/PackagesView";
import { PromotionsView } from "./views/PromotionsView";
import { QuotesView } from "./views/QuotesView";
import { ServicesView } from "./views/ServicesView";
import { SuppliesView } from "./views/SuppliesView";

export default function FastKotePrototype() {
  const navigation = useNavigationController();
  const [notice, setNotice] = useState("");
  const clients = clientsSeed;
  const promotions = fastKoteCatalog.promotions;
  const eventTypes = fastKoteCatalog.eventTypes;

  const suppliesController = useSuppliesController({ setNotice });
  const servicesController = useServicesController({
    supplies: suppliesController.supplies,
    setNotice,
    initialServices: fastKoteCatalog.services,
  });
  const packagesController = usePackagesController({
    services: servicesController.services,
    supplies: suppliesController.supplies,
    setNotice,
    initialPackages: fastKoteCatalog.packages,
  });
  const quotesController = useQuotesController({
    clients,
    packages: packagesController.packages,
    services: servicesController.services,
    supplies: suppliesController.supplies,
    promotions,
    setNotice,
  });

  const checks = useMemo(
    () =>
      runSelfChecks({
        clients,
        quotes: quotesController.quotes,
        packages: packagesController.packages,
        services: servicesController.services,
        supplies: suppliesController.supplies,
        promotions,
        quoteViews: quotesController.quoteViews,
        packageMetrics: packagesController.packageMetrics,
        serviceMetrics: servicesController.serviceMetrics,
        calendarEntries: quotesController.calendarEntries,
        catalogLoaded: fastKoteCatalog.catalogLoaded,
      }),
    [
      clients,
      quotesController.quotes,
      packagesController.packages,
      servicesController.services,
      suppliesController.supplies,
      promotions,
      quotesController.quoteViews,
      packagesController.packageMetrics,
      servicesController.serviceMetrics,
      quotesController.calendarEntries,
    ],
  );

  if (!navigation.logged) return <LoginScreen onLogin={navigation.login} />;

  const viewProps = {
    clients,
    promotions,
    eventTypes,
    catalogLoaded: fastKoteCatalog.catalogLoaded,
    supplies: suppliesController.supplies,
    services: servicesController.services,
    packages: packagesController.packages,
    serviceMetrics: servicesController.serviceMetrics,
    packageMetrics: packagesController.packageMetrics,
    quoteViews: quotesController.quoteViews,
    calendarEntries: quotesController.calendarEntries,
  };

  return (
    <AppLayout navigation={navigation} notice={notice} clearNotice={() => setNotice("")} checks={checks}>
      {navigation.active === "dashboard" && (
        <DashboardView
          {...viewProps}
          setActive={navigation.setActive}
        />
      )}
      {navigation.active === "cotizaciones" && (
        <QuotesView
          {...viewProps}
          onCreateQuote={quotesController.createQuote}
          onStartEditQuote={quotesController.startEditQuote}
          onSaveQuoteVersion={quotesController.saveQuoteVersion}
          onGeneratePdf={quotesController.generatePdf}
          onSendWhatsapp={quotesController.sendWhatsapp}
          onUpdateStatus={quotesController.updateQuoteStatus}
        />
      )}
      {navigation.active === "clientes" && <ClientsView clients={clients} />}
      {navigation.active === "calendario" && <CalendarView calendarEntries={quotesController.calendarEntries} />}
      {navigation.active === "paquetes" && (
        <PackagesView
          {...viewProps}
          onSavePackage={packagesController.savePackage}
          onTogglePackage={packagesController.togglePackage}
        />
      )}
      {navigation.active === "promociones" && <PromotionsView promotions={promotions} />}
      {navigation.active === "servicios" && (
        <ServicesView
          {...viewProps}
          onSaveService={servicesController.saveService}
          onToggleService={servicesController.toggleService}
        />
      )}
      {navigation.active === "insumos" && (
        <SuppliesView
          {...viewProps}
          onSaveSupply={suppliesController.saveSupply}
          onToggleSupply={suppliesController.toggleSupply}
        />
      )}
      {navigation.active === "empleados" && <EmployeesView />}
    </AppLayout>
  );
}
