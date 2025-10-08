import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList
} from "recharts";
import html2canvas from "html2canvas";

// --------------------- Helpers ---------------------
const formatNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat('fr-FR').format(n);
};

const formatMontant = (value) => {
  if (value === null || value === undefined || value === "") return "0 FCFA";
  const n = Number(value);
  if (!Number.isFinite(n)) return "0 FCFA";
  return `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;
};

const mergeTypes = (typesA = [], typesB = []) => {
  const merged = [];
  (typesA || []).forEach(t => { if (!merged.includes(t)) merged.push(t); });
  (typesB || []).forEach(t => { if (!merged.includes(t)) merged.push(t); });
  return merged;
};

const formatTableData = (rawData = [], types = [], keyName = "departement") => {
  if (!Array.isArray(rawData)) return [];
  return rawData.map(row => {
    const displayName = row[keyName] ?? row.name ?? "";
    const formatted = { name: displayName, total: 0 };
    types.forEach(type => {
      const val = Number(row[type]) || 0;
      formatted[type] = val;
      formatted.total += val;
    });
    return formatted;
  });
};

const calculateTotals = (data = [], types = []) => {
  const totals = {};
  types.forEach(type => { totals[type] = (data || []).reduce((s, r) => s + (Number(r[type]) || 0), 0); });
  totals.total = Object.values(totals).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
  return totals;
};

// --------------------- Component ---------------------
const Tableaux = () => {
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [deptProjets, setDeptProjets] = useState([]);
  const [commProjets, setCommProjets] = useState([]);
  const [filProjets, setFilProjets] = useState([]);
  const [pdaProjets, setPdaProjets] = useState([]);

  const [deptCredits, setDeptCredits] = useState([]);
  const [commCredits, setCommCredits] = useState([]);
  const [filCredits, setFilCredits] = useState([]);
  const [pdaCredits, setPdaCredits] = useState([]);

  const [typesDeptCount, setTypesDeptCount] = useState([]);
  const [typesDeptCredit, setTypesDeptCredit] = useState([]);
  const [typesCommCount, setTypesCommCount] = useState([]);
  const [typesCommCredit, setTypesCommCredit] = useState([]);
  const [typesFilCount, setTypesFilCount] = useState([]);
  const [typesFilCredit, setTypesFilCredit] = useState([]);
  const [typesPdaCount, setTypesPdaCount] = useState([]);
  const [typesPdaCredit, setTypesPdaCredit] = useState([]);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const deptRef = useRef();
  const commRef = useRef();
  const filRef = useRef();
  const pdaRef = useRef();

  const COLORS = [
    '#42A5F5','#66BB6A','#FF7043','#FFEE58','#AB47BC','#26A69A','#EC407A','#7E57C2',
    '#29B6F6','#D4E157','#FFA726','#8D6E63','#BDBDBD','#78909C','#EF5350','#5C6BC0',
    '#9CCC65','#90A4AE','#FFCA28','#BA68C8','#4DD0E1','#E57373','#A1887F','#64B5F6',
    '#FFB74D','#F06292','#C6FF00','#00E5FF','#651FFF','#FF3D00'
  ];

  const base = "http://localhost:5000/auth";

  const fetchEndpoint = async (path) => {
    const url = `${base}/${path}?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Erreur sur ${path} : ${res.status} ${txt}`);
    }
    return await res.json();
  };

  const fetchAll = async () => {
    if (!startDate || !endDate) { setGlobalError("Veuillez choisir une date de début et une date de fin."); return; }
    setGlobalError(""); setLoading(true);

    const endpoints = [
      {key: 'deptCount', path: 'projets-par-departement'},
      {key: 'deptCredit', path: 'credits-par-departement'},
      {key: 'commCount', path: 'projets-par-commune'},
      {key: 'commCredit', path: 'credits-par-commune'},
      {key: 'filCount', path: 'promoteurs-par-filiere'},
      {key: 'filCredit', path: 'credits-par-filiere'},
      {key: 'pdaCount', path: 'projets-par-pda'},
      {key: 'pdaCredit', path: 'credits-par-pda'}
    ];

    try {
      const promises = endpoints.map(e => fetchEndpoint(e.path).then(
        data => ({ status: "fulfilled", key: e.key, data }),
        err => ({ status: "rejected", key: e.key, error: err })
      ));
      const results = await Promise.all(promises);

      // Reset previous
      setDeptProjets([]); setDeptCredits([]);
      setCommProjets([]); setCommCredits([]);
      setFilProjets([]); setFilCredits([]);
      setPdaProjets([]); setPdaCredits([]);

      results.forEach(r => {
        if (r.status === "fulfilled") {
          const { key, data: payload } = r;
          switch (key) {
            case 'deptCount': setDeptProjets(payload.data || []); setTypesDeptCount(payload.types_projet || []); break;
            case 'deptCredit': setDeptCredits(payload.data || []); setTypesDeptCredit(payload.types_projet || []); break;
            case 'commCount': setCommProjets(payload.data || []); setTypesCommCount(payload.types_projet || []); break;
            case 'commCredit': setCommCredits(payload.data || []); setTypesCommCredit(payload.types_projet || []); break;
            case 'filCount': setFilProjets(payload.data || []); setTypesFilCount(payload.types_projet || []); break;
            case 'filCredit': setFilCredits(payload.data || []); setTypesFilCredit(payload.types_projet || []); break;
            case 'pdaCount': setPdaProjets(payload.data || []); setTypesPdaCount(payload.types_projet || []); break;
            case 'pdaCredit': setPdaCredits(payload.data || []); setTypesPdaCredit(payload.types_projet || []); break;
            default: break;
          }
        } else { console.error("API error:", r.key, r.error); }
      });

    } catch (err) {
      console.error(err); setGlobalError("Erreur lors du chargement des données.");
    } finally { setLoading(false); }
  };

  const saveSectionAsImage = (ref, fileName) => {
    if (!ref || !ref.current) return;
    html2canvas(ref.current, { ignoreElements: el => el.tagName==="BUTTON", backgroundColor:"#fff" })
      .then(canvas => {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = canvas.toDataURL("image/png");
        link.click();
      });
  };

  const SectionNoData = ({ title }) => (
    <div className="p-6 text-center text-gray-600">
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-2">Aucune donnée trouvée pour la période sélectionnée. Les projets dorment encore 😴</p>
      <p className="mt-2 text-sm text-gray-400">Essayez une autre plage de dates.</p>
    </div>
  );

  const renderSection = (ref, title, projets, credits, typesCount, typesCredit, keyName) => {
    const mergedTypes = mergeTypes(typesCredit, typesCount);
    const tableProjetsData = formatTableData(projets, mergedTypes, keyName);
    const tableCreditsData = formatTableData(credits, mergedTypes, keyName);

    return (
      <section ref={ref} className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">{title}</h2>
        { (credits.length === 0 && projets.length === 0) ? (
          <SectionNoData title={title} />
        ) : (
          <>
            <div className="w-full mb-6" style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tableCreditsData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatNumber} />
                  <Tooltip formatter={(v) => [formatMontant(v), ""]} />
                  <Legend />
                  {mergedTypes.map((type, idx) => (
                    <Bar key={type} dataKey={type} name={type} fill={COLORS[idx % COLORS.length]}>
                      <LabelList dataKey={type} position="top" formatter={formatNumber} />
                    </Bar>
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tableau Nombres */}
            <div className="overflow-x-auto mb-6">
              <h3 className="text-lg font-semibold mb-2">Nombre par {keyName}</h3>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2 text-left">{keyName}</th>
                    {mergedTypes.map(type => <th key={type} className="border px-4 py-2 text-right">{type}</th>)}
                    <th className="border px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tableProjetsData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {mergedTypes.map(type => <td key={type} className="border px-4 py-2 text-right font-mono">{formatNumber(row[type])}</td>)}
                      <td className="border px-4 py-2 text-right font-semibold text-green-700">{formatNumber(row.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-semibold">
                    <td className="border px-4 py-2">Totaux</td>
                    {mergedTypes.map(type => <td key={type} className="border px-4 py-2 text-right">{formatNumber(calculateTotals(tableProjetsData, mergedTypes)[type])}</td>)}
                    <td className="border px-4 py-2 text-right">{formatNumber(calculateTotals(tableProjetsData, mergedTypes).total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tableau Montants */}
            <div className="overflow-x-auto mb-4">
              <h3 className="text-lg font-semibold mb-2">Montant des crédits par {keyName}</h3>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2 text-left">{keyName}</th>
                    {mergedTypes.map(type => <th key={type} className="border px-4 py-2 text-right">{type}</th>)}
                    <th className="border px-4 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {tableCreditsData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {mergedTypes.map(type => <td key={type} className="border px-4 py-2 text-right font-mono">{formatMontant(row[type])}</td>)}
                      <td className="border px-4 py-2 text-right font-semibold text-green-700">{formatMontant(row.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-semibold">
                    <td className="border px-4 py-2">Totaux</td>
                    {mergedTypes.map(type => <td key={type} className="border px-4 py-2 text-right">{formatMontant(calculateTotals(tableCreditsData, mergedTypes)[type])}</td>)}
                    <td className="border px-4 py-2 text-right">{formatMontant(calculateTotals(tableCreditsData, mergedTypes).total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => saveSectionAsImage(ref, `rapport_${keyName}.png`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
              >
                Enregistrer cette section
              </button>
            </div>
          </>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-8">
      <div className="w-full max-w-6xl flex justify-between mb-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition shadow-md"
        >
          Retour au Dashboard
        </button>
      </div>

      <section className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Filtrer par date de comité de validation
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div>
            <label className="block text-gray-600 mb-1">Date de début</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-green-300"/>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Date de fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-green-300"/>
          </div>
          <button onClick={fetchAll} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md">
            Appliquer
          </button>
        </div>
        {globalError && <p className="mt-3 text-red-600 text-center">{globalError}</p>}
        {loading && <p className="mt-3 text-center text-gray-600">Chargement des données...</p>}
      </section>

      {renderSection(deptRef, "Départements", deptProjets, deptCredits, typesDeptCount, typesDeptCredit, "departement")}
      {renderSection(commRef, "Communes", commProjets, commCredits, typesCommCount, typesCommCredit, "commune")}
      {renderSection(filRef, "Filières", filProjets, filCredits, typesFilCount, typesFilCredit, "filiere")}
      {renderSection(pdaRef, "PDA", pdaProjets, pdaCredits, typesPdaCount, typesPdaCredit, "pda")}

    </div>
  );
};

export default Tableaux;
