import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiSearch } from 'react-icons/fi';
import Sidebar from '../components/Sidebar'; // Import du nouveau Sidebar
import { useAuth } from '../contexts/AuthContext';

function DashboardUserLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const username = user ? `${user.prenom} ${user.nom}` : '...';

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

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
            aria-label="Ouvrir le menu"
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
