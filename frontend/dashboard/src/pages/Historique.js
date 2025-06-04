import React from 'react';
import { FiClock } from 'react-icons/fi';

function Historique() {
  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <h2 className="text-4xl  md:text-5xl font-extrabold text-green-700 mb-6">Historique</h2>

      <div className="w-full max-w-2xl bg-gray-50   p-8 flex flex-col items-center text-center space-y-6 mt-10">
        <FiClock className="text-green-500" size={60} />
        <p className="text-xl font-semibold text-gray-700">
          Aucun historique pour le moment
        </p>
        <p className="text-gray-500">
          Toutes les opérations effectuées (importations, modifications, suppressions)
          apparaîtront ici dès qu’elles auront lieu.
        </p>
        <p className="text-sm text-gray-400 italic">
          Revenez après avoir effectué une première action.
        </p>
      </div>
    </div>
  );
}

export default Historique;
