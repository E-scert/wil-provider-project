import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import SignupStudent from './pages/SignupStudent.jsx';
import SignupCompany from './pages/SignupCompany.jsx';
import ProgramListings from './pages/ProgramListings.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentDocuments from './pages/student/StudentDocuments.jsx';
import StudentApplications from './pages/student/StudentApplications.jsx';

import CompanyDashboard from './pages/company/CompanyDashboard.jsx';
import CompanyPrograms from './pages/company/CompanyPrograms.jsx';
import CompanyApplicants from './pages/company/CompanyApplicants.jsx';

import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminTable from './pages/admin/AdminTable.jsx';

function RoleHome() {
  const { role } = useAuth();
  if (role === 'student') return <Navigate to="/student" replace />;
  if (role === 'company') return <Navigate to="/company" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/programs" replace />;
}

export default function App() {
  const { session } = useAuth();

  return (
    <>
      {session && <Navbar />}
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup/student" element={<SignupStudent />} />
          <Route path="/signup/company" element={<SignupCompany />} />
          <Route path="/programs" element={<ProgramListings />} />

          <Route path="/" element={<ProtectedRoute><RoleHome /></ProtectedRoute>} />

          <Route path="/student" element={<ProtectedRoute allow={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/documents" element={<ProtectedRoute allow={['student']}><StudentDocuments /></ProtectedRoute>} />
          <Route path="/student/applications" element={<ProtectedRoute allow={['student']}><StudentApplications /></ProtectedRoute>} />

          <Route path="/company" element={<ProtectedRoute allow={['company']}><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/programs" element={<ProtectedRoute allow={['company']}><CompanyPrograms /></ProtectedRoute>} />
          <Route path="/company/applicants" element={<ProtectedRoute allow={['company']}><CompanyApplicants /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allow={['admin']}><AdminOverview /></ProtectedRoute>} />
          <Route path="/admin/table/:table" element={<ProtectedRoute allow={['admin']}><AdminTable /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/programs" replace />} />
        </Routes>
      </main>
    </>
  );
}
