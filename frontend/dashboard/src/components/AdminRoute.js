import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = () => {
  const { user } = useAuth();

  if (!user) {
    // Pas connecté => redirection vers signin
    return <Navigate to="/signin" />;
  }

  if (!user.admin) {
    // Connecté mais pas admin => redirection vers dashboard
    return <Navigate to="/dashboard" />;
  }

  // Si admin, autorisation d'accéder aux routes enfants
  return <Outlet />;
};

export default AdminRoute;
