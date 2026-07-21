import { useState } from 'react';
import { useAuthStore } from './shared/stores/useAuthStore';
import Login from './features/auth/components/Login';

// Public Marketing Pages
import LandingPage from './features/public/components/LandingPage';
import DocsPortal from './features/public/components/DocsPortal';
import IntegrationsShowcase from './features/public/components/IntegrationsShowcase';

// Customer SaaS Layout & Workspaces
import CustomerLayout from './shared/components/CustomerLayout';
import CustomerHome from './features/customer/components/CustomerHome';
import CustomerProjects from './features/customer/components/CustomerProjects';
import CustomerAnalytics from './features/customer/components/CustomerAnalytics';
import CustomerApiKeys from './features/customer/components/CustomerApiKeys';
import IntegrationsWorkspace from './features/customer/components/IntegrationsWorkspace';
import CustomerTeam from './features/customer/components/CustomerTeam';
import CustomerSettings from './features/customer/components/CustomerSettings';

// Platform Superadmin Shell & Workspaces
import AdminLayout from './shared/components/AdminLayout';
import AdminDashboard from './features/admin/components/AdminDashboard';
import AdminCustomers from './features/admin/components/AdminCustomers';
import AdminProjects from './features/admin/components/AdminProjects';
import AdminApiKeys from './features/admin/components/AdminApiKeys';
import AdminServices from './features/admin/components/AdminServices';
import AdminUsage from './features/admin/components/AdminUsage';
import AdminAuditLogs from './features/admin/components/AdminAuditLogs';

// Internal Low-Level Developer Console Layout
import DashboardLayout from './shared/components/DashboardLayout';
import OverviewDashboard from './features/dashboard/components/OverviewDashboard';
import AnalyticsWorkspace from './features/analytics/components/AnalyticsWorkspace';
import FeatureIntelWorkspace from './features/feature-intelligence/components/FeatureIntelWorkspace';
import ProductHealthWorkspace from './features/product-health/components/ProductHealthWorkspace';
import AIRecommendationsWorkspace from './features/recommendations/components/AIRecommendationsWorkspace';
import ExecutiveAnalytics from './features/executive-analytics/components/ExecutiveAnalytics';
import ProjectAdmin from './features/projects/components/ProjectAdmin';

// 7-Step Onboarding Wizard Modal
import OnboardingWizard7Step from './shared/components/OnboardingWizard7Step';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

