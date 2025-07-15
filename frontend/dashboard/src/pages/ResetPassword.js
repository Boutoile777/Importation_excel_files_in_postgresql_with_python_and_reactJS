import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../assets/logo.png';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('text-red-600');
  const [loading, setLoading] = useState(false);

  const isPasswordStrong = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

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

    if (!isPasswordStrong(newPassword)) {
      setMessageColor('text-red-600');
      setMessage('Mot de passe trop faible : min. 8 caractères, avec majuscule, minuscule, chiffre et symbole.');
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
        if (result.error?.includes('expiré')) {
          setMessage('Le lien de réinitialisation a expiré. Veuillez en redemander un.');
        } else if (result.error?.includes('invalide')) {
          setMessage("Lien de réinitialisation invalide.");
        } else {
          setMessage(result.error || 'Une erreur est survenue.');
        }
      }
    } catch (err) {
      setMessageColor('text-red-600');
      setMessage("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messageColor === 'text-green-600') {
      const timer = setTimeout(() => {
        navigate('/signin');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [messageColor, navigate]);

  return (
    <div className="bg-gray-200 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-24 w-auto" />
        </div>

        <h1 className="text-xl font-semibold mb-6 text-center">Nouveau mot de passe</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-gray-700">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-gray-700">Confirmer le mot de passe</label>
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
            {loading ? 'Réinitialisation...' : 'Changer le mot de passe'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center font-semibold ${messageColor}`}>{message}</p>
        )}

        {messageColor === 'text-green-600' && (
          <p className="mt-4 text-center">
            Redirection vers la page de connexion...
            <br />
            <Link to="/signin" className="text-emerald-600 hover:underline">
              Aller à la connexion maintenant
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
