import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiHelpCircle, FiUpload, FiClock, FiUser, FiX, FiTool, FiChevronDown, FiChevronUp,FiUserPlus,
} from 'react-icons/fi';
import logo from '../assets/logo.png';
import { useAuth } from '../contexts/AuthContext';

function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const [isFacilitesOpen, setIsFacilitesOpen] = useState(false);
  const [facilites, setFacilites] = useState([]);

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

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
      isActive
        ? 'bg-green-600 text-white shadow-sm'
        : 'text-gray-700 hover:bg-gray-100 hover:text-green-700'
    }`;

  if (!user) {
    return null;
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-64 bg-white p-5 border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col`}
    >
      <div className="flex justify-between items-center mb-4 md:hidden">
        <img src={logo} alt="Logo" className="h-14" />
        <button onClick={() => setIsOpen(false)} aria-label="Fermer le menu">
          <FiX className="text-gray-600 hover:text-red-500" size={24} />
        </button>
      </div>

      <div className="hidden md:flex justify-center mb-6">
        <img src={logo} alt="Logo" className="h-20 select-none" />
      </div>

      <nav className="flex flex-col gap-2 overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {/* Options visibles par tous */}
        <NavLink to="/dashboard" end className={linkClasses}>
          <FiHome /> Accueil
        </NavLink>

        <NavLink to="/dashboard/comment-ca-marche" className={linkClasses}>
          <FiHelpCircle /> Fonctionnement
        </NavLink>

        <NavLink to="/dashboard/importer" className={linkClasses}>
          <FiUpload /> Importer
        </NavLink>

        {/* Le lien "Facilité" visible uniquement admin */}
        {user.admin && (
          <NavLink to="/dashboard/facilite" className={linkClasses}>
            <FiTool /> Facilité
          </NavLink>
        )}

        {user.admin && (
          <NavLink to="/dashboard/signup" className={linkClasses}>
            <FiUserPlus /> Add User
          </NavLink>
        )}

        {/* Sous-menu Facilités accordées visible par tous */}
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
            {/* "Toutes les opérations" visible par tous */}
            <NavLink
              to="/dashboard/facilites/toutes-operations"
              className={linkClasses}
            >
              Toutes les opérations
            </NavLink>

            {/* Liste des facilités */}
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

        {/* Option Historique visible seulement admin */}
        {user.admin && (
          <NavLink to="/dashboard/historique" className={linkClasses}>
            <FiClock /> Historique
          </NavLink>
        )}

        {/* Mon compte visible par tous */}
        <div className="mt-4">
          <NavLink to="/dashboard/mon-compte" className={linkClasses}>
            <FiUser /> Mon compte
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