export default function App() {
  const { 
    isAuthenticated, 
    user, 
    activeProjectId, 
    portalMode, 
    switchPortalMode, 
    onboardingCompleted, 
    completeOnboarding 
  } = useAuthStore();
  
  // Public Page State ('landing' | 'docs' | 'public-integrations' | 'auth')
  const [publicPage, setPublicPage] = useState<'landing' | 'docs' | 'public-integrations' | 'auth'>('landing');

  // Customer View State (8 core business views)
  const [customerView, setCustomerView] = useState('overview');
  // Admin View State
  const [adminView, setAdminView] = useState('admin-overview');
  // Developer View State
  const [devView, setDevView] = useState('overview');

  const [onboardingOpen, setOnboardingOpen] = useState(!onboardingCompleted);

  // 1. PUBLIC MARKETING WEBSITE & DOCUMENTATION (Unauthenticated Users)
  if (!isAuthenticated) {
    if (publicPage === 'docs') {
      return (
        <DocsPortal 
          onBackToLanding={() => setPublicPage('landing')} 
          onNavigateAuth={() => setPublicPage('auth')} 
        />
      );
    }

    if (publicPage === 'public-integrations') {
      return (
        <IntegrationsShowcase 
          onBackToLanding={() => setPublicPage('landing')} 
          onNavigateAuth={() => setPublicPage('auth')} 
        />
      );
    }

    if (publicPage === 'auth') {
      return <Login onSuccess={() => setCustomerView('overview')} />;
    }

    return (
      <LandingPage 
        onNavigateDocs={() => setPublicPage('docs')} 
        onNavigateIntegrations={() => setPublicPage('public-integrations')} 
        onNavigateAuth={() => setPublicPage('auth')} 
      />
    );
  }

  // 2. PLATFORM SUPERADMIN OPERATOR PORTAL
  if (portalMode === 'superadmin' && user?.isSuperAdmin) {
    return (
      <AdminLayout activeView={adminView} onViewChange={setAdminView}>
        {adminView === 'admin-overview' && (
          <ErrorBoundary>
            <AdminDashboard onNavigate={setAdminView} />
          </ErrorBoundary>
        )}
        {adminView === 'admin-customers' && (
          <ErrorBoundary>
            <AdminCustomers />
          </ErrorBoundary>
        )}
        {adminView === 'admin-projects' && (
          <ErrorBoundary>
            <AdminProjects />
          </ErrorBoundary>
        )}
        {adminView === 'admin-api-keys' && (
          <ErrorBoundary>
            <AdminApiKeys />
          </ErrorBoundary>
        )}
        {adminView === 'admin-services' && (
          <ErrorBoundary>
            <AdminServices />
          </ErrorBoundary>
        )}
        {adminView === 'admin-usage' && (
          <ErrorBoundary>
            <AdminUsage />
          </ErrorBoundary>
        )}
        {adminView === 'admin-audit-logs' && (
          <ErrorBoundary>
            <AdminAuditLogs />
          </ErrorBoundary>
        )}
      </AdminLayout>
    );
  }

  // 3. INTERNAL PLATFORM DEVELOPER MODE (Low-level diagnostic views)
  if (portalMode === 'admin') {
    return (
      <div className="relative">
        <div className="bg-indigo-950 border-b border-indigo-900/60 px-6 py-2 flex items-center justify-between text-xs text-indigo-200 z-50">
          <span>🔧 <strong>Internal Developer Diagnostic Mode</strong> — Inspecting raw microservice telemetry.</span>
          <button
            onClick={() => switchPortalMode('customer')}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition"
          >
            Return to Customer SaaS View →
          </button>
        </div>

        <DashboardLayout activeView={devView} onViewChange={setDevView}>
          {devView === 'overview' && (
            <ErrorBoundary>
              <OverviewDashboard projectId={activeProjectId} />
            </ErrorBoundary>
          )}
          {devView === 'analytics' && (
            <ErrorBoundary>
              <AnalyticsWorkspace projectId={activeProjectId} />
            </ErrorBoundary>
          )}
          {devView === 'feature-intel' && (
            <ErrorBoundary>
              <FeatureIntelWorkspace projectId={activeProjectId} />
            </ErrorBoundary>
          )}
          {devView === 'product-health' && (
            <ErrorBoundary>
              <ProductHealthWorkspace projectId={activeProjectId} />
            </ErrorBoundary>
          )}
          {devView === 'recommendations' && (
            <ErrorBoundary>
              <AIRecommendationsWorkspace projectId={activeProjectId} />
            </ErrorBoundary>
          )}
          {devView === 'executive' && (
            <ErrorBoundary>
              <ExecutiveAnalytics />
            </ErrorBoundary>
          )}
          {devView === 'admin' && (
            <ErrorBoundary>
              <ProjectAdmin />
            </ErrorBoundary>
          )}
        </DashboardLayout>
      </div>
    );
  }

  // 4. CUSTOMER BUSINESS SAAS PORTAL MODE (8 Core Views)
  return (
    <>
      <CustomerLayout 
        activeView={customerView} 
        onViewChange={setCustomerView}
        onLaunchOnboarding={() => setOnboardingOpen(true)}
      >
        {customerView === 'overview' && (
          <ErrorBoundary>
            <CustomerHome 
              onNavigate={setCustomerView} 
              onLaunchOnboarding={() => setOnboardingOpen(true)} 
            />
          </ErrorBoundary>
        )}
        {customerView === 'projects' && (
          <ErrorBoundary>
            <CustomerProjects onNavigate={setCustomerView} />
          </ErrorBoundary>
        )}
        {customerView === 'analytics' && (
          <ErrorBoundary>
            <CustomerAnalytics />
          </ErrorBoundary>
        )}
        {customerView === 'api-keys' && (
          <ErrorBoundary>
            <CustomerApiKeys />
          </ErrorBoundary>
        )}
        {(customerView === 'sdk-installation' || customerView === 'integrations') && (
          <ErrorBoundary>
            <IntegrationsWorkspace />
          </ErrorBoundary>
        )}
        {customerView === 'team' && (
          <ErrorBoundary>
            <CustomerTeam />
          </ErrorBoundary>
        )}
        {customerView === 'settings' && (
          <ErrorBoundary>
            <CustomerSettings />
          </ErrorBoundary>
        )}
      </CustomerLayout>

      {/* 7-Step Guided Onboarding Wizard Modal */}
      {onboardingOpen && (
        <OnboardingWizard7Step
          onComplete={() => {
            completeOnboarding();
            setCustomerView('overview');
            setOnboardingOpen(false);
          }}
          onClose={() => setOnboardingOpen(false)}
        />
      )}
    </>
  );
}
