import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function ProjetsParFacilite() {
  const { id_type_projet } = useParams();
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjets = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(
          `http://localhost:5000/api/projets?type_projet=${id_type_projet}`,
          { credentials: 'include' }
        );
        if (!res.ok) throw new Error('Erreur lors du chargement des projets');
        const data = await res.json();
        setProjets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjets();
  }, [id_type_projet]);

  if (loading) return <p>Chargement des projets...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">
        Projets pour la facilité : {id_type_projet}
      </h1>
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Retour à la liste des facilités
      </Link>
      {projets.length === 0 ? (
        <p>Aucun projet trouvé pour cette facilité.</p>
      ) : (
        <ul>
          {projets.map((p) => (
            <li key={p.id_projet} className="mb-2">
              {p.intitule_projet} - {p.date_comite_validation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProjetsParFacilite;
