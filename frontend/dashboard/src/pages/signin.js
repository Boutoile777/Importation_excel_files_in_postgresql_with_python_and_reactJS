import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('text-red-600');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          mot_de_passe: password,
        }),
      });

      const text = await response.text();

      let result;
      try {
        result = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Erreur de parsing JSON:", jsonErr);
        throw new Error("Réponse invalide du serveur (non JSON).");
      }

      if (response.ok) {
        setMessageColor('text-green-600');
        setMessage('Connexion réussie !');
        // Ici on passe bien les données utilisateur reçues à login
        login(result.user);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessageColor('text-red-600');
        setMessage(result.error || 'Erreur lors de la connexion.');
      }
    } catch (err) {
      console.error("Erreur dans le fetch:", err);
      setMessageColor('text-red-600');
      setMessage('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo du site" className="h-24 w-auto" />
        </div>

        <h1 className="text-xl font-semibold mb-6 text-center">Connexion</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="sergio@fnda.bj"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-gray-700">
              Mot de passe
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Votre mot de passe"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-600 hover:text-emerald-600"
              tabIndex={-1}
              aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-3.5-9-7s4-7 9-7c1.042 0 2.045.216 2.961.6m2.438 2.438a9.966 9.966 0 013.6 4.962c0 3.5-4 7-9 7a10.05 10.05 0 01-1.3-.1M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <line x1="3" y1="3" x2="21" y2="21" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-teal-800 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-4 text-center">
          <Link to="/forgotpassword" className="text-emerald-600 hover:underline">
            Mot de passe oublié ?
          </Link>
        </p>

        <p className="mt-2 text-center">
          <Link to="/signup" className="text-emerald-600 hover:underline">
            Créer un compte
          </Link>
        </p>

        {message && <p className={`mt-4 text-center font-semibold ${messageColor}`}>{message}</p>}
      </div>
    </div>
  );
}
