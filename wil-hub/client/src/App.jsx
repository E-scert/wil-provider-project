import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import RegisterChoice from './pages/RegisterChoice.jsx';
import RegisterStudent from './pages/RegisterStudent.jsx';
import RegisterCompany from './pages/RegisterCompany.jsx';
import RegisterInstitution from './pages/RegisterInstitution.jsx';
import ProgramListings from './pages/ProgramListings.jsx';

import StudentDashboard from './pages/student/StudentDashboard.jsx';
import StudentApplications from './pages/student/StudentApplications.jsx';
import StudentMatches from './pages/student/StudentMatches.jsx';
import StudentPlacements from './pages/student/StudentPlacements.jsx';

import CompanyDashboard from './pages/company/CompanyDashboard.jsx';
import CompanyPrograms from './pages/company/CompanyPrograms.jsx';
import CompanyApplicants from './pages/company/CompanyApplicants.jsx';
import CompanyPlacements from './pages/company/CompanyPlacements.jsx';

import InstitutionDashboard from './pages/institution/InstitutionDashboard.jsx';
import InstitutionStudents from './pages/institution/InstitutionStudents.jsx';
import InstitutionPrograms from './pages/institution/InstitutionPrograms.jsx';
import InstitutionMatches from './pages/institution/InstitutionMatches.jsx';
import InstitutionPlacements from './pages/institution/InstitutionPlacements.jsx';
import InstitutionReports from './pages/institution/InstitutionReports.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminCompanies from './pages/admin/AdminCompanies.jsx';
import AdminInstitutions from './pages/admin/AdminInstitutions.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/student" element={<RegisterStudent />} />
          <Route path="/register/company" element={<RegisterCompany />} />
          <Route path="/register/institution" element={<RegisterInstitution />} />
          <Route path="/programs" element={<ProgramListings />} />

          <Route path="/student" element={<ProtectedRoute allow={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/matches" element={<ProtectedRoute allow={['student']}><StudentMatches /></ProtectedRoute>} />
          <Route path="/student/applications" element={<ProtectedRoute allow={['student']}><StudentApplications /></ProtectedRoute>} />
          <Route path="/student/placements" element={<ProtectedRoute allow={['student']}><StudentPlacements /></ProtectedRoute>} />

          <Route path="/company" element={<ProtectedRoute allow={['company_admin']}><CompanyDashboard /></ProtectedRoute>} />
          <Route path="/company/programs" element={<ProtectedRoute allow={['company_admin']}><CompanyPrograms /></ProtectedRoute>} />
          <Route path="/company/applicants" element={<ProtectedRoute allow={['company_admin']}><CompanyApplicants /></ProtectedRoute>} />
          <Route path="/company/placements" element={<ProtectedRoute allow={['company_admin']}><CompanyPlacements /></ProtectedRoute>} />

          <Route path="/institution" element={<ProtectedRoute allow={['institution_admin']}><InstitutionDashboard /></ProtectedRoute>} />
          <Route path="/institution/students" element={<ProtectedRoute allow={['institution_admin']}><InstitutionStudents /></ProtectedRoute>} />
          <Route path="/institution/programs" element={<ProtectedRoute allow={['institution_admin']}><InstitutionPrograms /></ProtectedRoute>} />
          <Route path="/institution/matches" element={<ProtectedRoute allow={['institution_admin']}><InstitutionMatches /></ProtectedRoute>} />
          <Route path="/institution/placements" element={<ProtectedRoute allow={['institution_admin']}><InstitutionPlacements /></ProtectedRoute>} />
          <Route path="/institution/reports" element={<ProtectedRoute allow={['institution_admin']}><InstitutionReports /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allow={['super_admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/companies" element={<ProtectedRoute allow={['super_admin']}><AdminCompanies /></ProtectedRoute>} />
          <Route path="/admin/institutions" element={<ProtectedRoute allow={['super_admin']}><AdminInstitutions /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allow={['super_admin']}><AdminUsers /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}
