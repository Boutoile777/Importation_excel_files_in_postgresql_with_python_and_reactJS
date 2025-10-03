import React, { useState, useEffect } from 'react';
import { FiUpload, FiEdit, FiCheckCircle, FiDatabase } from 'react-icons/fi';
import * as XLSX from 'xlsx';

// Conversion date Excel -> YYYY-MM-DD
const excelDateToJSDate = (serial) => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  return date_info.toISOString().split('T')[0];
};

// Formater un nombre avec séparateur de milliers
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '';
  if (isNaN(Number(value))) return value;
  return Number(value).toLocaleString('fr-FR');
};

function Importation() {
  const [facilites, setFacilites] = useState([]);
  const [selectedFacilite, setSelectedFacilite] = useState('');
  const [faciliteConfirmee, setFaciliteConfirmee] = useState(false);
  const [erreur, setErreur] = useState('');

  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editFinished, setEditFinished] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importStatus, setImportStatus] = useState(null);

  const rowsPerPage = 101;

  // Chargement des facilités
  useEffect(() => {
    fetch('http://localhost:5000/auth/type_projets', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setFacilites(data))
      .catch(err => console.error('Erreur chargement facilités :', err));
  }, []);

  
  // Confirmer la sélection de facilité
  const handleConfirmerFacilite = async () => {
    if (!selectedFacilite) {
      setErreur('Le choix de facilité est obligatoire.');
      return;
    }

    try {
      await fetch('http://localhost:5000/auth/selection_type_projet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id_type_projet: selectedFacilite }),
      });
      setFaciliteConfirmee(true);
      setErreur('');
    } catch (error) {
      console.error('Erreur lors de la confirmation de la facilité :', error);
    }
  };


 // Gestion du fichier Excel
const handleFileChange = (e) => {
  const selectedFile = e.target.files[0];
  if (!selectedFile) return;

  setFile(selectedFile);
  setEditMode(false);
  setEditFinished(false);
  setCurrentPage(1);
  setImportStatus(null);

  const reader = new FileReader();
  reader.onload = (evt) => {
    const bstr = evt.target.result;
    const wb = XLSX.read(bstr, { type: 'binary' });
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];

    // ✅ Correction ici : ajout de defval:"" pour garder les colonnes vides
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    const processedData = jsonData.map(row =>
      row.map(cell => {
        if (typeof cell === 'number' && cell > 40000 && cell < 60000) return excelDateToJSDate(cell);
        return cell;
      })
    );

    setData(processedData);
    setOriginalData(JSON.parse(JSON.stringify(processedData)));
  };
  reader.readAsBinaryString(selectedFile);
};


  // Modification cellule
  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const handleValidateEdit = () => {
    setOriginalData(JSON.parse(JSON.stringify(data)));
    setEditMode(false);
    setEditFinished(true);
  };

  const handleCancelEdit = () => {
    setData(JSON.parse(JSON.stringify(originalData)));
    setEditMode(false);
    setEditFinished(false);
  };

  const handleEdit = () => { setEditMode(true); setEditFinished(false); };

 const [progressText, setProgressText] = useState(''); // texte dynamique



 
 

