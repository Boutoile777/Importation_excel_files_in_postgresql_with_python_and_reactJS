import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import SignIn from './pages/signin';
import SignUp from './pages/signup';
import ForgotPassword from './pages/forgotpasseword';

import DashboardUserLayout from './layouts/DashboardUserLayout';
import Home from './pages/Home';
import CommentCaMarche from './pages/CommentCaMarche';
import ImporterDonnees from './pages/ImporterDonnees';
import Historique from './pages/Historique';
import MonCompte from './pages/MonCompte';
import Facilite from './pages/Facilite';
import Ex from './pages/Ex';
import ToutesOperationsPage from './pages/ToutesOperationsPage';
 // 🆕 Import ajouté

// Composant pour protéger les routes privées
const PrivateRoute = ({ element }) => {
  const { user } = useAuth();
  return user ? element : <Navigate to="/signin" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirection vers /signin à la racine */}
          <Route path="/" element={<Navigate to="/signin" />} />

          {/* Routes publiques */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgotpasseword" element={<ForgotPassword />} />

          {/* Routes privées dans le layout Dashboard */}
          <Route element={<PrivateRoute element={<DashboardUserLayout />} />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/dashboard/comment-ca-marche" element={<CommentCaMarche />} />
            <Route path="/dashboard/facilite" element={<Facilite />} />
            <Route path="/dashboard/ex" element={<Ex />} />
            <Route path="/dashboard/importer" element={<ImporterDonnees />} />
            <Route path="/dashboard/historique" element={<Historique />} />
            <Route path="/dashboard/mon-compte" element={<MonCompte />} />
            <Route path="/dashboard/facilites/toutes-operations" element={<ToutesOperationsPage />} />
 {/* 🆕 Route ajoutée */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
