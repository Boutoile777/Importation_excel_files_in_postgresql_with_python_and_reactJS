import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList,
  PieChart, Pie, Cell
} from "recharts";

const Graphiques = () => {
  const navigate = useNavigate();
  const [projetsDept, setProjetsDept] = useState([]);
  const [promoteursFiliere, setPromoteursFiliere] = useState([]);
  const [creditsCommune, setCreditsCommune] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // filtres de date
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#FF6384'];

  // fonction pour charger les données
  const fetchData = async () => {
    if (!startDate || !endDate) {
      setErrorMessage("Veuillez choisir une date de début et de fin.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const resProjets = await fetch(
        `http://localhost:5000/auth/projets-par-departement?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );
      if (!resProjets.ok) throw new Error("Erreur lors du chargement des projets par département");
      setProjetsDept(await resProjets.json());

      const resPromoteurs = await fetch(
        `http://localhost:5000/auth/promoteurs-par-filiere?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );
      if (!resPromoteurs.ok) throw new Error("Erreur lors du chargement des promoteurs par filière");
      setPromoteursFiliere(await resPromoteurs.json());

      const resCredits = await fetch(
        `http://localhost:5000/auth/credits-par-commune?start_date=${startDate}&end_date=${endDate}`,
        { credentials: "include" }
      );
      if (!resCredits.ok) throw new Error("Erreur lors du chargement des crédits par commune");
      setCreditsCommune(await resCredits.json());

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
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
          Filtrer les données par date de comité de validation
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

      {/* Message de chargement ou erreur */}
      {loading && <p className="text-center text-lg text-gray-600">Chargement des graphiques...</p>}
      {errorMessage && <p className="text-center text-red-600">{errorMessage}</p>}

      {/* Graphique 1 : Projets par département */}
      {!loading && projetsDept.length > 0 && (
        <section className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Projets par département</h2>
          <div className="flex justify-center">
            <BarChart width={700} height={350} data={projetsDept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="departement" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, "Nombre de projets"]} />
              <Legend />
              <Bar dataKey="nb_projets" fill="#8884d8">
                <LabelList dataKey="nb_projets" position="top" />
              </Bar>
            </BarChart>
          </div>
          <p className="mt-4 text-gray-600 text-center">
            Ce graphique montre le nombre de projets financés dans chaque département.
          </p>
        </section>
      )}

      {/* Graphique 2 : Promoteurs par filière */}
      {!loading && promoteursFiliere.length > 0 && (
        <section className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Promoteurs par filière</h2>
          <div className="flex justify-center">
            <BarChart width={700} height={350} data={promoteursFiliere}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="filiere" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value}`, "Nombre de promoteurs"]} />
              <Legend />
              <Bar dataKey="nb_promoteurs" fill="#82ca9d">
                <LabelList dataKey="nb_promoteurs" position="top" />
              </Bar>
            </BarChart>
          </div>
          <p className="mt-4 text-gray-600 text-center">
            Ce graphique représente le nombre de promoteurs actifs par filière.
          </p>
        </section>
      )}

      {/* Graphique 3 : Crédits par commune */}
      {!loading && creditsCommune.length > 0 && (
        <section className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg hover:shadow-2xl transition">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">Crédits par commune</h2>
          <div className="flex justify-center">
            <PieChart width={500} height={400}>
              <Pie
                data={creditsCommune}
                dataKey="total_credits"
                nameKey="commune"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {creditsCommune.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, "Montant crédits"]} />
            </PieChart>
          </div>
          <p className="mt-4 text-gray-600 text-center">
            Ce graphique illustre la répartition des crédits accordés par commune.
          </p>
        </section>
      )}
    </div>
  );
};

export default Graphiques;
