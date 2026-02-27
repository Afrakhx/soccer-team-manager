import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/pages/DashboardPage';
import { RosterPage } from '@/pages/RosterPage';
import { PlayerProfilePage } from '@/pages/PlayerProfilePage';
import { SchedulePage } from '@/pages/SchedulePage';
import { AttendanceListPage } from '@/pages/AttendanceListPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { CoachLoginPage } from '@/pages/CoachLoginPage';
import { ParentAccessPage } from '@/pages/ParentAccessPage';
import { ParentViewPage } from '@/pages/ParentViewPage';
import { CoachesCornerPage } from '@/pages/CoachesCornerPage';

function ProtectedRoutes() {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppShell />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<CoachLoginPage />} />
      <Route path="/parent" element={<ParentAccessPage />} />
      <Route path="/parent/:accessCode" element={<ParentViewPage />} />

      {/* Protected coach routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/roster" element={<RosterPage />} />
        <Route path="/players/:playerId" element={<PlayerProfilePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/attendance" element={<AttendanceListPage />} />
        <Route path="/attendance/:eventId" element={<AttendancePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/coaches-corner" element={<CoachesCornerPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
