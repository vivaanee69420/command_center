import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import AppShell from "@/components/layout/app-shell";
import LoginPage from "@/pages/login-page";
import DashboardPage from "@/pages/dashboard-page";
import PlaceholderPage from "@/pages/placeholder-page";

// Core pages
import BusinessesPage from "@/pages/businesses-page";
import PracticeDashboardPage from "@/pages/practice-dashboard-page";
import ProjectsPage from "@/pages/projects-page";
import CrmPage from "@/pages/crm-page";
import LeadsPage from "@/pages/leads-page";
import ConversationsPage from "@/pages/conversations-page";
import TeamHubPage from "@/pages/team-hub-page";
import DailyRoutinesPage from "@/pages/daily-routines-page";
import ContentCalendarPage from "@/pages/content-calendar-page";
import DocumentsPage from "@/pages/documents-page";

// Marketing OS pages
import MarketingOverviewPage from "@/pages/marketing/marketing-overview-page";
import LeadEnginePage from "@/pages/marketing/lead-engine-page";
import ManusInboxPage from "@/pages/marketing/manus-inbox-page";
import OfferLibraryPage from "@/pages/marketing/offer-library-page";
import ContentFactoryPage from "@/pages/marketing/content-factory-page";
import SalesEnablementPage from "@/pages/marketing/sales-enablement-page";
import AdsDashboardPage from "@/pages/marketing/ads-dashboard-page";
import GhlDashboardPage from "@/pages/marketing/ghl-dashboard-page";

// Growth pages
import SeoTrackingPage from "@/pages/seo-tracking-page";
import BacklinksPage from "@/pages/backlinks-page";
import CompetitorAiPage from "@/pages/competitor-ai-page";

// Intelligence pages
import AiBrainPage from "@/pages/ai-brain-page";
import MarketIntelPage from "@/pages/market-intel-page";
import BusinessPerformancePage from "@/pages/business-performance-page";
import InsightsPage from "@/pages/insights-page";
import BusinessPnlPage from "@/pages/business-pnl-page";

// Operations pages
import SetterDashboardPage from "@/pages/setter-dashboard-page";
import GhlAutomationPage from "@/pages/ghl-automation-page";
import VoiceTasksPage from "@/pages/voice-tasks-page";

// Full-page tools
import KanbanBoardPage from "@/pages/kanban-board-page";
import SimpleTasksPage from "@/pages/simple-tasks-page";
import MissionControlPage from "@/pages/mission-control-page";
import OutsourcerTrackerPage from "@/pages/outsourcer-tracker-page";

// Automation pages
import IntegrationsPage from "@/pages/integrations-page";
import NotificationsPage from "@/pages/notifications-page";

// Admin pages
import UserManagementPage from "@/pages/user-management-page";
import SettingsPage from "@/pages/settings-page";
import HelpPage from "@/pages/help-page";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />

        {/* Core */}
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="crm" element={<CrmPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="team-hub" element={<TeamHubPage />} />
        <Route path="daily-routines" element={<DailyRoutinesPage />} />
        <Route path="content-calendar" element={<ContentCalendarPage />} />
        <Route path="documents" element={<DocumentsPage />} />

        {/* Marketing OS */}
        <Route path="marketing" element={<MarketingOverviewPage />} />
        <Route path="marketing/lead-engine" element={<LeadEnginePage />} />
        <Route path="marketing/manus-inbox" element={<ManusInboxPage />} />
        <Route path="marketing/offers" element={<OfferLibraryPage />} />
        <Route path="marketing/content-factory" element={<ContentFactoryPage />} />
        <Route path="marketing/sales" element={<SalesEnablementPage />} />
        <Route path="marketing/setter" element={<SetterDashboardPage />} />
        <Route path="marketing/ghl-automation" element={<GhlAutomationPage />} />
        <Route path="marketing/ads" element={<AdsDashboardPage />} />
        <Route path="marketing/ghl-dashboard" element={<GhlDashboardPage />} />

        {/* Growth */}
        <Route path="seo" element={<SeoTrackingPage />} />
        <Route path="backlinks" element={<BacklinksPage />} />
        <Route path="competitor-ai" element={<CompetitorAiPage />} />

        {/* Intelligence */}
        <Route path="ai-brain" element={<AiBrainPage />} />
        <Route path="market-intel" element={<MarketIntelPage />} />
        <Route path="business-performance" element={<BusinessPerformancePage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="business-pnl" element={<BusinessPnlPage />} />

        {/* Practice pages */}
        <Route path="practices/:slug" element={<PracticeDashboardPage />} />

        {/* Full-page tools */}
        <Route path="kanban" element={<KanbanBoardPage />} />
        <Route path="simple-tasks" element={<SimpleTasksPage />} />
        <Route path="mission-control" element={<MissionControlPage />} />
        <Route path="outsourcer-tracker" element={<OutsourcerTrackerPage />} />
        <Route path="voice-tasks" element={<VoiceTasksPage />} />

        {/* Automation */}
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />

        {/* Admin */}
        <Route path="user-management" element={<UserManagementPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />

        <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
