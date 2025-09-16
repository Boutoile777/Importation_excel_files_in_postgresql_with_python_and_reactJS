import React, { useState, useEffect } from 'react';

function ListeUtilisateursStandard() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Récupération des utilisateurs
  const fetchUtilisateurs = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/auth/utilisateurs-standard', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des utilisateurs");
      const data = await res.json();
      setUtilisateurs(Array.isArray(data) ? data : []);
      setMessage(Array.isArray(data) && data.length ? '' : 'Aucun utilisateur trouvé.');
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

  // 🔧 Changement de permission
const changerPermission = async (id, permissionActuelle) => {
  const nouvellePermission = permissionActuelle === 'oui' ? 'non' : 'oui';

  try {
    const res = await fetch(`http://localhost:5000/auth/changer_permission/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ permission: nouvellePermission }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la mise à jour");
    }

    const data = await res.json();
    // mise à jour locale
    setUtilisateurs(prev => prev.map(u => u.id === id ? { ...u, permission: nouvellePermission } : u));
  } catch (err) {
    console.error(err.message);
  }
};


  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <h1 className="text-5xl font-extrabold text-green-700 mb-12">Gestion des Utilisateurs</h1>

      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-8">
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : utilisateurs.length === 0 ? (
          <p className="text-center text-gray-500">{message || 'Aucun utilisateur trouvé.'}</p>
        ) : (
          <ul className="space-y-4">
            {utilisateurs.map(u => (
              <li key={u.id} className="border border-gray-300 rounded-md p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{u.nom} {u.prenom}</p>
                  <p className="text-sm text-gray-500">Créé le {u.date_creation || 'N/A'}</p>
                  <p className={`text-sm font-semibold ${u.permission === 'non' ? 'text-red-600' : 'text-green-600'}`}>
                    Permission: {u.permission === 'oui' ? 'Oui' : 'Non'}
                  </p>
                </div>
                <button
                  className={`px-4 py-2 rounded font-semibold text-white ${
                    u.permission === 'non' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={() => changerPermission(u.id, u.permission)}
                >
                  {u.permission === 'non' ? 'Débloquer' : 'Bloquer'}
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
