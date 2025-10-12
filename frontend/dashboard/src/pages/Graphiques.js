// 📁 Tableaux.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
} from "recharts";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, FileSpreadsheet, Home } from "lucide-react";

const COLORS = [
  '#42A5F5','#66BB6A','#FF7043','#FFEE58','#AB47BC','#26A69A','#EC407A','#7E57C2',
  '#29B6F6','#D4E157','#FFA726','#8D6E63','#BDBDBD','#78909C','#EF5350','#5C6BC0',
  '#9CCC65','#90A4AE','#FFCA28','#BA68C8','#4DD0E1','#E57373','#A1887F','#64B5F6',
  '#FFB74D','#F06292','#C6FF00','#00E5FF','#651FFF','#FF3D00'
];

// Utils
const fmtNum = v => new Intl.NumberFormat('fr-FR').format(Number(v) || 0);
const fmtFCFA = v => `${fmtNum(v)} FCFA`;
const merge = (a = [], b = []) => [...new Set([...(a || []), ...(b || [])])];
const totals = (data, types) =>
  types.reduce((acc, t) => ({ ...acc, [t]: data.reduce((s, r) => s + (+r[t] || 0), 0) }), { total: data.reduce((s, r) => s + (+r.total || 0), 0) });
const fmtData = (raw = [], types = [], key = "departement") =>
  raw.map(r => ({
    name: r[key] || r.name || "",
    ...types.reduce((acc, t) => ({ ...acc, [t]: +r[t] || 0 }), {}),
    total: types.reduce((s, t) => s + (+r[t] || 0), 0)
  }));

const SectionEmpty = ({ title }) => (
  <div className="p-6 text-center text-gray-500 italic">
    <p className="text-lg font-medium">{title}</p>
    <p className="mt-2">Aucune donnée disponible pour la période sélectionnée.</p>
  </div>
);

