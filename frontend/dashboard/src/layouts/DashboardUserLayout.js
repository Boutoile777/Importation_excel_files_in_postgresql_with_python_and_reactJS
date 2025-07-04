import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  FiHome, FiHelpCircle, FiUpload, FiClock, FiUser, FiX, FiMenu,
  FiLogOut, FiSearch, FiTool, FiChevronDown, FiChevronUp,
} from 'react-icons/fi';
import logo from '../assets/logo.png';

function DashboardUserLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFacilitesOpen, setIsFacilitesOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [facilites, setFacilites] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          method: 'GET',
          credentials: 'include',
        });
        const data = await response.json();
        if (response.ok) setUser(data);
      } catch (error) {
        console.error('Erreur de récupération utilisateur :', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchFacilites = async () => {
      try {
        const res = await fetch('http://localhost:5000/auth/types_projets', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Erreur lors du chargement des facilités');
        const data = await res.json();
        setFacilites(data);
      } catch (error) {
        console.error('Erreur récupération facilités :', error);
      }
    };
    fetchFacilites();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const username = user ? `${user.prenom} ${user.nom}` : '...';

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? 'bg-green-600 text-white shadow-sm'
        : 'text-gray-700 hover:bg-gray-100 hover:text-green-700'
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white p-5 border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Logo & fermeture */}
        <div className="flex justify-between items-center mb-4 md:hidden">
          <img src={logo} alt="Logo" className="h-14" />
          <button onClick={() => setIsSidebarOpen(false)} aria-label="Fermer le menu">
            <FiX className="text-gray-600 hover:text-red-500" size={24} />
          </button>
        </div>

        {/* Logo en desktop */}
        <div className="hidden md:flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-20 select-none" />
        </div>

        {/* Navigation scrollable */}
        <nav className="flex flex-col gap-2 overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
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
            <FiUpload /> Importer
          </NavLink>
          <NavLink to="/dashboard/historique" className={linkClasses}>
            <FiClock /> Historique
          </NavLink>

          {/* Sous-menu Facilités accordées */}
          <div>
            <button
              onClick={() => setIsFacilitesOpen(!isFacilitesOpen)}
              className="flex items-center w-full justify-between px-4 py-2.5 text-gray-700 hover:text-green-700 hover:bg-gray-100 rounded-lg font-medium transition-all"
            >
              <span className="flex items-center gap-3">
                <FiTool /> Facilités accordées
              </span>
              {isFacilitesOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            <div
              className={`mt-2 ml-6 space-y-1 overflow-hidden transition-all duration-300 ${
                isFacilitesOpen ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <NavLink
                to="/dashboard/facilites/toutes-operations"
                className={linkClasses}
              >
                Toutes les opérations
              </NavLink>
              {facilites.map((f) => (
                <NavLink
                  key={f.id_type_projet}
                  to={`/dashboard/facilites/${f.id_type_projet}`}
                  className={linkClasses}
                >
                  {f.nom_facilite}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Mon compte en bas */}
        <div className="mt-4">
          <NavLink to="/dashboard/mon-compte" className={linkClasses}>
            <FiUser /> Mon compte
          </NavLink>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
        />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-gray-600 hover:text-green-600"
          >
            <FiMenu size={24} />
          </button>

          <div className="relative w-full max-w-md mx-4">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline font-medium text-gray-700">
              Bonjour, <span className="text-green-600">{username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
            >
              <FiLogOut />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </header>

        {/* Outlet = contenu des pages enfants */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardUserLayout;
