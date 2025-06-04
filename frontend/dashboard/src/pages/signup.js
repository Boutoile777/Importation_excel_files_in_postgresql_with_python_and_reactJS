import React, { useState } from 'react';
import logo from '../assets/logo.png'; // chemin pour le logo
import dec from '../assets/dec.png'; // image utilisateur

export default function SignUp() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', color: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', color: '' });
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ text: 'Inscription réussie ! Connectez-vous maintenant.', color: 'text-emerald-600' });
        setFormData({ nom: '', prenom: '', email: '', mot_de_passe: '' });
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else {
        setMessage({ text: result.error || 'Une erreur est survenue.', color: 'text-red-600' });
      }
    } catch {
      setMessage({ text: 'Impossible de contacter le serveur.', color: 'text-red-600' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
        {/* Left */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-50 to-gray-100 items-center justify-center p-10 rounded-l-2xl shadow-inner">
          <div className="text-center max-w-md">
            <h2 className="text-3xl font-extrabold text-gray-700 mb-4">Bienvenue !</h2>
            <p className="text-gray-600 text-lg font-semibold">
              Inscrivez-vous dès maintenant pour profiter pleinement de tous nos services.
            </p>
            <img src={dec} alt="Inscription" className="mb-6 w-[90%] h-72 mx-auto mt-12 object-contain" />
          </div>
        </div>

        {/* Right - form */}
        <div className="w-full md:w-1/2 p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo du site" className="h-24 w-auto" />
          </div>

          <h1 className="text-2xl font-semibold text-center text-gray-700 mb-6">
            Portail d'inscription
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="nom" className="block text-gray-700 font-medium">Nom</label>
              <input
                type="text"
                id="nom"
                name="nom"
                placeholder="ABDALLAH"
                required
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="prenom" className="block text-gray-700 font-medium">Prénom</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                placeholder="Karim"
                required
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 font-medium">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="sergio@fnda.bj"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="mot_de_passe" className="block text-gray-700 font-medium">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="mot_de_passe"
                  name="mot_de_passe"
                  placeholder="Votre mot de passe"
                  required
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-emerald-600"
                  tabIndex={-1}
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? (
                    // eye-off
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-9-7s4-7 9-7c1.042 0 2.045.216 2.961.6m2.438 2.438a9.966 9.966 0 013.6 4.962c0 3.5-4 7-9 7a10.05 10.05 0 01-1.3-.1M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    // eye
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                loading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-emerald-600 hover:bg-teal-800 text-white'
              }`}
            >
              {loading ? 'Chargement...' : "S'inscrire"}
            </button>
          </form>

          {message.text && (
            <p className={`mt-4 text-center font-semibold ${message.color}`}>
              {message.text}
            </p>
          )}

          <p className="mt-4 text-center text-gray-600">
            Déjà un compte ?{' '}
            <a href="/signin" className="text-emerald-600 hover:underline">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
