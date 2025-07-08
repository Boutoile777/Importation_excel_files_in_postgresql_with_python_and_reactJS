import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUpload, FiEye, FiEdit, FiDatabase } from 'react-icons/fi';

function CommentCaMarche() {
  const steps = [
    {
      icon: <FiUpload className="text-white text-3xl" />,
      title: 'Importer un fichier Excel',
      description:
        'Commencez par sélectionner la facilité concernée par votre tâche, puis téléversez facilement votre fichier Excel.',
    },
    {
      icon: <FiEye className="text-white text-3xl" />,
      title: 'Prévisualiser les données',
      description:
        'Affichez et examinez les données téléversées pour vous assurer qu’elles sont conformes.',
    },
    {
      icon: <FiEdit className="text-white text-3xl" />,
      title: 'Modifier les données',
      description:
        'Vous pouvez corriger, ajouter ou supprimer des lignes directement depuis l’interface.',
    },
    {
      icon: <FiDatabase className="text-white text-3xl" />,
      title: 'Importer dans la base',
      description:
        'Une fois vos données prêtes, validez et importez-les dans la base PostgreSQL en toute sécurité.',
    },
  ];

  return (
    <div className="min-h-screen bg-white px-4 py-12 md:px-16">
      {/* En-tête */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-green-700 mb-4">
          Comment ça marche ?
        </h1>
        <p className="text-lg text-gray-600">
          Suivez ces étapes simples pour importer vos fichiers de manière rapide et sécurisée.
        </p>
      </div>

      {/* Étapes */}
      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className="relative bg-gray-50 border-l-4 border-green-600 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 group"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            {/* Badge numéro */}
            <div className="absolute -left-6 top-6 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
              {index + 1}
            </div>

            {/* Icône flottante */}
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-green-600 shadow-lg">
              {step.icon}
            </div>

            {/* Titre + description */}
            <h3 className="text-xl font-semibold text-green-800 mb-2">{step.title}</h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Blocs infos + bouton final */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-10 mt-16"
      >
        {/* Bloc : Nomenclature */}
        <section className="bg-green-50 border-l-4 border-green-700 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
            <span role="img" aria-label="dossier">
              🗂️
            </span>{' '}
            Nomenclature du fichier attendu
          </h2>
          <p className="text-gray-700 text-base leading-relaxed mb-4">
            Avant l’importation, veuillez vous assurer que votre fichier Excel respecte le modèle défini. Vous
            pouvez télécharger un exemple de fichier correctement structuré ci-dessous pour éviter toute erreur.
          </p>
          <a
            href="/assets/Nomenclature.xlsx"
            download
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow hover:bg-green-700 transition duration-300"
          >
            📥 Télécharger le modèle Excel
          </a>
        </section>

        {/* Bloc : Facilités */}
        <section className="bg-blue-50 border-l-4 border-blue-700 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
            <span role="img" aria-label="ampoule">
              💡
            </span>{' '}
            Facilités disponibles
          </h2>
          <p className="text-gray-700 text-base leading-relaxed">
            À ce jour, la plateforme prend en charge les importations de projets liés aux facilités suivantes :{' '}
            <strong>GARANTIE, FIER, FNDA, FACIL</strong>. Chaque facilité est liée à un ensemble spécifique de règles
            de gestion et de financement, sélectionnez donc celle qui correspond à votre besoin avant de commencer.
          </p>
        </section>

        {/* Bouton final */}
        <div className="text-center">
          <Link
            to="/dashboard/importer"
            className="inline-block bg-green-700 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-green-800 transition duration-300"
          >
            Commencer maintenant
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default CommentCaMarche;
