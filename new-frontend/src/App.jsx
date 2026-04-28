import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import AppShell from "@/components/layout/app-shell";
import LoginPage from "@/pages/login-page";
import DashboardPage from "@/pages/dashboard-page";
import PlaceholderPage from "@/pages/placeholder-page";

// Marketing OS pages
import LeadEnginePage from "@/pages/marketing/lead-engine-page";
import ManusInboxPage from "@/pages/marketing/manus-inbox-page";
import OfferLibraryPage from "@/pages/marketing/offer-library-page";
import ContentFactoryPage from "@/pages/marketing/content-factory-page";
import SalesEnablementPage from "@/pages/marketing/sales-enablement-page";

// Operations pages
import SetterDashboardPage from "@/pages/setter-dashboard-page";
import GhlAutomationPage from "@/pages/ghl-automation-page";
import VoiceTasksPage from "@/pages/voice-tasks-page";
import TeamHubPage from "@/pages/team-hub-page";

// Analytics pages
import CompetitorAiPage from "@/pages/competitor-ai-page";
import SeoTrackingPage from "@/pages/seo-tracking-page";
import BusinessPerformancePage from "@/pages/business-performance-page";
import BusinessPnlPage from "@/pages/business-pnl-page";
import ContentCalendarPage from "@/pages/content-calendar-page";

// Full-page tools (converted from standalone HTML files)
import KanbanBoardPage from "@/pages/kanban-board-page";
import SimpleTasksPage from "@/pages/simple-tasks-page";
import MissionControlPage from "@/pages/mission-control-page";
import OutsourcerTrackerPage from "@/pages/outsourcer-tracker-page";

// Practice pages
import PracticeDashboardPage from "@/pages/practice-dashboard-page";

// Admin pages
import UserManagementPage from "@/pages/user-management-page";

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

        {/* Marketing OS */}
        <Route path="marketing" element={<PlaceholderPage title="Marketing OS" />} />
        <Route path="marketing/lead-engine" element={<LeadEnginePage />} />
        <Route path="marketing/manus-inbox" element={<ManusInboxPage />} />
        <Route path="marketing/offers" element={<OfferLibraryPage />} />
        <Route path="marketing/content-factory" element={<ContentFactoryPage />} />
        <Route path="marketing/sales" element={<SalesEnablementPage />} />
        <Route path="marketing/setter" element={<SetterDashboardPage />} />
        <Route path="marketing/ghl-automation" element={<GhlAutomationPage />} />
        <Route path="marketing/ads" element={<PlaceholderPage title="Ads Dashboard" />} />
        <Route path="marketing/ghl-dashboard" element={<PlaceholderPage title="GHL Dashboard" />} />
        <Route path="marketing/*" element={<PlaceholderPage title="Marketing OS" />} />

        {/* Core pages */}
        <Route path="voice-tasks" element={<VoiceTasksPage />} />
        <Route path="team-hub" element={<TeamHubPage />} />
        <Route path="competitor-ai" element={<CompetitorAiPage />} />
        <Route path="seo" element={<SeoTrackingPage />} />
        <Route path="content-calendar" element={<ContentCalendarPage />} />
        <Route path="business-performance" element={<BusinessPerformancePage />} />
        <Route path="business-pnl" element={<BusinessPnlPage />} />

        {/* Practice pages */}
        <Route path="practices/:slug" element={<PracticeDashboardPage />} />

        {/* Full-page tools */}
        <Route path="kanban" element={<KanbanBoardPage />} />
        <Route path="simple-tasks" element={<SimpleTasksPage />} />
        <Route path="mission-control" element={<MissionControlPage />} />
        <Route path="outsourcer-tracker" element={<OutsourcerTrackerPage />} />

        {/* Analytics */}
        <Route path="team-scoreboard" element={<PlaceholderPage title="Team Scoreboard" />} />

        {/* Admin */}
        <Route path="user-management" element={<UserManagementPage />} />
        <Route path="settings" element={<PlaceholderPage title="Settings" />} />

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
