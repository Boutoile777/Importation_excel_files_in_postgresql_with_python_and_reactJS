import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiEdit3, FiCheck, FiX, FiCamera, FiLock, FiChevronDown, FiChevronUp, FiEye, FiEyeOff } from 'react-icons/fi';


function MonCompte() {
  const [user, setUser] = useState({ nom: '', prenom: '', email: '', avatar: null });
  const [editField, setEditField] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [preview, setPreview] = useState(null);

  // --- Nouveau states pour mot de passe ---
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState({
  current: false,
  new: false,
  confirm: false,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data);
          setTempValues(data);
        } else {
          console.error('Utilisateur non connecté :', data.error);
        }
      } catch (error) {
        console.error("Erreur de récupération de l'utilisateur :", error);
      }
    };
    fetchUser();
  }, []);

  const handleEditClick = (field) => setEditField(field);
  const handleCancel = () => {
    setTempValues((prev) => ({ ...prev, [editField]: user[editField] }));
    setEditField(null);
  };
  const handleSave = () => setEditField(null);

  const hasChanges = () => {
    return ['nom', 'prenom', 'email'].some((field) => tempValues[field] !== user[field]);
  };

  const handleApplyChanges = async () => {
  try {
    const response = await fetch('http://localhost:5000/auth/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        nom: tempValues.nom,
        prenom: tempValues.prenom,
        email: tempValues.email
      })
    });

    if (!response.ok) throw new Error("Erreur lors de la mise à jour.");

    const updatedUser = await response.json();

    setUser(prev => ({
      ...prev,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom,
      email: updatedUser.email,
      photo_profil: updatedUser.photo_profil || prev.photo_profil
    }));

    setSuccessMessage("✅ Profil mis à jour avec succès.");
    setTimeout(() => setSuccessMessage(""), 4000);
  } catch (err) {
    console.error(err);
    setSuccessMessage("❌ Échec de la mise à jour du profil.");
    setTimeout(() => setSuccessMessage(""), 4000);
  }
};


  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setSelectedAvatar(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedAvatar) return;

    const formData = new FormData();
    formData.append('photo', selectedAvatar);

    try {
      const response = await fetch('http://localhost:5000/auth/me/avatar', {
        method: 'PATCH',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) throw new Error('Échec de l\'upload.');

      const data = await response.json();
      setUser((prev) => ({ ...prev, photo_profil: data.photo_profil }));
      setPreview(null);
      setSelectedAvatar(null);
      setSuccessMessage('✅ Photo de profil mise à jour !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur upload avatar:', error);
    }
  };

  const renderField = (label, fieldKey, value, icon) => {
    const isEditing = editField === fieldKey;
    return (
      <div className="flex flex-col gap-2 bg-white p-5 rounded-xl shadow border">
        <div className="flex items-center gap-3 mb-1">
          {icon}
          <h4 className="text-gray-600 font-medium">{label}</h4>
        </div>
        {!isEditing ? (
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-gray-800">{tempValues[fieldKey]}</p>
            <button
              onClick={() => handleEditClick(fieldKey)}
              className="text-green-600 hover:text-green-800"
              title="Modifier"
            >
              <FiEdit3 size={20} />
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={tempValues[fieldKey]}
              onChange={(e) => setTempValues({ ...tempValues, [fieldKey]: e.target.value })}
              className="input-style border px-3 py-2 rounded w-full"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleSave} className="text-green-600 hover:text-green-800">
                <FiCheck size={20} />
              </button>
              <button onClick={handleCancel} className="text-red-500 hover:text-red-700">
                <FiX size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

// --- Gestion du changement de mot de passe ---
const handleSubmitPassword = async () => {
  setPasswordError('');
  setPasswordSuccess('');

  // Vérifications côté frontend
  if (!passwords.current || !passwords.new || !passwords.confirm) {
    setPasswordError('Tous les champs sont requis.');
    return;
  }
  if (passwords.new !== passwords.confirm) {
    setPasswordError('La confirmation ne correspond pas au nouveau mot de passe.');
    return;
  }
  if (passwords.new.length < 6) {
    setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
    return;
  }

  try {
    // Appel sécurisé à la route Flask
    const response = await fetch('http://localhost:5000/auth/change-password-first-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // nécessaire pour Flask-Login
      body: JSON.stringify({
        current_password: passwords.current,
        new_password: passwords.new,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Mot de passe actuel incorrect ou autre erreur
      setPasswordError(result.error || 'Erreur lors de la mise à jour du mot de passe.');
      return;
    }

    // Succès
    setPasswordSuccess('✅ Mot de passe mis à jour avec succès.');
    setPasswords({ current: '', new: '', confirm: '' });
    setShowPasswordForm(false);

  } catch (err) {
    setPasswordError('Erreur de connexion au serveur.');
    console.error(err);
  }
};



  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center px-4 py-10">
      <h2 className="text-4xl font-bold text-green-700 mb-8">Mon compte</h2>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 md:p-10 flex flex-col md:flex-row gap-10 items-center md:items-start">

        {/* Avatar dynamique ou initiales */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-44 h-44 md:w-48 md:h-48 rounded-full overflow-hidden bg-gray-100 border-4 shadow-lg flex items-center justify-center relative cursor-pointer">
            {/* Avatar ou initiales */}
            {preview ? (
              <img src={preview} alt="Aperçu" className="object-cover w-full h-full" />
            ) : user.photo_profil ? (
              <img
                src={`http://localhost:5000/uploads/profils/${user.photo_profil}`}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl font-bold text-green-700">
                {(user.prenom?.[0] || '') + (user.nom?.[0] || '')}
              </span>
            )}

            {/* Overlay avec l’icône appareil photo */}
            <label
              htmlFor="avatarUpload"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity rounded-full text-white"
              title="Changer la photo"
            >
              <FiCamera size={36} />
            </label>

            {/* Input caché */}
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Actions si un fichier est sélectionné */}
          {selectedAvatar && (
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleUploadAvatar}
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
              >
                <FiCheck />
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setSelectedAvatar(null);
                  setPreview(null);
                }}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition flex items-center gap-2"
              >
                <FiX />
                Annuler
              </button>
            </div>
          )}

          {/* Message de succès/erreur pour avatar uniquement */}
          {successMessage && (
            <p className="text-green-600 font-medium mt-2">{successMessage}</p>
          )}
        </div>

        {/* Infos utilisateur + mot de passe */}
        <div className="flex flex-col flex-grow gap-6 w-full max-w-md">
          {renderField("Nom", "nom", user.nom, <FiUser size={24} className="text-green-600" />)}
          {renderField("Prénom", "prenom", user.prenom, <FiUser size={24} className="text-green-600" />)}
          {renderField("Adresse email", "email", user.email, <FiMail size={24} className="text-green-600" />)}

          {/* Section Mot de passe dépliable */}
<div className="bg-white p-5 rounded-xl shadow border mt-4">
  <button
    onClick={() => setShowPasswordForm(!showPasswordForm)}
    className="w-full flex justify-between items-center font-semibold text-green-700 hover:text-green-800 transition"
    aria-expanded={showPasswordForm}
    aria-controls="passwordForm"
  >
    <span className="flex items-center gap-2">
      <FiLock size={20} />
      Modifier le mot de passe
    </span>
    {showPasswordForm ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
  </button>

  {showPasswordForm && (
    <div id="passwordForm" className="mt-4 flex flex-col gap-4">

      {/* Champ : Mot de passe actuel */}
      <div className="relative">
        <input
          type={showPassword.current ? "text" : "password"}
          placeholder="Mot de passe actuel"
          value={passwords.current}
          onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          className="border rounded px-3 py-2 w-full pr-10"
        />
        <button
          type="button"
          onClick={() =>
            setShowPassword((prev) => ({ ...prev, current: !prev.current }))
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {showPassword.current ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>

                {/* Champ : Nouveau mot de passe */}
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    placeholder="Nouveau mot de passe"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    className="border rounded px-3 py-2 w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  >
                    {showPassword.new ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* Champ : Confirmer le mot de passe */}
                <div className="relative">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    placeholder="Confirmer nouveau mot de passe"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="border rounded px-3 py-2 w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  >
                    {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-red-600 font-medium">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-green-600 font-medium">{passwordSuccess}</p>
                )}

                <button
                  onClick={handleSubmitPassword}
                  className="mt-2 bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 transition"
                >
                  Enregistrer le mot de passe
                </button>
              </div>
            )}
          </div>


          {hasChanges() && (
            <>
              <button
                onClick={handleApplyChanges}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Lancer les modifications
              </button>
              {successMessage && (
                <p className="mt-3 text-center text-green-600 font-semibold">
                  {successMessage}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonCompte;
