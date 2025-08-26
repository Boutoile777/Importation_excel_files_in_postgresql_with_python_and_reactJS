// import React from 'react';

// function Home() {
//   return (
//     <div>
//       <h2 className="text-3xl font-bold mb-4">Bienvenue sur votre espace utilisateur</h2>
//       <p className="text-gray-700">
//         Utilisez le menu de gauche pour naviguer entre les fonctionnalités : importer des données,
//         consulter l’historique, ou modifier votre compte.
//       </p>
//     </div>
//   );
// }


import React from 'react';
import { useNavigate } from 'react-router-dom';
import illustration from '../assets/221.png';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-screen bg-gray-50 flex flex-col">
      {/* Message Bienvenue */}
      <header className="py-6 px-4 md:px-0 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-7">
          Bienvenu sur{' '}
          <span className="font-extrabold font-serif">
            Excel
            <span className="text-green-600 font-medium">Import</span>
          </span>
        </h1>
      </header>

      {/* Contenu principal centré */}
      <main className="flex flex-col md:flex-row items-center justify-center flex-grow w-full px-6 md:px-20">
        {/* Texte */}
        <section className="md:w-1/2 text-center md:text-left space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-green-700 leading-tight">
            Gérez vos données en toute simplicité
          </h2>
          <p className="text-base md:text-lg font-medium max-w-lg mx-auto md:mx-0">
            Importez, visualisez et modifiez vos fichiers Excel rapidement. Notre outil vous aide à garder le contrôle sur vos projets de financement.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-6 mt-6">
            <button
              onClick={() => navigate('/comment-ca-marche')}
              className="bg-green-600 text-white px-6 py-3 text-base md:text-lg rounded-lg hover:bg-white hover:text-green-700 hover:border transition border-transparent hover:border-green-600"
            >
              Fonctionnement
            </button>
            <button
              onClick={() => navigate('/importer')}
              className="bg-white border border-green-600 text-green-700 px-6 py-3 text-base md:text-lg rounded-lg hover:bg-green-600 hover:text-white transition"
            >
              Importer maintenant
            </button>
          </div>
        </section>

        {/* Illustration */}
        <section className="md:w-1/2 flex justify-center mt-10 md:mt-0">
          <img
            src={illustration}
            alt="Illustration"
            className="max-h-[60vh] md:max-h-[80vh] w-auto object-contain"
            loading="lazy"
          />
        </section>
      </main>
    </div>
  );
}

export default Home;
