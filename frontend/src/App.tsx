import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import MainLayout from './layouts/MainLayout'
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ServicesPage from './pages/ServicesPage'
import ServiceDetailsPage from './pages/ServiceDetailsPage'

import CustomerDashboardPage from './pages/CustomerDashboardPage'
import BookAppointmentPage from './pages/BookAppointmentPage'
import MyAppointmentsPage from './pages/MyAppointmentsPage'

import AdminDashboardPage from './pages/AdminDashboardPage'
import ManageAppointmentsPage from './pages/ManageAppointmentsPage'
import ManageServicesPage from './pages/ManageServicesPage'
import CreateServicePage from './pages/CreateServicePage'
import EditServicePage from './pages/EditServicePage'

import NotFoundPage from './pages/NotFoundPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailsPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Customer routes */}
          <Route element={<ProtectedRoute role="Customer" />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
              <Route path="/customer/book" element={<BookAppointmentPage />} />
              <Route path="/customer/appointments" element={<MyAppointmentsPage />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute role="Admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/appointments" element={<ManageAppointmentsPage />} />
              <Route path="/admin/services" element={<ManageServicesPage />} />
              <Route path="/admin/services/new" element={<CreateServicePage />} />
              <Route path="/admin/services/:id/edit" element={<EditServicePage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

