import React, { useEffect, useState } from 'react';
import { FiClock, FiCheckCircle, FiXCircle, FiTrash2 } from 'react-icons/fi';

function Historique() {
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    setLoading(true);
    fetch('http://localhost:5000/auth/history', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors du chargement de l'historique");
        return res.json();
      })
      .then((data) => {
        setHistorique(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet historique ?")) return;

    setDeletingId(id);
    fetch(`http://localhost:5000/auth/history/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la suppression");
        setHistorique(historique.filter(item => item.id !== id));
      })
      .catch(err => alert(err.message))
      .finally(() => setDeletingId(null));
  };

  const handleDeleteAll = () => {
    if (!window.confirm("Voulez-vous vraiment supprimer **tous** les historiques ?")) return;

    setDeletingAll(true);
    fetch(`http://localhost:5000/auth/history`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur lors de la suppression de tous les historiques");
        setHistorique([]);
        setCurrentPage(1);
      })
      .catch(err => alert(err.message))
      .finally(() => setDeletingAll(false));
  };

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = historique.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(historique.length / itemsPerPage);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <h2 className="text-4xl md:text-5xl font-extrabold text-green-700 mb-6">Historique</h2>

      {loading && (
        <div className="flex flex-col items-center text-center mt-10">
          <FiClock className="text-green-500 animate-spin" size={60} aria-label="Chargement" />
          <p className="text-xl font-semibold text-gray-700 mt-4">Chargement...</p>
        </div>
      )}

      {error && (
        <div className="mt-10 max-w-2xl text-center text-red-600 font-semibold">{error}</div>
      )}

      {!loading && !error && historique.length === 0 && (
        <div className="w-full max-w-2xl bg-gray-50 p-8 flex flex-col items-center text-center space-y-6 mt-10 rounded shadow">
          <FiClock className="text-green-500" size={60} aria-label="Aucun historique" />
          <p className="text-xl font-semibold text-gray-700">Aucun historique pour le moment</p>
          <p className="text-gray-500">
            Toutes les opérations effectuées (importations, modifications, suppressions) apparaîtront ici dès qu’elles auront lieu.
          </p>
          <p className="text-sm text-gray-400 italic">Revenez après avoir effectué une première action.</p>
        </div>
      )}

      {!loading && !error && historique.length > 0 && (
        <>
          <ul className="max-w-3xl w-full space-y-4 mt-8">
            {currentItems.map((item) => {
              const d = new Date(item.date_import);
              const dateStr = d.getUTCDate().toString().padStart(2, '0') + ' ' +
                d.toLocaleString('fr-FR', { month: 'long', timeZone: 'UTC' }) + ' ' +
                d.getUTCFullYear() + ' ' +
                d.getUTCHours().toString().padStart(2, '0') + ':' +
                d.getUTCMinutes().toString().padStart(2, '0') + ':' +
                d.getUTCSeconds().toString().padStart(2, '0');

              const statutText = item.statut ? 'réussie' : 'échouée';

              return (
                <li
                  key={item.id}
                  className="bg-white p-4 rounded shadow flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 max-w-[90%]">
                    {item.statut ? (
                      <FiCheckCircle className="text-green-600" size={24} aria-label="Succès" />
                    ) : (
                      <FiXCircle className="text-red-600" size={24} aria-label="Erreur" />
                    )}
                    <span className="text-gray-700 text-sm sm:text-base">
                      Importation du fichier <strong>{item.nom_fichier || 'inconnu'}</strong> par{' '}
                      <strong>{item.utilisateur || 'inconnu'}</strong> le <strong>{dateStr}</strong> {' '}
                      <strong>{statutText}</strong>.
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id || deletingAll}
                    className={`flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors font-semibold ${
                      deletingId === item.id || deletingAll ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={`Supprimer l'historique ${item.nom_fichier}`}
                    title="Supprimer"
                  >
                    {deletingId === item.id ? (
                      <svg
                        className="animate-spin h-5 w-5 text-red-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                    ) : (
                      <>
                        <FiTrash2 size={18} />
                        Supprimer
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1 ? 'bg-green-600 text-white' : 'bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Supprimer tout */}
          <div className="mt-6">
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className={`bg-red-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-red-700 transition duration-300 ${
                deletingAll ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {deletingAll ? 'Suppression en cours...' : 'Supprimer tout l’historique'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Historique;
