import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../state/AuthContext';
import '../styles.css';
import { Layout } from './Layout';
import { ToastProvider } from '../state/ToastContext';
import { LoginPage } from './auth/LoginPage';
import { RegisterPage } from './auth/RegisterPage';
import { SweetsPage } from './sweets/SweetsPage';
import { AdminPage } from './sweets/AdminPage';

const Protected: React.FC<{ admin?: boolean; children: React.ReactNode }> = ({ admin, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !user.roles.includes('ROLE_ADMIN')) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const App: React.FC = () => (
  <AuthProvider>
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<SweetsPage />} />
          <Route path="/admin" element={<Protected admin><AdminPage /></Protected>} />
        </Routes>
      </Layout>
    </ToastProvider>
  </AuthProvider>
);
