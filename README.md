# Importation_excel_files_in_postgresql_with_python_and_reactJS
Plateforme d'importation des données receuillis dans les fichiers excel d'une entreprise d'aide agricole dans la base de données générale PostgreSQL avec comme outils Python en Backend et React en FrontEnd


# 📊 Importation Excel dans PostgreSQL

Ce projet permet d'importer des fichiers Excel dans une base de données PostgreSQL via une interface utilisateur moderne réalisée en **React** (frontend) et un **serveur Flask** (backend).

## 🚀 Fonctionnalités principales

- ✅ Importation de fichiers Excel (.xlsx)
- ✅ Nettoyage et affichage des données avant import
- ✅ Insertion dans PostgreSQL après validation
- ✅ Interface utilisateur conviviale (React + Tailwind)
- ✅ Authentification des utilisateurs (JWT)
- ✅ Dashboard utilisateur et administrateur
- ✅ Etc

## 🧱 Structure du projet (Ceci est un aperçu général)

Connexion/
├── backend/ # API Flask + gestion BDD
│ ├── routes/
│ ├── models/
│ └── ...
├── frontend/
│ └── dashboard/ # Application React
└── .gitignore


## ⚙️ Technologies utilisées

### Backend
- [Python 3](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [PostgreSQL](https://www.postgresql.org/)
- JWT Authentication

### Frontend
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Axios](https://axios-http.com/)

## 🔧 Installation rapide

### 1. Clone du projet

```bash
git clone https://github.com/TON_UTILISATEUR/TON_REPO.git
cd TON_REPO
#En backend
cd backend
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sous Windows
pip install -r requirements.txt
python app.py
#En frontend
cd frontend/dashboard
npm install
npm run dev  # ou npm start

