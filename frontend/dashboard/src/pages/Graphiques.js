import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
  PieChart, Pie, Cell
} from "recharts";
import html2canvas from "html2canvas";

const Tableaux = () => {
  const navigate = useNavigate();
  const [projetsDept, setProjetsDept] = useState([]);
  const [typesProjetDept, setTypesProjetDept] = useState([]);
  const [promoteursFiliere, setPromoteursFiliere] = useState([]);
  const [typesProjetFiliere, setTypesProjetFiliere] = useState([]);
  const [projetsPDA, setProjetsPDA] = useState([]);
  const [typesProjetPDA, setTypesProjetPDA] = useState([]);
  const [creditsCommune, setCreditsCommune] = useState([]);
  const [typesProjetCommune, setTypesProjetCommune] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const projetsRef = useRef();
  const promoteursRef = useRef();
  const pdaRef = useRef();
  const creditsRef = useRef();

  const COLORS = ['#4CB5D4', '#F0B067', '#FFBB28', '#FF8042', '#A569BD', '#FF6384'];

  const fetchData = async () => {
    if (!startDate || !endDate) {
      setErrorMessage("Veuillez choisir une date de début et de fin.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      // ✅ Projets par département
      const resProjets = await fetch(
        `http://localhost:5000/auth/projets-par-departement?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );
      if (!resProjets.ok) throw new Error("Erreur projets par département");
      const projetsJson = await resProjets.json();
      setProjetsDept(projetsJson.data || []);
      setTypesProjetDept(projetsJson.types_projet || []);

      // ✅ Promoteurs par filière
      const resPromoteurs = await fetch(
        `http://localhost:5000/auth/promoteurs-par-filiere?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );
      if (!resPromoteurs.ok) throw new Error("Erreur promoteurs par filière");
      const promoteursJson = await resPromoteurs.json();
      setPromoteursFiliere(promoteursJson.data || []);
      setTypesProjetFiliere(promoteursJson.types_projet || []);

      // ✅ Projets par PDA
      const resPDA = await fetch(
        `http://localhost:5000/auth/projets-par-pda?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );
      if (!resPDA.ok) throw new Error("Erreur projets par PDA");
      const pdaJson = await resPDA.json();
      setProjetsPDA(pdaJson.data || []);
      setTypesProjetPDA(pdaJson.types_projet || []);

      // ✅ Crédits par commune
      const resCredits = await fetch(
        `http://localhost:5000/auth/credits-par-commune?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );
      if (!resCredits.ok) throw new Error("Erreur crédits par commune");
      const creditsJson = await resCredits.json();
      setCreditsCommune(creditsJson.data || []);
      setTypesProjetCommune(creditsJson.types_projet || []);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSectionAsImage = (ref, fileName) => {
    if (!ref.current) return;
    html2canvas(ref.current, {
      ignoreElements: (element) => element.tagName === "BUTTON",
      backgroundColor: "#ffffff"
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  };

  // --- Transforme les données en tableau croisé dynamique ---
  const formatTableData = (data, types, keyName = "departement") => {
    const grouped = {};
    data.forEach((row) => {
      const key = row[keyName];
      if (!grouped[key]) grouped[key] = { name: key, total: 0 };
      types.forEach((type) => {
        grouped[key][type] = row[type] || 0;
        grouped[key].total += row[type] || 0;
      });
    });
    return Object.values(grouped);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center space-y-12">
      {/* Retour au Dashboard */}
      <div className="w-full max-w-6xl flex justify-between mb-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition shadow-md"
        >
          Retour au Dashboard
        </button>
      </div>

      {/* Menu de filtres */}
      <section className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
          Filtrer par date de comité de validation
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <div>
            <label className="block text-gray-600 mb-1">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-green-300"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Date de fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-2 rounded-md shadow-sm focus:ring focus:ring-green-300"
            />
          </div>
          <button
            onClick={fetchData}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-md"
          >
            Appliquer
          </button>
        </div>
      </section>

      {loading && <p className="text-center text-lg text-gray-600">Chargement...</p>}
      {errorMessage && <p className="text-center text-red-600">{errorMessage}</p>}

      {/* --- Section 1 : Projets par département --- */}
      {!loading && projetsDept.length > 0 && (
        <section ref={projetsRef} className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
            Projets par département
          </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex justify-center">
              <BarChart width={700} height={300} data={formatTableData(projetsDept, typesProjetDept)} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {typesProjetDept.map((type, idx) => (
                  <Bar key={type} dataKey={type} fill={COLORS[idx % COLORS.length]} name={type}>
                    <LabelList dataKey={type} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </div>
            <div className="w-full mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Département</th>
                    {typesProjetDept.map((type) => <th key={type} className="border px-4 py-2">{type}</th>)}
                    <th className="border px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formatTableData(projetsDept, typesProjetDept).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {typesProjetDept.map((type) => <td key={type} className="border px-4 py-2">{row[type]}</td>)}
                      <td className="border px-4 py-2">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => saveSectionAsImage(projetsRef, "projets_par_departement.png")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
            >
              Enregistrer cette section
            </button>
          </div>
        </section>
      )}

      {/* --- Section 2 : Promoteurs par filière --- */}
      {!loading && promoteursFiliere.length > 0 && (
        <section ref={promoteursRef} className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
            Promoteurs par filière
          </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex justify-center">
              <BarChart width={700} height={300} data={formatTableData(promoteursFiliere, typesProjetFiliere, "filiere")} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {typesProjetFiliere.map((type, idx) => (
                  <Bar key={type} dataKey={type} fill={COLORS[idx % COLORS.length]} name={type}>
                    <LabelList dataKey={type} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </div>
            <div className="w-full mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Filière</th>
                    {typesProjetFiliere.map((type) => <th key={type} className="border px-4 py-2">{type}</th>)}
                    <th className="border px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formatTableData(promoteursFiliere, typesProjetFiliere, "filiere").map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {typesProjetFiliere.map((type) => <td key={type} className="border px-4 py-2">{row[type]}</td>)}
                      <td className="border px-4 py-2">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => saveSectionAsImage(promoteursRef, "promoteurs_par_filiere.png")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
            >
              Enregistrer cette section
            </button>
          </div>
        </section>
      )}

      {/* --- Section 3 : Projets par PDA --- */}
      {!loading && projetsPDA.length > 0 && (
        <section ref={pdaRef} className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
            Projets par PDA
          </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex justify-center">
              <BarChart width={700} height={300} data={formatTableData(projetsPDA, typesProjetPDA, "pda")} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {typesProjetPDA.map((type, idx) => (
                  <Bar key={type} dataKey={type} fill={COLORS[idx % COLORS.length]} name={type}>
                    <LabelList dataKey={type} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </div>
            <div className="w-full mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">PDA</th>
                    {typesProjetPDA.map((type) => <th key={type} className="border px-4 py-2">{type}</th>)}
                    <th className="border px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formatTableData(projetsPDA, typesProjetPDA, "pda").map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {typesProjetPDA.map((type) => <td key={type} className="border px-4 py-2">{row[type]}</td>)}
                      <td className="border px-4 py-2">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => saveSectionAsImage(pdaRef, "projets_par_pda.png")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
            >
              Enregistrer cette section
            </button>
          </div>
        </section>
      )}

      {/* --- Section 4 : Crédits par commune --- */}
      {!loading && creditsCommune.length > 0 && (
        <section ref={creditsRef} className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
            Crédits par commune
          </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex justify-center">
              <PieChart width={700} height={300}>
                <Pie
                  data={formatTableData(creditsCommune, typesProjetCommune, "commune")}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {formatTableData(creditsCommune, typesProjetCommune, "commune").map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>

            </div>
            <div className="w-full mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Commune</th>
                    {typesProjetCommune.map((type) => <th key={type} className="border px-4 py-2">{type}</th>)}
                    <th className="border px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formatTableData(creditsCommune, typesProjetCommune, "commune").map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {typesProjetCommune.map((type) => <td key={type} className="border px-4 py-2">{row[type]}</td>)}
                      <td className="border px-4 py-2">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => saveSectionAsImage(creditsRef, "credits_par_commune.png")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md shadow-md"
            >
              Enregistrer cette section
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Tableaux;
