import { Routes, Route } from 'react-router';
import { Analytics } from '@vercel/analytics/react';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Projects from './pages/Projects';
import Visits from './pages/Visits';
import Followups from './pages/Followups';
import LoanInquiry from './pages/LoanInquiry';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import Automation from './pages/Automation';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import NotificationsPage from './pages/Notifications';
import PublicProject from './pages/PublicProject';
import AdminUsers from './pages/AdminUsers';
import AuditLogs from './pages/AuditLogs';
import EditProject from './pages/EditProject';
import MasterDatabase from './pages/MasterDatabase';
import Profile from './pages/Profile';
import ToastContainer from './components/shared/ToastContainer';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/project/:slug" element={<PublicProject />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/:id" element={<Leads />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug/edit" element={<EditProject />} />
          <Route path="/visits" element={<Visits />} />
          <Route path="/follow-ups" element={<Followups />} />
          <Route path="/loan-inquiry" element={<LoanInquiry />} />
          <Route path="/whatsapp-templates" element={<WhatsAppTemplates />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
          <Route path="/master-database" element={<MasterDatabase />} />
        </Route>
      </Routes>
      <ToastContainer />
      <Analytics />
    </>
  );
}
