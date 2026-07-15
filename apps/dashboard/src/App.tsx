import { useState } from 'react';
import { useAuthStore } from './shared/stores/useAuthStore';
import Login from './features/auth/components/Login';
import DashboardLayout from './shared/components/DashboardLayout';
import OverviewDashboard from './features/dashboard/components/OverviewDashboard';
import AnalyticsWorkspace from './features/analytics/components/AnalyticsWorkspace';
import FeatureIntelWorkspace from './features/feature-intelligence/components/FeatureIntelWorkspace';
import ProductHealthWorkspace from './features/product-health/components/ProductHealthWorkspace';
import AIRecommendationsWorkspace from './features/recommendations/components/AIRecommendationsWorkspace';
import ExecutiveAnalytics from './features/executive-analytics/components/ExecutiveAnalytics';
import ProjectAdmin from './features/projects/components/ProjectAdmin';
import { ErrorBoundary } from './shared/components/ErrorBoundary';

export default function App() {
  const { isAuthenticated, activeProjectId } = useAuthStore();
  const [activeView, setActiveView] = useState('overview');

  if (!isAuthenticated) {
    return <Login onSuccess={() => setActiveView('overview')} />;
  }

  return (
    <DashboardLayout activeView={activeView} onViewChange={setActiveView}>
      {activeView === 'overview' && (
        <ErrorBoundary>
          <OverviewDashboard projectId={activeProjectId} />
        </ErrorBoundary>
      )}
      {activeView === 'analytics' && (
        <ErrorBoundary>
          <AnalyticsWorkspace projectId={activeProjectId} />
        </ErrorBoundary>
      )}
      {activeView === 'feature-intel' && (
        <ErrorBoundary>
          <FeatureIntelWorkspace projectId={activeProjectId} />
        </ErrorBoundary>
      )}
      {activeView === 'product-health' && (
        <ErrorBoundary>
          <ProductHealthWorkspace projectId={activeProjectId} />
        </ErrorBoundary>
      )}
      {activeView === 'recommendations' && (
        <ErrorBoundary>
          <AIRecommendationsWorkspace projectId={activeProjectId} />
        </ErrorBoundary>
      )}
      {activeView === 'executive' && (
        <ErrorBoundary>
          <ExecutiveAnalytics />
        </ErrorBoundary>
      )}
      {activeView === 'admin' && (
        <ErrorBoundary>
          <ProjectAdmin />
        </ErrorBoundary>
      )}
    </DashboardLayout>
  );
}
