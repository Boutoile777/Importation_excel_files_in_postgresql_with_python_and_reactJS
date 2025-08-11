import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import AdminRoute from './components/AdminRoute';

import SignIn from './pages/signin';
import SignUp from './pages/signup';
import ForgotPassword from './pages/forgotpasseword';
import ResetPassword from './pages/ResetPassword';
import ForceChangePassword from './pages/ForceChangePassword';

import DashboardUserLayout from './layouts/DashboardUserLayout';
import Home from './pages/Home';
import CommentCaMarche from './pages/CommentCaMarche';
import ImporterDonnees from './pages/ImporterDonnees';
import Historique from './pages/Historique';
import MonCompte from './pages/MonCompte';
import Facilite from './pages/Facilite';
import Ex from './pages/Ex';
import ProjetsParFacilite from './pages/ProjetsParFacilite';
import ToutesOperationsPage from './pages/ToutesOperationsPage';

// Composant pour protéger les routes privées
const PrivateRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (user.force_password_change) {
    return <Navigate to="/force-change-password" />;
  }

  return <Outlet />;
};

// Composant pour protéger uniquement la page ForceChangePassword
const ForceChangePasswordRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (!user.force_password_change) {
    return <Navigate to="/dashboard" />;
  }

  return <ForceChangePassword />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />

          {/* Routes publiques */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpasseword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Route pour forcer le changement de mot de passe */}
          <Route path="/force-change-password" element={<ForceChangePassword />} />

          {/* Routes privées dans le layout Dashboard */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardUserLayout />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/dashboard/comment-ca-marche" element={<CommentCaMarche />} />
              
              <Route path="/dashboard/ex" element={<Ex />} />

              {/* Routes réservées aux admins */}
              <Route element={<AdminRoute />}>
                
                <Route path="/dashboard/historique" element={<Historique />} />
                <Route path="/dashboard/facilite" element={<Facilite />} />
              </Route>

              {/* Routes accessibles à tous les utilisateurs connectés */}
              <Route path="/dashboard/mon-compte" element={<MonCompte />} />
              <Route path="/dashboard/importer" element={<ImporterDonnees />} />
              <Route path="/dashboard/facilites/toutes-operations" element={<ToutesOperationsPage />} />
              <Route path="/dashboard/facilites/:id_type_projet" element={<ProjetsParFacilite />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