const Tableaux = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const base = "http://localhost:5000/auth";

  const sections = {
    departement: useRef(), commune: useRef(),
    filiere: useRef(), pda: useRef()
  };

  const [data, setData] = useState({
    departement: { projets: [], credits: [], tProj: [], tCred: [] },
    commune: { projets: [], credits: [], tProj: [], tCred: [] },
    filiere: { projets: [], credits: [], tProj: [], tCred: [] },
    pda: { projets: [], credits: [], tProj: [], tCred: [] }
  });

  const fetchData = async (path) => {
    const url = `${base}/${path}?start_date=${dates.start}&end_date=${dates.end}`;
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const loadAll = async () => {
    if (!dates.start || !dates.end) return setErr("Veuillez choisir les deux dates.");
    setErr(""); setLoading(true);
    try {
      const endpoints = [
        ["departement", "projets-par-departement", "credits-par-departement"],
        ["commune", "projets-par-commune", "credits-par-commune"],
        ["filiere", "promoteurs-par-filiere", "credits-par-filiere"],
        ["pda", "projets-par-pda", "credits-par-pda"]
      ];

      const results = await Promise.all(endpoints.flatMap(([k, p1, p2]) =>
        [fetchData(p1), fetchData(p2)]
      ));

      const newData = {};
      endpoints.forEach(([key], i) => {
        const [proj, cred] = [results[i * 2], results[i * 2 + 1]];
        newData[key] = {
          projets: proj.data || [], credits: cred.data || [],
          tProj: proj.types_projet || [], tCred: cred.types_projet || []
        };
      });
      setData(newData);
    } catch (e) {
      console.error(e);
      setErr("Erreur de chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  const saveImage = (ref, name) => ref.current && html2canvas(ref.current, {
    ignoreElements: el => el.tagName === "BUTTON", backgroundColor: "#fff"
  }).then(canvas => {
    const a = document.createElement("a");
    a.download = `${name}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  });

  // Export Excel
  const exportToExcel = (rows, filename) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Données");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${filename}.xlsx`);
  };

  const renderSection = (key, title) => {
    const { projets, credits, tProj, tCred } = data[key];
    const merged = merge(tProj, tCred);
    const pData = fmtData(projets, merged, key);
    const cData = fmtData(credits, merged, key);
    const pTot = totals(pData, merged);
    const cTot = totals(cData, merged);

    if (!pData.length && !cData.length) return <SectionEmpty title={title} />;

    const renderTable = (rows, tot, fmt, label, fname) => (
      <div className="overflow-x-auto mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
          <button
            onClick={() => exportToExcel(rows, fname)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md shadow-sm text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exporter en Excel
          </button>
        </div>
        <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left capitalize">{key}</th>
              {merged.map(t => <th key={t} className="border px-4 py-2 text-right">{t}</th>)}
              <th className="border px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50 hover:bg-green-50 transition">
                <td className="border px-4 py-2">{r.name}</td>
                {merged.map(t => <td key={t} className="border px-4 py-2 text-right">{fmt(r[t])}</td>)}
                <td className="border px-4 py-2 text-right font-semibold text-green-700">{fmt(r.total)}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-semibold">
              <td className="border px-4 py-2">Totaux</td>
              {merged.map(t => <td key={t} className="border px-4 py-2 text-right">{fmt(tot[t])}</td>)}
              <td className="border px-4 py-2 text-right">{fmt(tot.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    return (
      <section ref={sections[key]} className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">{title}</h2>

        {/* Graphiques pour filière, PDA, département */}
        {key !== "commune" && cData.length > 0 && (
          <div className="flex justify-center items-center mb-6 gap-6 flex-wrap">
            <div style={{ width: 400, height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
                  >
                    {cData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => fmtFCFA(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
              {cData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    style={{ width: 20, height: 20, backgroundColor: COLORS[index % COLORS.length] }}
                    className="rounded-sm"
                  ></div>
                  <span className="text-gray-700">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {renderTable(pData, pTot, fmtNum, `Nombre de projets par ${key}`, `projets_par_${key}`)}
        {renderTable(cData, cTot, fmtFCFA, `Montant des crédits par ${key}`, `credits_par_${key}`)}

        <div className="text-center mt-5">
          <button
            onClick={() => saveImage(sections[key], `rapport_${key}`)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm mx-auto"
          >
            <Download className="w-4 h-4" /> Enregistrer la section
          </button>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-8">
      <div className="w-full max-w-6xl flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-sm"
        >
          <Home className="w-5 h-5" /> Retour au Dashboard
        </button>
      </div>

      {/* Filtres */}
      <section className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Filtrer par date de comité de validation
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          {["start", "end"].map((k, i) => (
            <div key={k}>
              <label className="block text-gray-600 mb-1">{i ? "Date de fin" : "Date de début"}</label>
              <input
                type="date"
                value={dates[k]}
                onChange={e => setDates({ ...dates, [k]: e.target.value })}
                className="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-green-300"
              />
            </div>
          ))}
          <button
            onClick={loadAll}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-sm"
          >
            Appliquer
          </button>
        </div>
        {err && <p className="mt-3 text-red-600 text-center">{err}</p>}
        {loading && <p className="mt-3 text-center text-gray-600">Chargement des données...</p>}
      </section>

      {/* Sections */}
      {renderSection("filiere", "Filières")}
      {renderSection("pda", "PDA")}
      {renderSection("departement", "Départements")}
      {renderSection("commune", "Communes")}
    </div>
  );
};

export default Tableaux;
















// import React, { useEffect, useState } from "react";
// import Plot from "react-plotly.js";
// import axios from "axios";

// function Graphique3DClairPDA() {
//   const [dataPDA, setDataPDA] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     axios
//       .get("http://127.0.0.1:5000/auth/stats/credits-par-pda", {
//         params: {
//           start_date: "2021-01-01",
//           end_date: "2025-12-31",
//         },
//       })
//       .then((response) => {
//         const data = response.data.data;
//         const total = data.reduce((acc, item) => acc + item.value, 0);
//         const formatted = data.map((item) => ({
//           ...item,
//           percentage: ((item.value / total) * 100).toFixed(2),
//         }));
//         setDataPDA(formatted);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Erreur API:", err);
//         setError("Impossible de récupérer les données du graphique.");
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p className="text-gray-500">Chargement du graphique...</p>;
//   if (error) return <p className="text-red-500">{error}</p>;

//   const noms = dataPDA.map((item) => item.name);
//   const valeurs = dataPDA.map((item) => item.value);
//   const pourcentages = dataPDA.map((item) => item.percentage);

//   return (
//     <div className="bg-white shadow-xl rounded-2xl p-6">
//       <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
//         Répartition des crédits accordés par PDA (Vue 3D)
//       </h2>

//       <Plot
//         data={[
//           {
//             type: "bar3d", // Effet 3D simulé via barres verticales
//             x: noms,
//             y: valeurs,
//             text: pourcentages.map((p) => p + " %"),
//             textposition: "auto",
//             hovertext: noms.map(
//               (n, i) =>
//                 `${n}<br><b>${valeurs[i].toLocaleString()} FCFA</b><br>${pourcentages[i]} %`
//             ),
//             marker: {
//               color: valeurs,
//               colorscale: "Viridis",
//               showscale: true,
//               line: { color: "#fff", width: 1 },
//             },
//           },
//         ]}
//         layout={{
//           title: {
//             text: "Montant total des crédits par PDA",
//             font: { size: 18 },
//           },
//           scene: {
//             xaxis: { title: "Nom du PDA" },
//             yaxis: { title: "Montant (FCFA)" },
//             zaxis: { title: "" },
//           },
//           margin: { l: 50, r: 30, t: 60, b: 80 },
//           height: 500,
//           paper_bgcolor: "transparent",
//           plot_bgcolor: "transparent",
//           showlegend: false,
//         }}
//         config={{
//           responsive: true,
//           displayModeBar: true,
//           scrollZoom: true,
//           displaylogo: false,
//         }}
//       />
//       <p className="text-sm text-gray-600 mt-2 text-center italic">
//         Chaque barre représente un PDA. La hauteur indique le montant total accordé, et la
//         couleur représente la part relative dans le total (%).
//       </p>
//     </div>
//   );
// }

// export default Graphique3DClairPDA;
