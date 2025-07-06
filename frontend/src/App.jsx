/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import SymptomInput from './pages/patient/SymptomInput';
import DoctorBrowse from './pages/patient/DoctorBrowse';
import BookAppointment from './pages/patient/BookAppointment';
import PatientHistory from './pages/patient/PatientHistory';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import PatientDetails from './pages/doctor/PatientDetails';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAvailability from './pages/doctor/DoctorAvailability';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageUsers from './pages/admin/ManageUsers';
import MonitorAppointments from './pages/admin/MonitorAppointments';
import AILogs from './pages/admin/AILogs';

// Auth Context
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col w-full">
          <Navbar />
          <main className="flex-1 w-full">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Patient Routes */}
              <Route path="/patient" element={<ProtectedRoute role="patient"><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="symptoms" element={<SymptomInput />} />
                <Route path="doctors" element={<DoctorBrowse />} />
                <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
                <Route path="history" element={<PatientHistory />} />
                <Route path="profile" element={<PatientProfile />} />
              </Route>
              
              {/* Doctor Routes */}
              <Route path="/doctor" element={<ProtectedRoute role="doctor"><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="patient/:patientId" element={<PatientDetails />} />
                <Route path="profile" element={<DoctorProfile />} />
                <Route path="availability" element={<DoctorAvailability />} />
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin"><Outlet /></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="doctors" element={<ManageDoctors />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="appointments" element={<MonitorAppointments />} />
                <Route path="ai-logs" element={<AILogs />} />
              </Route>
              
              {/* Redirect to appropriate dashboard based on user role */}
              <Route path="/dashboard" element={<DashboardRedirect />} />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Protected Route Component
function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

// Dashboard Redirect Component
function DashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'patient':
      return <Navigate to="/patient/dashboard" replace />;
    case 'doctor':
      return <Navigate to="/doctor/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

export default App;
