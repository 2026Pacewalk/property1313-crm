import { Routes, Route, Navigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Followups from './pages/Followups';
import Visits from './pages/Visits';
import Projects from './pages/Projects';
import PublicProject from './pages/PublicProject';
import LoanInquiry from './pages/LoanInquiry';
import Automation from './pages/Automation';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import WhatsAppTemplates from './pages/WhatsAppTemplates';
import AdminUsers from './pages/AdminUsers';
import AuditLogs from './pages/AuditLogs';
import EditProject from './pages/EditProject';
import MasterDatabase from './pages/MasterDatabase';
import ToastContainer from './components/shared/ToastContainer';
import AppLayout from './components/layout/AppLayout';
import RouteGuard from './components/shared/RouteGuard';
import TemplatePicker from './components/shared/TemplatePicker';
import TemplateEditor from './components/shared/TemplateEditor';

function ProtectedLayout() {
  return (
    <RouteGuard requireAuth>
      <AppLayout />
    </RouteGuard>
  );
}

export default function App() {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<RouteGuard requireAuth={false}><Login /></RouteGuard>} />
          <Route path="/project/:slug" element={<PublicProject />} />

          {/* Protected routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/leads/:id" element={<LeadDetail />} />
            <Route path="/follow-ups" element={<Followups />} />
            <Route path="/visits" element={<Visits />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug/edit" element={<EditProject />} />
            <Route path="/loan-inquiry" element={<LoanInquiry />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/whatsapp-templates" element={<WhatsAppTemplates />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/audit-logs" element={<AuditLogs />} />
            <Route path="/master-database" element={<MasterDatabase />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      {/* Global WhatsApp overlays */}
      <TemplatePicker />
      <TemplateEditor />
      <ToastContainer />
    </>
  );
}
