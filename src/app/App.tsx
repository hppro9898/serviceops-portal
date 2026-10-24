import { useState } from 'react';
import { TicketListPage } from './components/TicketListPage';
import { ProblemListPage } from './components/ProblemListPage';
import { ChangeListPage } from './components/ChangeListPage';
import { ReleaseListPage } from './components/ReleaseListPage';
import { HardwareAssetsListPage } from './components/HardwareAssetsListPage';
import { SoftwareAssetsListPage } from './components/SoftwareAssetsListPage';
import { NonItAssetsListPage } from './components/NonItAssetsListPage';
import { ConsumableAssetsListPage } from './components/ConsumableAssetsListPage';
import { SoftwareLicensesListPage } from './components/SoftwareLicensesListPage';
import { ContractsListPage } from './components/ContractsListPage';
import { PurchasesListPage } from './components/PurchasesListPage';
import { CmdbListPage } from './components/CmdbListPage';
import { PatchesListPage } from './components/PatchesListPage';
import { PatchDeploymentsListPage } from './components/PatchDeploymentsListPage';
import { EndpointsListPage } from './components/EndpointsListPage';
import { VulnerabilitiesListPage } from './components/VulnerabilitiesListPage';
import { DetectedCvesListPage } from './components/DetectedCvesListPage';
import { BomDashboardPage } from './components/BomDashboardPage';
import { BomDashboard2Page } from './components/BomDashboard2Page';
import { BomInventoryListPage } from './components/BomInventoryListPage';
import { SoftwareComponentsListPage } from './components/SoftwareComponentsListPage';
import { BomVulnerabilitiesListPage } from './components/BomVulnerabilitiesListPage';
import { ComplianceReportsModule } from './components/ComplianceReportsModule';
import { ComplianceReports2Module } from './components/ComplianceReports2Module';
import { AdminPage } from './components/AdminPage';
import { DrawerStackProvider } from './components/DrawerStack';
import { GlobalSearch } from './components/GlobalSearch';
import { BomProductHost } from './components/BomProductHost';
import { Toaster } from 'sonner';

type Page = 'request' | 'problem' | 'change' | 'release' | 'hardware-assets' | 'software-assets' | 'non-it-assets' | 'consumable-assets' | 'software-licenses' | 'contracts' | 'purchases' | 'cmdb' | 'patches' | 'patch-deployments' | 'endpoints' | 'vulnerabilities' | 'detected-cves' | 'bom-dashboard' | 'bom-dashboard-2' | 'bom' | 'bom-vulnerabilities' | 'software-components' | 'ai-components' | 'compliance-reports' | 'compliance-reports-2' | 'admin';

export default function App() {
  /* A standalone export (e.g. the BOM technician HTML) sets window.__START_PAGE__ to land on its
     own module; the app itself still opens on Requests. */
  const [activePage, setActivePage] = useState<Page>(() => ((window as unknown as { __START_PAGE__?: Page }).__START_PAGE__) ?? 'request');
  const navigate = (page: string) => setActivePage(page as Page);
  // A software asset id requested from elsewhere (e.g. the Software License "Managed Softwares" card),
  // consumed by the Software Assets list page to auto-open that asset's detail drawer.
  const [pendingSoftwareAssetId, setPendingSoftwareAssetId] = useState<string | null>(null);
  const openSoftwareAsset = (id: string) => { setPendingSoftwareAssetId(id); setActivePage('software-assets'); };

  return (
    <DrawerStackProvider activePage={activePage}>
      {activePage === 'request' && <TicketListPage onNavigate={navigate} />}
      {activePage === 'problem' && <ProblemListPage onNavigate={navigate} />}
      {activePage === 'change' && <ChangeListPage onNavigate={navigate} />}
      {activePage === 'release' && <ReleaseListPage onNavigate={navigate} />}
      {activePage === 'hardware-assets' && <HardwareAssetsListPage onNavigate={navigate} />}
      {activePage === 'software-assets' && <SoftwareAssetsListPage onNavigate={navigate} initialOpenId={pendingSoftwareAssetId} onInitialOpenConsumed={() => setPendingSoftwareAssetId(null)} />}
      {activePage === 'non-it-assets' && <NonItAssetsListPage onNavigate={navigate} />}
      {activePage === 'consumable-assets' && <ConsumableAssetsListPage onNavigate={navigate} />}
      {activePage === 'software-licenses' && <SoftwareLicensesListPage onNavigate={navigate} onOpenSoftwareAsset={openSoftwareAsset} />}
      {activePage === 'contracts' && <ContractsListPage onNavigate={navigate} />}
      {activePage === 'purchases' && <PurchasesListPage onNavigate={navigate} />}
      {activePage === 'cmdb' && <CmdbListPage onNavigate={navigate} />}
      {activePage === 'patches' && <PatchesListPage onNavigate={navigate} />}
      {activePage === 'patch-deployments' && <PatchDeploymentsListPage onNavigate={navigate} />}
      {activePage === 'endpoints' && <EndpointsListPage onNavigate={navigate} />}
      {activePage === 'vulnerabilities' && <VulnerabilitiesListPage onNavigate={navigate} />}
      {activePage === 'detected-cves' && <DetectedCvesListPage onNavigate={navigate} />}
      {activePage === 'bom-dashboard' && <BomDashboardPage onNavigate={navigate} />}
      {activePage === 'bom-dashboard-2' && <BomDashboard2Page onNavigate={navigate} />}
      {activePage === 'bom' && <BomInventoryListPage onNavigate={navigate} />}
      {activePage === 'bom-vulnerabilities' && <BomVulnerabilitiesListPage onNavigate={navigate} />}
      {/* One page, two halves — which half is the ROUTE now, not a tab inside it, so the rail can
          land on either and a link can name one. */}
      {activePage === 'software-components' && <SoftwareComponentsListPage onNavigate={navigate} tab="components" />}
      {activePage === 'ai-components' && <SoftwareComponentsListPage onNavigate={navigate} tab="models" />}
      {activePage === 'compliance-reports' && <ComplianceReportsModule onNavigate={navigate} />}
      {activePage === 'compliance-reports-2' && <ComplianceReports2Module onNavigate={navigate} />}
      {activePage === 'admin' && <AdminPage onNavigate={navigate} />}
      {/* Mounted once, inside the drawer host, so search works on every page and can open any
          module's real detail drawer as a tab. */}
      <GlobalSearch activePage={activePage} onNavigate={navigate} />
      {/* Add product (Agent / Ingest) — one form, opened from BOM › Products and Admin › BOM Scope. */}
      <BomProductHost />
      <Toaster position="top-right" />
    </DrawerStackProvider>
  );
}
