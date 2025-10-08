import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { FiInbox } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png'; // ⚠️ Assure-toi du chemin

/* ---------- Styles personnalisés ---------- */
const customStyles = {
  headCells: {
    style: {
      paddingLeft: '24px',
      paddingRight: '24px',
      fontWeight: 'bold',
      fontSize: '16px',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      lineHeight: '1.2',
      minHeight: '48px',
    },
  },
  cells: {
    style: {
      paddingLeft: '24px',
      paddingRight: '24px',
      fontSize: '14px',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      lineHeight: '1.2',
    },
  },
};

/* ---------- Colonnes ---------- */
const colonnes = [
  { name: 'Date Comité', selector: r => r.date_comite_validation, sortable: true, minWidth: '150px' },
  { name: 'Intitulé Projet', selector: r => r.intitule_projet, sortable: true, minWidth: '250px' },
  { name: 'Crédit Solicité', selector: r => r.credit_solicite ? Number(r.credit_solicite).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Crédit Accordé', selector: r => r.credit_accorde ? Number(r.credit_accorde).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Commune', selector: r => r.nom_commune, sortable: true, minWidth: '120px' },
  { name: 'Filière', selector: r => r.nom_filiere, sortable: true, minWidth: '120px' },
  { name: 'PSF', selector: r => r.nom_psf, sortable: true, minWidth: '120px' },
  { name: 'Promoteur', selector: r => `${r.nom_promoteur ?? ''}`.trim(), sortable: true, minWidth: '180px' },
  { name: 'Créé le', selector: r => r.created_at , sortable: true, minWidth: '170px' },
  { name: 'Créé par', selector: r => r.created_by, sortable: true, minWidth: '150px' },
];

function ProjetsParFacilite() {
  const { id_type_projet } = useParams();
  const [projets, setProjets] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    nom_commune: '',
    nom_filiere: '',
    nom_psf: '',
    nom_promoteur: '',
    intitule_projet: '',
  });
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* --- Récupération des données --- */
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/auth/${id_type_projet}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Erreur de chargement'); return r.json(); })
      .then(d => { setProjets(d); setFilteredData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id_type_projet]);

  /* --- Application des filtres et recherche --- */
  useEffect(() => {
    let temp = projets;

    if (filters.nom_commune)
      temp = temp.filter(r => r.nom_commune === filters.nom_commune);

    if (filters.nom_filiere)
      temp = temp.filter(r => r.nom_filiere === filters.nom_filiere);

    if (filters.nom_psf)
      temp = temp.filter(r => r.nom_psf === filters.nom_psf);

    if (filters.nom_promoteur)
      temp = temp.filter(r => r.nom_promoteur?.toLowerCase().includes(filters.nom_promoteur.toLowerCase()));

    if (filters.intitule_projet)
      temp = temp.filter(r => r.intitule_projet?.toLowerCase().includes(filters.intitule_projet.toLowerCase()));

    if (searchText) {
      const q = searchText.toLowerCase();
      temp = temp.filter(r => Object.values(r).some(v => v?.toString().toLowerCase().includes(q)));
    }

    setFilteredData(temp);
  }, [filters, searchText, projets]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  /* --- Export Excel --- */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Facilite_${id_type_projet}`);
    XLSX.writeFile(wb, `facilite_${id_type_projet}.xlsx`);
  };

  /* --- Export PDF --- */
  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const tableColumn = colonnes.map(c => c.name);

    const tableRows = filteredData.map(row =>
      colonnes.map(col => {
        const key = col.selector(row);
        return key ?? '';
      })
    );

    doc.setFontSize(14);
    doc.text(`Projets – Facilité ${id_type_projet}`, 14, 15);
    if (logo) doc.addImage(logo, 'PNG', 250, 5, 40, 20);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
    });

    doc.save(`facilite_${id_type_projet}.pdf`);
  };

  const NoData = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
      <FiInbox size={48} className="mb-4 text-green-700" />
      <p className="text-xl font-semibold">Aucun projet trouvé</p>
      <p className="max-w-md mt-2 text-gray-400">
        {searchText
          ? "Aucun résultat ne correspond à votre recherche."
          : "Il n'y a aucun projet à afficher pour le moment."}
      </p>
    </div>
  );

  if (loading) return <div className="p-6 text-center text-gray-700">Chargement…</div>;
  if (error) return <div className="p-6 text-center text-red-600">Erreur : {error}</div>;

  /* ---------- Rendu ---------- */
  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-green-700 mb-8 text-center">
        Projets – Facilité {id_type_projet}
      </h2>

      {/* 🔹 Barre de recherche + export */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher un projet..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2">
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Excel
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            PDF
          </button>
        </div>
      </div>

      {/* 🔹 Filtres */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Filtres avancés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select value={filters.nom_commune} onChange={e => handleFilterChange('nom_commune', e.target.value)} className="px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500">
            <option value="">Choisir une commune</option>
            {[...new Set(projets.map(p => p.nom_commune))].filter(Boolean).map(c => <option key={c}>{c}</option>)}
          </select>

          <select value={filters.nom_filiere} onChange={e => handleFilterChange('nom_filiere', e.target.value)} className="px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500">
            <option value="">Choisir une filière</option>
            {[...new Set(projets.map(p => p.nom_filiere))].filter(Boolean).map(f => <option key={f}>{f}</option>)}
          </select>

          <select value={filters.nom_psf} onChange={e => handleFilterChange('nom_psf', e.target.value)} className="px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500">
            <option value="">Choisir un PSF</option>
            {[...new Set(projets.map(p => p.nom_psf))].filter(Boolean).map(psf => <option key={psf}>{psf}</option>)}
          </select>

          <input
            type="text"
            placeholder="Nom promoteur..."
            value={filters.nom_promoteur}
            onChange={e => handleFilterChange('nom_promoteur', e.target.value)}
            className="px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* 🔹 Tableau */}
      <div className="overflow-x-auto">
        <DataTable
          columns={colonnes}
          data={filteredData}
          pagination
          paginationPerPage={50}
          paginationRowsPerPageOptions={[25, 50, 100, 200]}
          fixedHeader
          fixedHeaderScrollHeight="600px"
          highlightOnHover
          responsive
          customStyles={customStyles}
          noHeader
          noDataComponent={<NoData />}
        />
      </div>
    </div>
  );
}

export default ProjetsParFacilite;
