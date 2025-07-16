import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/logo.png'; // adapte selon ton chemin

export default function ForceChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('text-red-600');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      const response = await fetch('http://localhost:5000/auth/change-password', {
        method: 'POST',
        credentials: 'include', // si tu utilises les cookies de session
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessageColor('text-green-600');
        setMessage(result.message || 'Mot de passe changé avec succès. Vous pouvez maintenant vous connecter.');
        setNewPassword('');
        setConfirmPassword('');
        // Après un délai, redirige vers signin
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        setMessageColor('text-red-600');
        setMessage(result.error || 'Erreur lors du changement de mot de passe.');
      }
    } catch (err) {
      setMessageColor('text-red-600');
      setMessage('Erreur de connexion au serveur.');
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

        <h1 className="text-xl font-semibold mb-6 text-center">
          Changement obligatoire du mot de passe
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-gray-700">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex={-1}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700">Confirmer le nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-teal-800 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Modification en cours...' : 'Changer mon mot de passe'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center font-semibold ${messageColor}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
