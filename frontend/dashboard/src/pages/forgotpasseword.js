import React, { useState } from 'react';
import logo from '../assets/logo.png'

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('text-red-600');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessageColor('text-green-600');
        setMessage('Un lien de réinitialisation a été envoyé à votre email.');
        setEmail('');
      } else {
        setMessageColor('text-red-600');
        setMessage(result.error || 'Erreur lors de l’envoi.');
      }
    } catch (err) {
      setMessageColor('text-red-600');
      setMessage('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo du site" className="h-24 w-auto" />
        </div>

        <h1 className="text-xl font-semibold mb-6 text-center">Réinitialiser le mot de passe</h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-gray-700">
              Entrez votre email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="new-email"
              placeholder="sergio@fnda.bj"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-teal-800 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        <p className="mt-4 text-center text-emerald-600">
          <a href="/signin" className="hover:underline">
            Retour à la connexion
          </a>
        </p>

        {message && <p className={`mt-4 text-center font-semibold ${messageColor}`}>{message}</p>}
      </div>
    </div>
  );
}
