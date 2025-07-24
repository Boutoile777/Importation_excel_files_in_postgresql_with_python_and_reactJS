import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { FiInbox } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png'; // Assure-toi que ce logo est bien un base64 ou remplace par URL/chemin valide

const customStyles = {
  headCells: {
    style: {
      paddingLeft: '24px',
      paddingRight: '24px',
      fontWeight: 'bold',
      fontSize: '16px',
      whiteSpace: 'normal',    // autoriser retour à la ligne
      wordWrap: 'break-word',  // couper les mots si nécessaire
      lineHeight: '1.2',       // ajuster la hauteur de ligne pour lisibilité
      minHeight: '48px',       // ajuster la hauteur pour que ça tienne bien
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


const colonnes = [
  { name: 'Date Comité', selector: row => row.date_comite_validation, sortable: true, minWidth: '180px' },
  { name: 'Intitulé Projet', selector: row => row.intitule_projet, sortable: true, minWidth: '250px', wrap: true },
  { name: 'Coût Total', selector: row => row.cout_total_projet ? Number(row.cout_total_projet).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Crédit Solicité', selector: row => row.credit_solicite ? Number(row.credit_solicite).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Crédit Accordé', selector: row => row.credit_accorde ? Number(row.credit_accorde).toLocaleString() : '', sortable: true, minWidth: '140px' },
  { name: 'Refinancement Accordé', selector: row => row.refinancement_accorde ? Number(row.refinancement_accorde).toLocaleString() : '', sortable: true, minWidth: '170px' },
  { name: 'Total Financement', selector: row => row.total_financement ? Number(row.total_financement).toLocaleString() : '', sortable: true, minWidth: '160px' },
  { name: 'Commune', selector: row => row.nom_commune, sortable: true, minWidth: '120px' },
  { name: 'Filière', selector: row => row.nom_filiere, sortable: true, minWidth: '120px' },
  { name: 'PSF', selector: row => row.nom_psf, sortable: true, minWidth: '120px' },
  { name: 'Promoteur', selector: row => row.nom_promoteur , sortable: true, minWidth: '180px' },
  { name: 'Statut Dossier', selector: row => row.statut_dossier, sortable: true, minWidth: '150px' },
  { name: 'Crédit Accordé Statut', selector: row => row.credit_accorde_statut, sortable: true, minWidth: '170px' },
  { name: 'Type projet', selector: row => row.nom_type_projet, sortable: true, minWidth: '150px' },
  { name: 'Créé le', selector: row => row.created_at, sortable: true, minWidth: '190px' },
  { name: 'Créé par', selector: row => row.created_by, sortable: true, minWidth: '220px' },
];

function ProjetsFinancementTable() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/auth/projets_financement', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData(json);
        setFilteredData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!searchText) {
      setFilteredData(data);
      return;
    }
    const lowercasedFilter = searchText.toLowerCase();
    const filtered = data.filter(item =>
      Object.values(item).some(value =>
        value && typeof value === 'string'
          ? value.toLowerCase().includes(lowercasedFilter)
          : value != null && value.toString().toLowerCase().includes(lowercasedFilter)
      )
    );
    setFilteredData(filtered);
  }, [searchText, data]);

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Projets');
    XLSX.writeFile(workbook, 'projets_financement.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // paysage

    const tableColumn = colonnes.map(col => col.name);

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
      'Promoteur': null,
      'Statut Dossier': 'statut_dossier',
      'Crédit Accordé Statut': 'credit_accorde_statut',
      'Type projet': 'nom_type_projet',  // attention à la casse aussi !
      'Créé le': 'created_at',
      'Créé par': 'created_by',
    };


    const tableRows = filteredData.map(row =>
      colonnes.map(col => {
        if (col.name === 'Promoteur') {
          return `${row.nom_promoteur || ''} ${row.prenom_promoteur || ''}`;
        }
        const key = keyMap[col.name];
        if (key && row[key] !== undefined && row[key] !== null) {
          if (
            [
              'cout_total_projet',
              'credit_solicite',
              'credit_accorde',
              'refinancement_accorde',
              'total_financement',
            ].includes(key)
          ) {
            return Number(row[key]);
          }
          return row[key].toString();
        }
        return '';
      })
    );

    doc.setFontSize(14);
    doc.text('Projets de Financement', 14, 15);
    if(logo) {
      doc.addImage(logo, 'PNG', 250, 5, 40, 20);
    }



    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [46, 125, 50],
        textColor: 255,
      },
      didDrawPage: data => {
        const pageNumber = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${pageNumber}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10
        );
      },
      // didParseCell: data => {
      //   const montantCols = [2, 3, 4, 5, 6];
      //   if (
      //     montantCols.includes(data.column.index) &&
      //     typeof data.cell.raw === 'number'
      //   ) {
      //     data.cell.text = data.cell.raw.toLocaleString();
      //   }
      // },
    });

    doc.save('projets_financement.pdf');
  };

  if (loading) return <div className="p-6 text-center text-gray-700">Chargement des projets...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Erreur: {error}</div>;

  const NoDataMessage = () => (
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

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl md:text-4xl font-extrabold text-green-700 mb-8 text-center">
        Projets de Financement
      </h2>

      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Rechercher dans les projets..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Télécharger Excel
          </button>
          <button
            onClick={exportPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Télécharger PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <DataTable
          columns={colonnes}
          data={filteredData}
          pagination
          fixedHeader
          fixedHeaderScrollHeight="600px"
          highlightOnHover
          responsive
          customStyles={customStyles}
          noHeader
          noDataComponent={<NoDataMessage />}
        />
      </div>
    </div>
  );
}

export default ProjetsFinancementTable;
