import React, { useState, useEffect } from 'react';

function Facilite() {
  const [nomFacilite, setNomFacilite] = useState('');
  const [typeFichier, setTypeFichier] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSuccess, setFormSuccess] = useState(null);
  const [listMessage, setListMessage] = useState('');
  const [listSuccess, setListSuccess] = useState(null);
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
      setListMessage(error.message);
      setListSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setFormSuccess(null);

    if (!nomFacilite.trim() || !typeFichier.trim()) {
      setFormMessage('Merci de remplir le nom de la facilité et le type de fichier');
      setFormSuccess(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/auth/types_projets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nom_facilite: nomFacilite.trim(),
          type_fichier: typeFichier.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormMessage(data.error || "Erreur lors de l'ajout de la facilité");
        setFormSuccess(false);
        return;
      }

      setNomFacilite('');
      setTypeFichier('');
      setFormMessage('✅ Facilité ajoutée avec succès !');
      setFormSuccess(true);
      fetchFacilites();
    } catch (error) {
      setFormMessage('Erreur réseau : impossible de joindre le serveur');
      setFormSuccess(false);
    } finally {
      setTimeout(() => {
        setFormMessage('');
        setFormSuccess(null);
      }, 4000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette facilité ?')) return;

    setListMessage('');
    setListSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/auth/types_projets/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setListMessage(data.error || 'Erreur lors de la suppression');
        setListSuccess(false);
      } else {
        setListMessage('✅ Facilité supprimée avec succès !');
        setListSuccess(true);
        fetchFacilites();
      }
    } catch (error) {
      setListMessage('Erreur réseau lors de la suppression.');
      setListSuccess(false);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setListMessage('');
        setListSuccess(null);
      }, 4000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <h1 className="text-5xl font-extrabold text-green-700 mb-12">Nos Types de Projet</h1>

      {/* Formulaire d'ajout */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">
          Ajouter un type de projet
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4" noValidate>
          <input
            type="text"
            placeholder="Nom du type de projet"
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={nomFacilite}
            onChange={(e) => setNomFacilite(e.target.value)}
            disabled={loading}
          />

          {/* Menu déroulant pour type_fichier */}
          <select
            className="border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={typeFichier}
            onChange={(e) => setTypeFichier(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Sélectionnez le type de fichier --</option>
            <option value="FICHIER 1">FICHIER 1</option>
            <option value="FICHIER 2">FICHIER 2</option>
          </select>

          <button
            type="submit"
            className="bg-green-700 hover:bg-green-600 transition text-white font-semibold py-3 rounded-md"
            disabled={loading}
          >
            {loading ? 'Traitement...' : 'Ajouter'}
          </button>

          {/* Message seulement pour AJOUT */}
          {formMessage && formSuccess !== null && (
            <div
              className={`text-center text-xl ${formSuccess ? 'text-green-700' : 'text-red-700'}`}
            >
              {formMessage}
            </div>
          )}
        </form>
      </div>

      {/* Liste */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold text-green-700 mb-6 text-center">
          Liste des types de projet
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : facilites.length === 0 ? (
          <p className="text-center text-gray-500">Aucun type de projet disponible pour le moment.</p>
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
                    Type fichier : {f.type_fichier} — Auteur : {f.auteur} — Créé le{' '}
                    {f.date_creation || 'N/A'}
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

        {/* Message seulement pour LISTE */}
        {listMessage && (
          <div
            className={`mt-6 text-center text-lg ${
              listSuccess ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {listMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Facilite;
