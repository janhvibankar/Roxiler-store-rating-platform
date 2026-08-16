import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStoresPage from './pages/AdminStoresPage';
import AdminUserDetailsPage from './pages/AdminUserDetailsPage';
import UserStoreListPage from './pages/UserStoreListPage';
import StoreOwnerDashboardPage from './pages/StoreOwnerDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<UserStoreListPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="stores" element={<UserStoreListPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/users/:id" element={<AdminUserDetailsPage />} />
            <Route path="admin/stores" element={<AdminStoresPage />} />
          </Route>

          {/* Protected Store Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
            <Route path="owner/dashboard" element={<StoreOwnerDashboardPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
