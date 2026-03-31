import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './components/Layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailsPage } from './pages/PatientDetailsPage';
import { ReferralsPage } from './pages/ReferralsPage';
import { NewReferralPage } from './pages/NewReferralPage';
import { ReferralDetailsPage } from './pages/ReferralDetailsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminHospitalsPage } from './pages/AdminHospitalsPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected routes with shared layout */}
      <Route
        element={<MainLayout />}
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailsPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/referrals/new" element={<NewReferralPage />} />
        <Route path="/referrals/:id" element={<ReferralDetailsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/hospitals" element={<AdminHospitalsPage />} />
        <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
