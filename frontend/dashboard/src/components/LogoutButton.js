import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
      Déconnexion
    </button>
  );
}

export default LogoutButton;
