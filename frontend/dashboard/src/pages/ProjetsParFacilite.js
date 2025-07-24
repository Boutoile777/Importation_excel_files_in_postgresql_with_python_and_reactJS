import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { FiInbox } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png';   // vérifie le chemin ou base64

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

/* ---------- Colonnes (sans Type Projet) ---------- */
const colonnes = [
  { name: 'Date Comité', selector: r => r.date_comite_validation, sortable: true, minWidth: '150px' },
  { name: 'Intitulé Projet', selector: r => r.intitule_projet, sortable: true, minWidth: '250px' },
  { name: 'Coût Total', selector: r => r.cout_total_projet ? Number(r.cout_total_projet).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Crédit Solicité', selector: r => r.credit_solicite ? Number(r.credit_solicite).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Crédit Accordé', selector: r => r.credit_accorde ? Number(r.credit_accorde).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Refinancement Accordé', selector: r => r.refinancement_accorde ? Number(r.refinancement_accorde).toLocaleString() : '', sortable: true, minWidth: '170px' },
  { name: 'Total Financement', selector: r => r.total_financement ? Number(r.total_financement).toLocaleString() : '' , sortable: true, minWidth: '160px' },
  { name: 'Commune', selector: r => r.nom_commune, sortable: true, minWidth: '120px' },
  { name: 'Filière', selector: r => r.nom_filiere, sortable: true, minWidth: '120px' },
  { name: 'PSF', selector: r => r.nom_psf, sortable: true, minWidth: '120px' },
  { name: 'Promoteur', selector: r => `${r.nom_promoteur ?? ''} `.trim(), sortable: true, minWidth: '180px', wrap: true },
  { name: 'Statut Dossier', selector: r => r.statut_dossier, sortable: true, minWidth: '150px' },
  { name: 'Crédit Accordé Statut', selector: r => r.credit_accorde_statut, sortable: true, minWidth: '80px' , wrap: true },
  { name: 'Créé le', selector: r => r.created_at , sortable: true, minWidth: '170px', wrap: true  },
  { name: 'Créé par', selector: r => r.created_by, sortable: true, minWidth: '150px' },
];

function ProjetsParFacilite() {
  const { id_type_projet } = useParams();
  const [projets, setProjets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* --- Récupération des données --- */
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/auth/${id_type_projet}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('Erreur de chargement'); return r.json(); })
      .then(d => { setProjets(d); setFiltered(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id_type_projet]);

  /* --- Recherche full‑text --- */
  useEffect(() => {
    if (!searchText) { setFiltered(projets); return; }
    const q = searchText.toLowerCase();
    setFiltered(
      projets.filter(p =>
        Object.values(p).some(v => v?.toString().toLowerCase().includes(q))
      )
    );
  }, [searchText, projets]);

  /* --- Export Excel --- */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Facilité_${id_type_projet}`);
    XLSX.writeFile(wb, `facilite_${id_type_projet}.xlsx`);
  };

  /* --- Export PDF --- */
  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const tableColumn = colonnes.map(c => c.name);

    const keyMap = {
      'Date Comité': 'date_comite_validation',
      'Intitulé Projet': 'intitule_projet',
      'Coût Total': 'cout_total_projet',
      'Crédit Solicité': 'credit_solicite',
      'Crédit Accordé': 'credit_accorde',
      'Refinancement Accordé': 'refinancement_accorde',
      'Total Financement': 'total_financement',
      'Commune': 'nom_commune',
      'Filière': 'nom_filiere',
      'PSF': 'nom_psf',
      'Promoteur': null,  // on gère à part si besoin
      'Statut Dossier': 'statut_dossier',
      'Crédit Accordé Statut': 'credit_accorde_statut',
      'Créé le': 'created_at',
      'Créé par': 'created_by',
    };

    const montantKeys = [
      'cout_total_projet',
      'credit_solicite',
      'credit_accorde',
      'refinancement_accorde',
      'total_financement',
    ];

    const tableRows = filtered.map(row =>
      colonnes.map(col => {
        if (col.name === 'Promoteur') {
          return `${row.nom_promoteur ?? ''}`.trim();
        }
        const key = keyMap[col.name];
        if (key && row[key] !== undefined && row[key] !== null) {
          if (montantKeys.includes(key)) {
            return Number(row[key]);  // nombre brut, sans formatage toLocaleString
          }
          return row[key].toString();
        }
        return '';
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
      didDrawPage() {
        const p = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${p}`, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 10);
      },
    });

    doc.save(`facilite_${id_type_projet}.pdf`);
  };

  /* --- Composant "pas de données" --- */
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

  /* --- États particuliers --- */
  if (loading) return <div className="p-6 text-center text-gray-700">Chargement…</div>;
  if (error) return <div className="p-6 text-center text-red-600">Erreur : {error}</div>;

  /* ---------- Rendu ---------- */
  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-green-700 mb-8 text-center">
        Projets – Facilité {id_type_projet}
      </h2>

      {/* Barre de recherche + exports */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher un projet…"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2">
          <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Exporter Excel
          </button>
          <button onClick={exportPDF} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Exporter PDF
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <DataTable
          columns={colonnes}
          data={filtered}
          pagination
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
