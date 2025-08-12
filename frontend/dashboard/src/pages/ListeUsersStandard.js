import React, { useEffect, useState } from "react";
import axios from "axios";

const ListeUsersStandard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/auth/utilisateurs-standard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Chargement...</div>;
  }

  if (users.length === 0) {
    return <div className="text-center mt-10">Aucun utilisateur trouvé</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Liste des utilisateurs standards
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users.map(({ id, nom, prenom, date_creation, photo_profil }) => (
          <div
            key={id}
            className="bg-white rounded-lg shadow-md p-5 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300"
          >
            {photo_profil ? (
              <img
                src={photo_profil}
                alt={`${prenom} ${nom}`}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-bold text-3xl mb-4">
                {prenom.charAt(0)}{nom.charAt(0)}
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900">{prenom} {nom}</h3>
            <p className="text-sm text-gray-600 mt-1">
              Inscrit le {new Date(date_creation).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListeUsersStandard;
