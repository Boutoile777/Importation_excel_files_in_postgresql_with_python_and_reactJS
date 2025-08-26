import React, { useState, useEffect } from 'react';

function ListeUtilisateursStandard() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // id de l'user en action

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

// Fonction pour changer la permission d'un utilisateur
const changerPermission = async (id, nouvellePermission) => {
  try {
    const res = await fetch(`http://localhost:5000/auth/changer_permission/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ permission: nouvellePermission }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de la mise à jour");
    }

    const data = await res.json();
    setMessage(data.message);
    setSuccess(true);

    // 🔄 Mise à jour locale de l’état
    setUtilisateurs(prev =>
      prev.map(u =>
        u.id === id ? { ...u, permission: nouvellePermission } : u
      )
    );

  } catch (error) {
    setMessage(error.message);
    setSuccess(false);
  } finally {
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
                  <p className="font-semibold text-gray-800">
                    {u.nom} {u.prenom}
                  </p>
                  <p className="text-sm text-gray-500">
                    Créé le {u.date_creation || 'N/A'}
                  </p>
                  <p className={`text-sm font-semibold ${u.permission === 'bloqué' ? 'text-red-600' : 'text-green-600'}`}>
                    État : {u.permission}
                  </p>
                </div>
                <button
                  className={`px-4 py-2 rounded font-semibold text-white ${
                    u.permission === 'bloqué' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                  onClick={() =>
                    changerPermission(u.id, u.permission === 'bloqué' ? 'accepté' : 'bloqué')
                  }
                >
                  {u.permission === 'bloqué' ? 'Débloquer' : 'Bloquer'}
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