const handleImportToDB = () => {
  if (!file) {
    setImportStatus({ success: false, message: "Veuillez sélectionner un fichier avant d'importer." });
    return;
  }

  setImporting(true);
  setProgress(0);
  setImportStatus(null);

  const messages = [
    "On range les cellules... 🗂️",
    "Les lignes voyagent vers la base... 🚀",
    "Presque terminé… ✨",
    "Ça y est, on finit ! 🎉"
  ];

  let messageIndex = 0;
  let progressDirection = 1;

  // Animation circulaire + messages
  const interval = setInterval(() => {
    setProgress(prev => {
      let next = prev + progressDirection * 5;
      if (next >= 100) { next = 100; progressDirection = -1; messageIndex = (messageIndex + 1) % messages.length; }
      else if (next <= 0) { next = 0; progressDirection = 1; messageIndex = (messageIndex + 1) % messages.length; }
      setProgressText(messages[messageIndex]);
      return next;
    });
  }, 150);

  // Envoi au backend
  // const formData = new FormData();
  // formData.append('file', file);
 
  const formData = new FormData();
  formData.append('file', file); // SEULEMENT le fichier
  formData.append('id_type_projet', selectedFacilite); // ← IMPORTANT


  fetch("http://localhost:5000/auth/import_excel", {
    method: "POST",
    body: formData,
    credentials: "include",
  })
    .then(res => {
      clearInterval(interval);
      setImporting(false);
      if (res.status === 200) {
        setProgress(100);
        setProgressText("Fichier importé avec succès ! 🎉");
        setImportStatus({ success: true, message: `${data.length - 1} lignes traitées.` });
      } else {
        setProgress(0);
        setProgressText('');
        setImportStatus({ success: false, message: 'Erreur lors de l’importation.' });
      }
    })
    .catch(err => {
      console.error("Erreur lors de l’envoi du fichier :", err);
      clearInterval(interval);
      setImporting(false);
      setProgress(0);
      setProgressText('');
      setImportStatus({ success: false, message: "Erreur lors de l'importation." });
    });
};



  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const pageData = data.slice(startIndex, startIndex + rowsPerPage);

  const inputStyle = {
    width: '100%',
    minWidth: '200px',
    border: 'none',
    backgroundColor: 'transparent',
    padding: '12px 16px',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'black',
    outline: 'none',
    boxSizing: 'border-box',
    textAlign: 'left',
  };

  const nomFaciliteSelectionnee = facilites.find(f => f.id_type_projet === selectedFacilite)?.nom_facilite;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-green-700 mb-8">Importation Excel</h1>

        {!faciliteConfirmee ? (
          <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">Importer des données</h2>
            <p className="mb-6 text-gray-600 text-center">Sélectionnez une facilité ci-dessous :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {facilites.map((facilite) => (
                <div
                  key={facilite.id_type_projet}
                  onClick={() => setSelectedFacilite(facilite.id_type_projet)}
                  className={`cursor-pointer border rounded-lg p-4 shadow-sm text-center transition-all duration-200 ${
                    selectedFacilite === facilite.id_type_projet
                      ? 'bg-green-100 border-green-500 text-green-800 font-semibold shadow-md'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {facilite.nom_facilite}
                </div>
              ))}
            </div>
            {erreur && <p className="text-red-600 mb-4 text-center font-medium">{erreur}</p>}
            <button onClick={handleConfirmerFacilite} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg w-full">
              Confirmer votre choix
            </button>
          </div>
        ) : (
          <div>
            <div className="max-w-3xl mx-auto mt-6 p-4 bg-white shadow-md rounded-lg text-center mb-8">
              <p className="text-gray-700 text-lg font-medium">
                Facilité sélectionnée : <span className="text-green-700 font-semibold">{nomFaciliteSelectionnee}</span>
              </p>
            </div>

            {!file ? (
              <div className="bg-white rounded-xl shadow-lg p-10 text-center border-2 border-dashed border-green-600 w-96 mx-auto">
                <FiUpload className="text-green-600 mx-auto mb-4" size={80} />
                <h2 className="text-xl font-semibold text-green-700 mb-2">Déposez un fichier Excel ici</h2>
                <p className="text-gray-600 mb-6">Format accepté : .xlsx</p>
                <label className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-green-700 transition">
                  Choisir un fichier Excel
                  <input type="file" accept=".xlsx" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            ) : (
              <div className="mt-8 relative">
                <div className="text-gray-700 text-center mb-4 italic">Fichier sélectionné : {file.name}</div>
                <div className="overflow-auto rounded-lg shadow-md bg-white">
                  <table className="min-w-full text-sm table-auto border-collapse">
                    <thead>
                      <tr className="bg-green-700 text-white">
                        {data[0] && data[0].map((col, i) => <th key={i} className="px-4 py-3 text-left font-semibold">{col}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {pageData.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex} className="even:bg-gray-50 hover:bg-green-50">
                          {row.map((cell, colIndex) => (
                            <td key={colIndex} className="px-4 py-3 border-t border-gray-200 align-top" style={editMode ? { minWidth: '200px' } : {}}>
                              {editMode ? (
                                <input
                                  type="text"
                                  value={cell || ''}
                                  onChange={(e) => handleCellChange(startIndex + rowIndex + 1, colIndex, e.target.value)}
                                  style={inputStyle}
                                  spellCheck={false}
                                />
                              ) : (
                                <span>{typeof cell === 'number' ? formatNumber(cell) : cell}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data.length > rowsPerPage && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50">Précédent</button>
                    <span>Page {currentPage} / {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 disabled:opacity-50">Suivant</button>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  {!editMode ? (
                    <>
                      <button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded flex items-center gap-2"><FiEdit /> Modifier</button>
                      <button onClick={handleImportToDB} className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded flex items-center gap-2"><FiDatabase /> Importer dans la base</button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleValidateEdit} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded flex items-center gap-2"><FiCheckCircle /> Valider les modifications</button>
                      <button onClick={handleCancelEdit} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded flex items-center gap-2">Annuler</button>
                    </>
                  )}
                  <button onClick={() => window.location.reload()} className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded flex items-center gap-2">🔄 Choisir un autre fichier</button>
                </div>

                {/* Modale de progression */}
              {importing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white rounded-lg p-6 w-40 h-40 flex flex-col items-center justify-center shadow-lg">
                    
                    {/* Cercle SVG animé */}
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                      <circle
                        className="text-gray-200"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        cx="18"
                        cy="18"
                        r="15.9155"
                      />
                      <circle
                        className="text-green-600 transition-all duration-150"
                        strokeWidth="3.8"
                        stroke="currentColor"
                        fill="none"
                        cx="18"
                        cy="18"
                        r="15.9155"
                        strokeDasharray="100, 100"
                        strokeDashoffset={100 - progress}
                      />
                    </svg>

                    <p className="mt-4 text-center text-green-700 font-semibold">{progressText}</p>
                  </div>
                </div>
              )}


                {importStatus && !importing && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-lg p-6 w-96 text-center shadow-lg">
                      <h2 className={`text-xl font-semibold mb-4 ${importStatus.success ? 'text-green-700' : 'text-red-600'}`}>
                        {importStatus.success ? 'Succès' : 'Erreur'}
                      </h2>
                      <p className="mb-4">{importStatus.message}</p>
                      <button onClick={() => setImportStatus(null)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">OK</button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Importation;
