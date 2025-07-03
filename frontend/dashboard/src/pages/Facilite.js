import React, { useState, useEffect } from 'react';

function Facilite() {
  const [nomFacilite, setNomFacilite] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(null); // ✅ true = succès, false = erreur
  const [facilites, setFacilites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFacilites = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/auth/types_projets', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors du chargement des facilités');
      const data = await res.json();
      setFacilites(data);
    } catch (error) {
      setMessage(error.message);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSuccess(null);

    if (!nomFacilite.trim()) {
      setMessage('Merci de remplir le champ nom de la facilité');
      setSuccess(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/types_projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ nom_facilite: nomFacilite.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Erreur lors de l'ajout de la facilité");
        setSuccess(false);
        return;
      }

      setNomFacilite('');
      setMessage('✅ Facilité ajoutée avec succès !');
      setSuccess(true);
      fetchFacilites();
    } catch (error) {
      setMessage('Erreur réseau : impossible de joindre le serveur');
      setSuccess(false);
    } finally {
      setTimeout(() => {
        setMessage('');
        setSuccess(null);
      }, 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette facilité ?')) return;

    setMessage('');
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/auth/types_projets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Erreur lors de la suppression');
        setSuccess(false);
      } else {
        setMessage('✅ Facilité supprimée avec succès !');
        setSuccess(true);
        fetchFacilites(); // recharge la liste
      }
    } catch (error) {
      setMessage('Erreur réseau lors de la suppression.');
      setSuccess(false);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setSuccess(null);
      }, 4000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <h1 className="text-5xl font-extrabold text-green-700 mb-12">Nos Facilités</h1>

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">Ajouter une facilité</h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-6" noValidate>
          <input
            type="text"
            placeholder="Nom de la facilité"
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={nomFacilite}
            onChange={(e) => setNomFacilite(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className="bg-green-700 hover:bg-green-600 transition text-white font-semibold py-3 rounded-md"
            disabled={loading}
          >
            {loading ? 'Traitement...' : 'Ajouter'}
          </button>

          {message && (
            <div
              className={`text-center text-xl ${
                success === true ? 'text-green-700' : ''
              } ${success === false ? 'text-red-700' : ''}`}
            >
              {message}
            </div>
          )}
        </form>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">Liste des facilités</h2>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : facilites.length === 0 ? (
          <p className="text-center text-gray-500">Aucune facilité disponible pour le moment.</p>
        ) : (
          <ul className="space-y-4">
            {facilites.map((f) => (
              <li
                key={f.id_type_projet}
                className="border border-gray-300 rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{f.nom_facilite}</p>
                  <p className="text-sm text-gray-500">
                    Auteur : {f.auteur} — Créé le {f.date_creation || 'N/A'}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-green-600 font-mono">{f.id_type_projet}</span>
                  <button
                    onClick={() => handleDelete(f.id_type_projet)}
                    className="text-red-600 hover:text-red-800 font-semibold text-sm border border-red-500 px-3 py-1 rounded-md"
                    disabled={loading}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Facilite;
