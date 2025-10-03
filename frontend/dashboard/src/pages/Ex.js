import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';

function Facilite() {
  const [typesFacilites, setTypesFacilites] = useState([]);
  const [choixEnCours, setChoixEnCours] = useState('');
  const [idTypeProjetEnCours, setIdTypeProjetEnCours] = useState('');
  const [choixValide, setChoixValide] = useState('');
  const [idTypeProjetValide, setIdTypeProjetValide] = useState('');
  const [afficherInfos, setAfficherInfos] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/auth/type_projets')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTypesFacilites(data);
        } else {
          console.error('Format inattendu :', data);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des types de facilités :', error);
      });
  }, []);

  const handleChange = (e) => {
    const idChoisi = e.target.value;
    setIdTypeProjetEnCours(idChoisi);

    const faciliteChoisie = typesFacilites.find(f => f.id_type_projet.toString() === idChoisi);
    setChoixEnCours(faciliteChoisie ? faciliteChoisie.nom_facilite : '');
  };

  const handleValidation = () => {
    setChoixValide(choixEnCours);
    setIdTypeProjetValide(idTypeProjetEnCours);
    console.log("Facilité sélectionnée :", choixEnCours, "(ID:", idTypeProjetEnCours + ")");
  };

  return (
    <div className="p-6 md:p-10 space-y-10">
      <h1 className="text-3xl md:text-5xl font-extrabold text-center text-green-700 mb-8">
        Nos Facilités
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-green-700">
          Choisir le type de facilité
        </h2>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <select
            value={idTypeProjetEnCours}
            onChange={handleChange}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">-- Sélectionnez une facilité --</option>
            {typesFacilites.map((facilite) => (
              <option key={facilite.id_type_projet} value={facilite.id_type_projet}>
                {facilite.nom_facilite}
              </option>
            ))}
          </select>

          <button
            onClick={handleValidation}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
            disabled={!idTypeProjetEnCours}
          >
            Valider
          </button>
        </div>

        {choixValide && (
          <p className="mt-4 font-semibold">
            Facilité choisie : <span className="underline text-red-500">{choixValide}</span> (ID : <span className="underline text-red-500">{idTypeProjetValide}</span>)
          </p>
        )}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div
          className="flex items-center justify-center gap-3 cursor-pointer w-full"
          onClick={() => setAfficherInfos(!afficherInfos)}
        >
          <span className="text-green-700">
            {afficherInfos ? <FiMinus size={24} /> : <FiPlus size={24} />}
          </span>
          <h2 className="text-2xl font-semibold text-green-700 text-center">
            Découvrir nos types de facilités
          </h2>
        </div>

        <AnimatePresence>
          {afficherInfos && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden space-y-4 mt-4"
            >
              {typesFacilites.map((facilite, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow"
                >
                  <h3 className="text-lg font-semibold text-green-700">{facilite.nom_facilite}</h3>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Facilite;
