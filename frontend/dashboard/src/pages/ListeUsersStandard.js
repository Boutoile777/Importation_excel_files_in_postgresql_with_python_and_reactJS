import React, { useState, useEffect } from 'react';

function ListeUtilisateursStandard() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUtilisateurs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/auth/utilisateurs-standard', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setUtilisateurs(data);
        setMessage('');
      } else {
        setUtilisateurs([]);
        setMessage('Aucun utilisateur trouvé.');
      }
      setSuccess(true);
    } catch (error) {
      setMessage(error.message);
      setSuccess(false);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setSuccess(null);
      }, 4000);
    }
  };

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <h1 className="text-5xl font-extrabold text-green-700 mb-12">Utilisateurs Standards</h1>

      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : utilisateurs.length === 0 ? (
          <p className="text-center text-gray-500">{message || 'Aucun utilisateur trouvé.'}</p>
        ) : (
          <ul className="space-y-4">
            {utilisateurs.map((u, index) => (
              <li
                key={index}
                className="border border-gray-300 rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {u.nom} {u.prenom}
                  </p>
                  <p className="text-sm text-gray-500">
                    Créé le {u.date_creation || 'N/A'}
                  </p>
                </div>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
                  type="button"
                >
                  Bloqué
                </button>
              </li>
            ))}
          </ul>
        )}

        {message && (
          <div
            className={`mt-4 text-center text-lg ${
              success === true ? 'text-green-700' : ''
            } ${success === false ? 'text-red-700' : ''}`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListeUtilisateursStandard;
