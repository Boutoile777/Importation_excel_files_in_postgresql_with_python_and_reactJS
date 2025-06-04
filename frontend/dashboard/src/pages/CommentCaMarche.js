import React from 'react';
import { FiUpload, FiEye, FiEdit, FiDatabase } from 'react-icons/fi';

function CommentCaMarche() {
  const steps = [
    {
      icon: <FiUpload className="text-white text-2xl" />,
      title: 'Importer un fichier Excel',
      description: 'Téléversez facilement vos fichiers Excel (.xlsx, .xls) via l’interface intuitive.',
    },
    {
      icon: <FiEye className="text-white text-2xl" />,
      title: 'Prévisualiser les données',
      description: 'Consultez vos données avant l’importation et assurez-vous que tout est conforme.',
    },
    {
      icon: <FiEdit className="text-white text-2xl" />,
      title: 'Modifier au besoin',
      description: 'Corrigez, supprimez ou ajoutez des lignes avant de valider l’importation.',
    },
    {
      icon: <FiDatabase className="text-white text-2xl" />,
      title: 'Importer dans la base',
      description: 'Une fois prêt, importez vos données dans la base PostgreSQL en un seul clic.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 md:px-12 py-8">
      {/* Titre principal */}
      <header className="text-center mb-12 max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-green-700 mb-4">
          Comment ça marche ?
        </h1>
        <p className="text-base md:text-lg text-gray-700">
          Voici les différentes étapes pour utiliser l’outil d’importation de données avec simplicité et efficacité.
        </p>
      </header>

      {/* Étapes sous forme de grille responsive */}
      <section className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        {steps.map((step, index) => (
          <article
            key={index}
            className="relative bg-green-50 p-6 pt-12 rounded-3xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Icône dans un cercle flottant */}
            <div className="absolute -top-6 left-6 sm:left-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-800 ring-4 ring-white shadow-xl">
                {step.icon}
              </div>
            </div>

            {/* Contenu adapté pour responsivité */}
            <div className="sm:pl-16 pl-20">
              <h2 className="text-lg sm:text-xl font-semibold text-green-700">
                {index + 1}. {step.title}
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default CommentCaMarche;
