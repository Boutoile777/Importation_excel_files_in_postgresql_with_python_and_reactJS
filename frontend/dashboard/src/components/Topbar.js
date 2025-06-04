import React from 'react';
import { FiUser } from 'react-icons/fi';

function Topbar({ userName = 'César' }) {
  return (
    <header className="bg-gradient-to-r from-green-500 to-green-700 text-white flex justify-between items-center px-8 py-4 shadow-md">
      <div className="text-lg font-light tracking-wide">
        Bonjour, <span className="font-semibold">{userName}</span> 👋
      </div>

      <div
        className="flex items-center gap-3 cursor-pointer rounded-full bg-green-600 bg-opacity-30 
                   px-3 py-1 hover:bg-opacity-50 transition duration-300 ease-in-out"
        title="Mon profil"
      >
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md text-green-700">
          <FiUser className="text-xl" />
        </div>
        <span className="hidden sm:inline text-sm font-medium select-none">Mon profil</span>
      </div>
    </header>
  );
}

export default Topbar;
