import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import logo from '../assets/logo.png'; // adapte ce chemin si besoin

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('text-red-600');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!newPassword || !confirmPassword) {
      setMessageColor('text-red-600');
      setMessage('Tous les champs sont requis.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessageColor('text-red-600');
      setMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessageColor('text-green-600');
        setMessage(result.message || 'Mot de passe modifié avec succès.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessageColor('text-red-600');
        setMessage(result.error || 'Une erreur est survenue.');
      }
    } catch (err) {
      setMessageColor('text-red-600');
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-24 w-auto" />
        </div>

        <h1 className="text-xl font-semibold mb-6 text-center">Nouveau mot de passe</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-teal-800 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Réinitialisation...' : 'Changer le mot de passe'}
          </button>
        </form>

        {message && <p className={`mt-4 text-center font-semibold ${messageColor}`}>{message}</p>}
      </div>
    </div>
  );
}
