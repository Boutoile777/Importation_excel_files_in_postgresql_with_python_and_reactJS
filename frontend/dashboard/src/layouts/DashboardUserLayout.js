import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  FiHome, FiHelpCircle, FiUpload, FiClock, FiUser, FiX, FiMenu, FiLogOut, FiSearch, FiTool,
} from 'react-icons/fi';
import logo from '../assets/logo.png';

function DashboardUserLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          console.error('Utilisateur non connecté :', data.error);
        }
      } catch (error) {
        console.error('Erreur de récupération de l’utilisateur :', error);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    console.log('Déconnexion...');
    navigate('/');
  };

  const username = user ? `${user.prenom} ${user.nom}` : 'Chargement...';

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
      isActive
        ? 'bg-green-600 text-white shadow'
        : 'text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white p-4 border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        {/* Fermer menu mobile */}
        <div className="flex justify-end mb-4 md:hidden">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Fermer le menu"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src={logo} alt="Logo" className="h-24 select-none" />
        </div>

        {/* Navigation */}
        <nav className="space-y-4 flex-grow">
          <NavLink to="/dashboard" end className={linkClasses}>
            <FiHome /> Accueil
          </NavLink>
          <NavLink to="/dashboard/comment-ca-marche" className={linkClasses}>
            <FiHelpCircle /> Fonctionnement
          </NavLink>
          <NavLink to="/dashboard/facilite" className={linkClasses}>
            <FiTool /> Facilité
          </NavLink>
          <NavLink to="/dashboard/importer" className={linkClasses}>
            <FiUpload /> Importer des données
          </NavLink>
          <NavLink to="/dashboard/historique" className={linkClasses}>
            <FiClock /> Historique
          </NavLink>
        </nav>

        <NavLink to="/dashboard/mon-compte" className={linkClasses}>
          <FiUser /> Mon compte
        </NavLink>
      </aside>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Contenu principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="w-full h-16 bg-white flex items-center justify-between px-4 md:px-6 border-b border-gray-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900 md:hidden"
            aria-label="Ouvrir le menu"
          >
            <FiMenu size={24} />
          </button>

          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md mx-4 md:mx-0">
            <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Profil + déconnexion */}
          <div className="flex items-center space-x-4 ml-4">
            <span className="text-gray-700 font-medium hidden sm:inline select-none">
              Bonjour, <span className="text-green-600">{username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              aria-label="Se déconnecter"
            >
              <FiLogOut />
              <Link to="/" className="hover:underline hidden sm:inline">
                Se déconnecter
              </Link>
            </button>
          </div>
        </header>

        {/* Contenu des pages enfants */}
        <main className="flex-1 overflow-auto p-6 md:p-10 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardUserLayout;
