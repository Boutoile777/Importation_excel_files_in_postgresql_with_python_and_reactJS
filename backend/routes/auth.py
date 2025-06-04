from flask import Blueprint, request, jsonify, session
from db import get_connection
from utils.password import hash_password, check_password

# Autres imports éventuels
import pandas as pd
import numpy as np
from config import get_db_config  # ✅ conserve si tu l'utilises pour la DB
import jwt
from functools import wraps

auth_bp = Blueprint('auth', __name__)


auth_bp = Blueprint('auth', __name__)

# -----------------------------
# Route pour enregistrement
# -----------------------------
@auth_bp.route('/signup', methods =['POST'])
def signup():
    try:
        data = request.json
        nom = data.get('nom')
        prenom = data.get('prenom')
        email = data.get('email')
        mot_de_passe = data.get('mot_de_passe')

        if not all([nom, prenom, email, mot_de_passe]):
            return jsonify({'error': 'Tous les champs sont requis.'}), 400

        # Ici tu peux ajouter une validation email + force mot de passe si besoin

        hashed = hash_password(mot_de_passe)

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute("SELECT id FROM utilisateur WHERE email = %s", (email,))
            if cur.fetchone():
                return jsonify({'error': 'Utilisateur déjà inscrit.'}), 400

            cur.execute(
                "INSERT INTO utilisateur (nom, prenom, email, mot_de_passe) VALUES (%s, %s, %s, %s)",
                (nom, prenom, email, hashed)
            )
            conn.commit()

        return jsonify({'message': 'Inscription réussie.'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()



# -----------------------------
# Route de connexion signin
# -----------------------------

@auth_bp.route('/signin', methods=['POST'])
def signin():
    try:
        data = request.json
        email = data.get('email')
        mot_de_passe = data.get('mot_de_passe')

        if not all([email, mot_de_passe]):
            return jsonify({'error': 'Email et mot de passe requis.'}), 400

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, mot_de_passe, nom, prenom, admin FROM utilisateur WHERE email = %s",
                (email,)
            )
            user = cur.fetchone()

        if not user:
            return jsonify({'error': 'Utilisateur non trouvé.'}), 404

        user_id, hashed_password, nom, prenom, admin = user
        if not check_password(mot_de_passe, hashed_password):
            return jsonify({'error': 'Mot de passe incorrect.'}), 401

        # ✅ Stockage de l'identifiant utilisateur dans la session
        session['user_id'] = user_id

        return jsonify({
            'message': 'Connexion réussie.',
            'user': {
                'id': user_id,
                'nom': nom,
                'prenom': prenom,
                'email': email,
                'admin': admin
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()


# -----------------------------
# Route pour récupérer les infos utilisateur connecté puis modifier les informations de l'user connecté
# -----------------------------


@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté.'}), 401

    conn = get_connection()
    if conn is None:
        return jsonify({'error': 'Connexion à la base impossible.'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, nom, prenom, email, admin FROM utilisateur WHERE id = %s", (user_id,))
            user = cur.fetchone()

        if not user:
            return jsonify({'error': 'Utilisateur non trouvé.'}), 404

        id, nom, prenom, email, admin = user
        return jsonify({
            'id': id,
            'nom': nom,
            'prenom': prenom,
            'email': email,
            'admin': admin
        }), 200
    finally:
        conn.close()


# Modifier les infos de l'user connecté 

@auth_bp.route('/me', methods=['PATCH'])
def update_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Utilisateur non connecté.'}), 401

    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    email = data.get('email')

    if not any([nom, prenom, email]):
        return jsonify({'error': 'Aucune donnée à mettre à jour.'}), 400

    conn = get_connection()
    if conn is None:
        return jsonify({'error': 'Connexion à la base impossible.'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE utilisateur
                SET nom = COALESCE(%s, nom),
                    prenom = COALESCE(%s, prenom),
                    email = COALESCE(%s, email)
                WHERE id = %s
            """, (nom, prenom, email, user_id))
            conn.commit()
        return jsonify({'message': 'Profil mis à jour avec succès.'}), 200
    finally:
        conn.close()










#Routes de sélection du type de projet avant importation des données

@auth_bp.route('/type_projets', methods=['GET'])
def get_type_projets():
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute("SELECT id_type_projet, nom_facilite FROM type_projet")
            rows = cur.fetchall()

            type_projets = [
                {'id_type_projet': row[0], 'nom_facilite': row[1]} for row in rows
            ]

        return jsonify(type_projets), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()

@auth_bp.route('/selection_type_projet', methods=['POST'])
def selection_type_projet():
    try:
        data = request.get_json()
        id_type_projet = data.get('id_type_projet')

        if not id_type_projet:
            return jsonify({'error': 'id_type_projet manquant.'}), 400

        # Enregistrement dans la session utilisateur
        session['id_type_projet'] = id_type_projet

        return jsonify({'message': f'Type de projet sélectionné : {id_type_projet}'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



# Ajout et récupération de la liste des facilités 

from flask import request, jsonify
from psycopg2.errors import UniqueViolation

@auth_bp.route('/types_projets', methods=['GET', 'POST'])
def handle_type_projets():
    if request.method == 'GET':
        try:
            conn = get_connection()
            if conn is None:
                return jsonify({'error': 'Connexion à la base impossible.'}), 500

            with conn.cursor() as cur:
                cur.execute("SELECT id_type_projet, nom_facilite, date_creation, auteur FROM type_projet")
                rows = cur.fetchall()

                type_projets = [
                    {
                        'id_type_projet': row[0],
                        'nom_facilite': row[1],
                        'date_creation': row[2].strftime('%Y-%m-%d') if row[2] else None,
                        'auteur': row[3] if row[3] else 'N/A'
                    } for row in rows
                ]

            return jsonify(type_projets), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

        finally:
            if 'conn' in locals() and conn:
                conn.close()

    elif request.method == 'POST':
        data = request.get_json()
        nom_facilite = data.get('nom_facilite')
        auteur = data.get('auteur')

        if not nom_facilite or not auteur:
            return jsonify({'error': 'Les champs nom facilite et auteur sont obligatoires.'}), 400

        try:
            conn = get_connection()
            if conn is None:
                return jsonify({'error': 'Connexion à la base impossible.'}), 500

            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO type_projet (nom_facilite, auteur) VALUES (%s, %s)",
                    (nom_facilite, auteur)
                )
                conn.commit()

            return jsonify({'message': 'Facilité ajoutée avec succès.'}), 201

        except UniqueViolation:
            return jsonify({'error': 'Facilité déjà existante.'}), 409

        except Exception as e:
            return jsonify({'error': str(e)}), 500

        finally:
            if 'conn' in locals() and conn:
                conn.close()
















# -----------------------------------------
# Route pour import Excel dans plusieurs tables
# -----------------------------------------

@auth_bp.route("/import_excel", methods=["POST"])
def import_excel():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Aucun fichier fourni"}), 400

        file = request.files['file']
        df = pd.read_excel(file)
        df = df.replace({np.nan: None})

        required_columns = [
            "date_comite_validation", "numero", "pda", "psf", "departement",
            "commune", "intitule_projet", "denomination_entite", "nom_promoteur",
            "sexe_promoteur", "statut_juridique", "adresse_contact", "filiere",
            "maillon_type_credit", "cout_total_projet", "credit_solicite",
            "credit_accorde", "refinancement_accorde", "credit_accorde_statut",
            "total_financement", "statut_dossier"
        ]

        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Colonnes manquantes dans le fichier Excel: {', '.join(missing_cols)}"}), 400

        if df["date_comite_validation"].dtype in ["float64", "int64"]:
            df["date_comite_validation"] = pd.to_datetime(df["date_comite_validation"], unit='d', origin='1899-12-30')

        id_type_projet = session.get('id_type_projet')
        if not id_type_projet:
            return jsonify({"error": "Type de projet non sélectionné dans la session."}), 400
        

        
        
        # Récupérer les informations de l'user connecter et l'afficher directement dans la table

        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'Utilisateur non connecté'}), 401

        conn = get_connection()
        if conn is None:
            return jsonify({"error": "Connexion à la base impossible."}), 500

        with conn.cursor() as cur:
            cur.execute("SELECT nom, prenom FROM utilisateur WHERE id = %s", (user_id,))
            result = cur.fetchone()
            if not result:
                return jsonify({'error': 'Utilisateur introuvable'}), 404

            created_by = f"{result[1]} {result[0]}"




            cur.execute("TRUNCATE TABLE donnees_importees RESTART IDENTITY CASCADE")

            for _, row in df.iterrows():
                row_dict = row.to_dict()

                cur.execute("""
                    INSERT INTO donnees_importees (
                        date_comite_validation, numero, pda, psf, departement,
                        commune, intitule_projet, denomination_entite, nom_promoteur,
                        sexe_promoteur, statut_juridique, adresse_contact, filiere,
                        maillon_type_credit, cout_total_projet, credit_solicite,
                        credit_accorde, refinancement_accorde, credit_accorde_statut,
                        total_financement, statut_dossier
                    ) VALUES (
                        %(date_comite_validation)s, %(numero)s, %(pda)s, %(psf)s, %(departement)s,
                        %(commune)s, %(intitule_projet)s, %(denomination_entite)s, %(nom_promoteur)s,
                        %(sexe_promoteur)s, %(statut_juridique)s, %(adresse_contact)s, %(filiere)s,
                        %(maillon_type_credit)s, %(cout_total_projet)s, %(credit_solicite)s,
                        %(credit_accorde)s, %(refinancement_accorde)s, %(credit_accorde_statut)s,
                        %(total_financement)s, %(statut_dossier)s
                    )
                """, row_dict)

                cur.execute("""
                    INSERT INTO promoteur (nom_promoteur, nom_entite, sexe_promoteur, statut_juridique)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (nom_promoteur, nom_entite) DO NOTHING
                """, (
                    row_dict["nom_promoteur"], row_dict["denomination_entite"],
                    row_dict["sexe_promoteur"], row_dict["statut_juridique"]
                ))

                cur.execute("""
                    INSERT INTO psf (nom_psf)
                    VALUES (%s)
                    ON CONFLICT (nom_psf) DO NOTHING
                """, (row_dict["psf"],))

                cur.execute("""
                    INSERT INTO filiere (nom_filiere, maillon)
                    VALUES (%s, %s)
                    ON CONFLICT (nom_filiere) DO NOTHING
                """, (row_dict["filiere"], row_dict["maillon_type_credit"]))

                cur.execute("SELECT id_promoteur FROM promoteur WHERE nom_promoteur = %s AND nom_entite = %s",
                            (row_dict["nom_promoteur"], row_dict["denomination_entite"]))
                id_promoteur = cur.fetchone()
                id_promoteur = id_promoteur[0] if id_promoteur else None

                cur.execute("SELECT id_psf FROM psf WHERE nom_psf = %s", (row_dict["psf"],))
                id_psf = cur.fetchone()
                id_psf = id_psf[0] if id_psf else None

                cur.execute("SELECT id_filiere FROM filiere WHERE nom_filiere = %s", (row_dict["filiere"],))
                id_filiere = cur.fetchone()
                id_filiere = id_filiere[0] if id_filiere else None

                nom_commune = row_dict["commune"].strip().lower()

                cur.execute("""
                        SELECT id_commune FROM commune
                        WHERE TRIM(LOWER(nom_commune)) = %s
                    """, (nom_commune,))
                result_commune = cur.fetchone()
                id_commune = result_commune[0] if result_commune else None

                if not id_commune:
                    raise ValueError(f"Commune non trouvée pour : '{row_dict['commune']}'")

                cur.execute("""
                        INSERT INTO projet_financement (
                            date_comite_validation, id_psf, id_commune,
                            intitule_projet, id_promoteur, id_filiere,
                            cout_total_projet, credit_solicite, credit_accorde,
                            refinancement_accorde, credit_accorde_statut, total_financement,
                            statut_dossier, id_type_projet, created_by
                        ) VALUES (
                            %(date_comite_validation)s, %(id_psf)s, %(id_commune)s,
                            %(intitule_projet)s, %(id_promoteur)s, %(id_filiere)s,
                            %(cout_total_projet)s, %(credit_solicite)s, %(credit_accorde)s,
                            %(refinancement_accorde)s, %(credit_accorde_statut)s, %(total_financement)s,
                            %(statut_dossier)s, %(id_type_projet)s, %(created_by)s
                        )
                        """, {
                            "date_comite_validation": row_dict["date_comite_validation"],
                            "id_psf": id_psf,
                            "id_commune": id_commune,
                            "intitule_projet": row_dict["intitule_projet"],
                            "id_promoteur": id_promoteur,
                            "id_filiere": id_filiere,
                            "cout_total_projet": row_dict["cout_total_projet"],
                            "credit_solicite": row_dict["credit_solicite"],
                            "credit_accorde": row_dict["credit_accorde"],
                            "refinancement_accorde": row_dict["refinancement_accorde"],
                            "credit_accorde_statut": row_dict["credit_accorde_statut"],
                            "total_financement": row_dict["total_financement"],
                            "statut_dossier": row_dict["statut_dossier"],
                            "id_type_projet": id_type_projet,
                            "created_by": created_by
                        })

            conn.commit()
        session.pop('id_type_projet', None)
        return jsonify({"message": "Fichier importé et données insérées avec succès."}), 200

    except Exception as e:
        if 'conn' in locals() and conn:
            conn.rollback()
        return jsonify({"error": str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()
