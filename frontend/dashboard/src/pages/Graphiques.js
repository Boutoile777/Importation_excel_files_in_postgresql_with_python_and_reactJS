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
  const [creditsCommune, setCreditsCommune] = useState([]);
  const [typesProjetCommune, setTypesProjetCommune] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Références pour chaque section
  const projetsRef = useRef();
  const promoteursRef = useRef();
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

  // Fonction pour capturer et sauvegarder une section
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

  // --- Fonction pour transformer les données en tableau croisé ---
  const formatTableData = (data, types) => {
    const grouped = {};
    data.forEach((row) => {
      const key = row.departement || row.filiere || row.commune;
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

      {/* Messages */}
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

            {/* Tableau croisé dynamique */}
            <div className="w-full mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Département</th>
                    {typesProjetDept.map((type) => (
                      <th key={type} className="border px-4 py-2">{type}</th>
                    ))}
                    <th className="border px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formatTableData(projetsDept, typesProjetDept).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {typesProjetDept.map((type) => (
                        <td key={type} className="border px-4 py-2">{row[type]}</td>
                      ))}
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
              <BarChart width={700} height={300} data={formatTableData(promoteursFiliere, typesProjetFiliere)} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
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
                    {typesProjetFiliere.map((type) => (
                      <th key={type} className="border px-4 py-2">{type}</th>
                    ))}
                    <th className="border px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formatTableData(promoteursFiliere, typesProjetFiliere).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {typesProjetFiliere.map((type) => (
                        <td key={type} className="border px-4 py-2">{row[type]}</td>
                      ))}
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

      {/* --- Section 3 : Crédits par commune --- */}
      {!loading && creditsCommune.length > 0 && (
        <section ref={creditsRef} className="bg-white w-full max-w-6xl p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
            Crédits par commune
          </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-full flex justify-center">
              <PieChart width={600} height={400}>
                <Pie
                  data={creditsCommune}
                  dataKey="total"
                  nameKey="commune"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, value }) => `${name}: ${value}`}
                  paddingAngle={3}
                >
                  {creditsCommune.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}`, "Montant crédits"]} />
              </PieChart>
            </div>

            <div className="w-full mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border px-4 py-2">Commune</th>
                    {typesProjetCommune.map((type) => (
                      <th key={type} className="border px-4 py-2">{type}</th>
                    ))}
                    <th className="border px-4 py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formatTableData(creditsCommune, typesProjetCommune).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{row.name}</td>
                      {typesProjetCommune.map((type) => (
                        <td key={type} className="border px-4 py-2">{row[type]}</td>
                      ))}
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
