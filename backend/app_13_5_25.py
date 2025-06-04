# from flask import Flask, request, jsonify
# import pandas as pd
# import psycopg2
# import configparser
# from psycopg2 import sql

# app = Flask(__name__)

# # Lecture du fichier de configuration
# config = configparser.ConfigParser()
# config.read("config.ini")

# DB_CONFIG = config["database"]

# # Fonction de connexion
# def get_connection():
#     return psycopg2.connect(
#         host=DB_CONFIG["host"],
#         port=DB_CONFIG["port"],
#         database=DB_CONFIG["database"],
#         user=DB_CONFIG["user"],
#         password=DB_CONFIG["password"]
#     )

# # Route pour importer un fichier Excel
# @app.route("/import_excel", methods=["POST"])
# def import_excel():
#     if 'file' not in request.files:
#         return jsonify({"error": "Aucun fichier fourni"}), 400

#     file = request.files['file']
#     try:
#         df = pd.read_excel(file)

#         # Vérifier que les colonnes attendues sont présentes
#         required_columns = [
#             "date_comite_validation", "numero", "pda", "psf", "departement",
#             "commune", "intitule_projet", "denomination_entite", "nom_promoteur",
#             "sexe_promoteur", "statut_juridique", "adresse_contact", "filiere",
#             "maillon_type_credit", "cout_total_projet", "credit_solicite",
#             "credit_accorde", "refinancement_accorde", "credit_accorde_statut",
#             "total_financement", "statut_dossier"
#         ]

#         if not all(col in df.columns for col in required_columns):
#             return jsonify({"error": "Colonnes manquantes dans le fichier Excel"}), 400

#         conn = get_connection()
#         cur = conn.cursor()

#         for _, row in df.iterrows():
#             cur.execute(sql.SQL("""
#                 INSERT INTO donnees_importees (
#                     date_comite_validation, numero, pda, psf, departement,
#                     commune, intitule_projet, denomination_entite, nom_promoteur,
#                     sexe_promoteur, statut_juridique, adresse_contact, filiere,
#                     maillon_type_credit, cout_total_projet, credit_solicite,
#                     credit_accorde, refinancement_accorde, credit_accorde_statut,
#                     total_financement, statut_dossier
#                 ) VALUES (
#                     %(date_comite_validation)s, %(numero)s, %(pda)s, %(psf)s, %(departement)s,
#                     %(commune)s, %(intitule_projet)s, %(denomination_entite)s, %(nom_promoteur)s,
#                     %(sexe_promoteur)s, %(statut_juridique)s, %(adresse_contact)s, %(filiere)s,
#                     %(maillon_type_credit)s, %(cout_total_projet)s, %(credit_solicite)s,
#                     %(credit_accorde)s, %(refinancement_accorde)s, %(credit_accorde_statut)s,
#                     %(total_financement)s, %(statut_dossier)s
#                 )
#             """), row.to_dict())

#         conn.commit()
#         cur.close()
#         conn.close()

#         return jsonify({"message": "Fichier importé avec succès dans donnees_importees"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # Route pour récupérer toutes les données
# @app.route("/get_table", methods=["GET"])
# def get_table():
#     try:
#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute("SELECT * FROM donnees_importees ORDER BY id")
#         rows = cur.fetchall()
#         columns = [desc[0] for desc in cur.description]
#         cur.close()
#         conn.close()
#         return jsonify({"columns": columns, "data": rows}), 200
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # Route pour mettre à jour une ligne
# @app.route("/update_row", methods=["POST"])
# def update_row():
#     try:
#         data = request.json
#         row_id = data.get("id")
#         updates = data.get("updates")

#         if not row_id or not updates:
#             return jsonify({"error": "ID ou données à mettre à jour manquantes"}), 400

#         conn = get_connection()
#         cur = conn.cursor()

#         set_clause = ", ".join([f"{col} = %s" for col in updates.keys()])
#         values = list(updates.values()) + [row_id]

#         cur.execute(
#             sql.SQL(f"UPDATE donnees_importees SET {set_clause} WHERE id = %s"),
#             values
#         )

#         conn.commit()
#         cur.close()
#         conn.close()
#         return jsonify({"message": "Ligne mise à jour avec succès"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # Route pour supprimer une ligne
# @app.route("/delete_row", methods=["POST"])
# def delete_row():
#     try:
#         data = request.json
#         row_id = data.get("id")

#         if not row_id:
#             return jsonify({"error": "ID manquant"}), 400

#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute("DELETE FROM donnees_importees WHERE id = %s", (row_id,))
#         conn.commit()
#         cur.close()
#         conn.close()
#         return jsonify({"message": "Ligne supprimée avec succès"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # Lancer l'application Flask
# if __name__ == "__main__":
#     app.run(debug=True)












# from configparser import ConfigParser
# from psycopg2 import sql
# from flask import Flask, request, jsonify
# import pandas as pd
# import psycopg2
# import configparser
# from psycopg2 import sql
# import numpy as np

# app = Flask(__name__)

# # Lecture du fichier config.ini
# config = configparser.ConfigParser()
# config.read("config.ini")
# DB_CONFIG = config["database"]

# def get_connection():
#     return psycopg2.connect(
#         host=DB_CONFIG["host"],
#         port=DB_CONFIG["port"],
#         database=DB_CONFIG["database"],
#         user=DB_CONFIG["user"],
#         password=DB_CONFIG["password"]
#     )


# @app.route("/import_excel", methods=["POST"])
# def import_excel():
#     if 'file' not in request.files:
#         return jsonify({"error": "Aucun fichier fourni"}), 400

#     file = request.files['file']
#     try:
#         df = pd.read_excel(file)
#         df = df.replace({np.nan: None})  # Remplacer les NaN par None

#         required_columns = [
#             "date_comite_validation", "numero", "pda", "psf", "departement",
#             "commune", "intitule_projet", "denomination_entite", "nom_promoteur",
#             "sexe_promoteur", "statut_juridique", "adresse_contact", "filiere",
#             "maillon_type_credit", "cout_total_projet", "credit_solicite",
#             "credit_accorde", "refinancement_accorde", "credit_accorde_statut",
#             "total_financement", "statut_dossier"
#         ]

#         if not all(col in df.columns for col in required_columns):
#             return jsonify({"error": "Colonnes manquantes dans le fichier Excel"}), 400

#         conn = get_connection()
#         cur = conn.cursor()

#         for _, row in df.iterrows():
#             # Insertion dans donnees_importees
#             cur.execute(sql.SQL("""
#                 INSERT INTO donnees_importees (
#                     date_comite_validation, numero, pda, psf, departement,
#                     commune, intitule_projet, denomination_entite, nom_promoteur,
#                     sexe_promoteur, statut_juridique, adresse_contact, filiere,
#                     maillon_type_credit, cout_total_projet, credit_solicite,
#                     credit_accorde, refinancement_accorde, credit_accorde_statut,
#                     total_financement, statut_dossier
#                 ) VALUES (
#                     %(date_comite_validation)s, %(numero)s, %(pda)s, %(psf)s, %(departement)s,
#                     %(commune)s, %(intitule_projet)s, %(denomination_entite)s, %(nom_promoteur)s,
#                     %(sexe_promoteur)s, %(statut_juridique)s, %(adresse_contact)s, %(filiere)s,
#                     %(maillon_type_credit)s, %(cout_total_projet)s, %(credit_solicite)s,
#                     %(credit_accorde)s, %(refinancement_accorde)s, %(credit_accorde_statut)s,
#                     %(total_financement)s, %(statut_dossier)s
#                 )
#             """), row.to_dict())

#             # Insertion dans promoteur
#             cur.execute(sql.SQL("""
#                 INSERT INTO promoteur (nom_promoteur, nom_entite, sexe_promoteur, statut_juridique)
#                 VALUES (%s, %s, %s, %s)
#             """), (
#                 row["nom_promoteur"],
#                 row["denomination_entite"],
#                 row["sexe_promoteur"],
#                 row["statut_juridique"]
#             ))

#         conn.commit()
#         return jsonify({"message": "Fichier importé avec succès"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()



# @app.route("/get_table", methods=["GET"])
# def get_table():
#     try:
#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute("SELECT * FROM donnees_importees ORDER BY id")
#         rows = cur.fetchall()
#         columns = [desc[0] for desc in cur.description]
#         return jsonify({"columns": columns, "data": rows}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()


# @app.route("/update_row", methods=["POST"])
# def update_row():
#     try:
#         data = request.json
#         row_id = data.get("id")
#         updates = data.get("updates")

#         if not row_id or not updates:
#             return jsonify({"error": "Données manquantes"}), 400

#         updates = {k: (None if pd.isna(v) else v) for k, v in updates.items()}

#         set_clause = ", ".join([f'"{key}" = %s' for key in updates.keys()])
#         values = list(updates.values()) + [row_id]

#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute(f'UPDATE donnees_importees SET {set_clause} WHERE id = %s', values)
#         conn.commit()
#         return jsonify({"message": "Mise à jour réussie"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()


# @app.route("/insert_row", methods=["POST"])
# def insert_row():
#     try:
#         data = request.json
#         if not data:
#             return jsonify({"error": "Données manquantes"}), 400

#         data = {k: (None if pd.isna(v) else v) for k, v in data.items()}

#         conn = get_connection()
#         cur = conn.cursor()

#         columns = ', '.join([f'"{col}"' for col in data.keys()])
#         placeholders = ', '.join(['%s'] * len(data))
#         values = list(data.values())

#         query = f'INSERT INTO donnees_importees ({columns}) VALUES ({placeholders})'
#         cur.execute(query, values)
#         conn.commit()
#         return jsonify({"message": "Ligne insérée"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()


# @app.route("/delete_row", methods=["POST"])
# def delete_row():
#     try:
#         data = request.get_json()
#         row_id = data.get("id")
#         if not row_id:
#             return jsonify({"error": "ID manquant"}), 400

#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute("DELETE FROM donnees_importees WHERE id = %s", (row_id,))
#         conn.commit()
#         return jsonify({"message": "Ligne supprimée avec succès"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()
    
# if __name__ == "__main__":
#     app.run(debug=True)
































# from configparser import ConfigParser
# from psycopg2 import sql
# from flask import Flask, request, jsonify
# import pandas as pd
# import psycopg2
# import configparser
# from psycopg2 import sql
# import numpy as np
# from uuid import uuid4

# app = Flask(__name__)

# # Lecture du fichier config.ini
# config = configparser.ConfigParser()
# config.read("config.ini")
# DB_CONFIG = config["database"]

# def get_connection():
#     return psycopg2.connect(
#         host=DB_CONFIG["host"],
#         port=DB_CONFIG["port"],
#         database=DB_CONFIG["database"],
#         user=DB_CONFIG["user"],
#         password=DB_CONFIG["password"]
#     )

# @app.route("/import_excel", methods=["POST"])
# def import_excel():
#     if 'file' not in request.files:
#         return jsonify({"error": "Aucun fichier fourni"}), 400

#     file = request.files['file']
#     try:
#         df = pd.read_excel(file)
#         df = df.replace({np.nan: None})  # Remplacer les NaN par None

#         required_columns = [
#             "date_comite_validation", "numero", "pda", "psf", "departement",
#             "commune", "intitule_projet", "denomination_entite", "nom_promoteur",
#             "sexe_promoteur", "statut_juridique", "adresse_contact", "filiere",
#             "maillon_type_credit", "cout_total_projet", "credit_solicite",
#             "credit_accorde", "refinancement_accorde", "credit_accorde_statut",
#             "total_financement", "statut_dossier"
#         ]

#         if not all(col in df.columns for col in required_columns):
#             return jsonify({"error": "Colonnes manquantes dans le fichier Excel"}), 400

#         import_batch_id = str(uuid4())
#         df["import_batch_id"] = import_batch_id

#         conn = get_connection()
#         cur = conn.cursor()

#         for _, row in df.iterrows():
#             cur.execute(sql.SQL("""
#                 INSERT INTO donnees_importees (
#                     date_comite_validation, numero, pda, psf, departement,
#                     commune, intitule_projet, denomination_entite, nom_promoteur,
#                     sexe_promoteur, statut_juridique, adresse_contact, filiere,
#                     maillon_type_credit, cout_total_projet, credit_solicite,
#                     credit_accorde, refinancement_accorde, credit_accorde_statut,
#                     total_financement, statut_dossier, import_batch_id
#                 ) VALUES (
#                     %(date_comite_validation)s, %(numero)s, %(pda)s, %(psf)s, %(departement)s,
#                     %(commune)s, %(intitule_projet)s, %(denomination_entite)s, %(nom_promoteur)s,
#                     %(sexe_promoteur)s, %(statut_juridique)s, %(adresse_contact)s, %(filiere)s,
#                     %(maillon_type_credit)s, %(cout_total_projet)s, %(credit_solicite)s,
#                     %(credit_accorde)s, %(refinancement_accorde)s, %(credit_accorde_statut)s,
#                     %(total_financement)s, %(statut_dossier)s, %(import_batch_id)s
#                 )
#             """), row.to_dict())

#             cur.execute(sql.SQL("""
#                 INSERT INTO promoteur (nom_promoteur, nom_entite, sexe_promoteur, statut_juridique)
#                 VALUES (%s, %s, %s, %s)
#             """), (
#                 row["nom_promoteur"],
#                 row["denomination_entite"],
#                 row["sexe_promoteur"],
#                 row["statut_juridique"]
#             ))

#         conn.commit()
#         return jsonify({"message": "Fichier importé avec succès", "import_batch_id": import_batch_id}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()



# @app.route("/cancel_import", methods=["POST"])
# def cancel_import():
#     try:
#         data = request.get_json()
#         import_batch_id = data.get("import_batch_id")
#         if not import_batch_id:
#             return jsonify({"error": "ID d'importation manquant"}), 400

#         conn = get_connection()
#         cur = conn.cursor()

#         cur.execute("DELETE FROM donnees_importees WHERE import_batch_id = %s", (import_batch_id,))

#         conn.commit()
#         return jsonify({"message": "Importation annulée avec succès"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()

# @app.route("/get_table", methods=["GET"])
# def get_table():
#     try:
#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute("SELECT * FROM donnees_importees ORDER BY id")
#         rows = cur.fetchall()
#         columns = [desc[0] for desc in cur.description]
#         return jsonify({"columns": columns, "data": rows}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()

# @app.route("/update_row", methods=["POST"])
# def update_row():
#     try:
#         data = request.json
#         row_id = data.get("id")
#         updates = data.get("updates")

#         if not row_id or not updates:
#             return jsonify({"error": "Données manquantes"}), 400

#         updates = {k: (None if pd.isna(v) else v) for k, v in updates.items()}

#         set_clause = ", ".join([f'"{key}" = %s' for key in updates.keys()])
#         values = list(updates.values()) + [row_id]

#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute(f'UPDATE donnees_importees SET {set_clause} WHERE id = %s', values)
#         conn.commit()
#         return jsonify({"message": "Mise à jour réussie"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()

# @app.route("/insert_row", methods=["POST"])
# def insert_row():
#     try:
#         data = request.json
#         if not data:
#             return jsonify({"error": "Données manquantes"}), 400

#         data = {k: (None if pd.isna(v) else v) for k, v in data.items()}

#         conn = get_connection()
#         cur = conn.cursor()

#         columns = ', '.join([f'"{col}"' for col in data.keys()])
#         placeholders = ', '.join(['%s'] * len(data))
#         values = list(data.values())

#         query = f'INSERT INTO donnees_importees ({columns}) VALUES ({placeholders})'
#         cur.execute(query, values)
#         conn.commit()
#         return jsonify({"message": "Ligne insérée"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()

# @app.route("/delete_row", methods=["POST"])
# def delete_row():
#     try:
#         data = request.get_json()
#         row_id = data.get("id")
#         if not row_id:
#             return jsonify({"error": "ID manquant"}), 400

#         conn = get_connection()
#         cur = conn.cursor()
#         cur.execute("DELETE FROM donnees_importees WHERE id = %s", (row_id,))
#         conn.commit()
#         return jsonify({"message": "Ligne supprimée avec succès"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

#     finally:
#         if 'cur' in locals(): cur.close()
#         if 'conn' in locals(): conn.close()

# if __name__ == "__main__":
#     app.run(debug=True)
































#Nouveau code flask, le 14 mai 2025 à 17h13





from configparser import ConfigParser
from psycopg2 import sql
from flask import Flask, request, jsonify
import pandas as pd
import psycopg2
import configparser
import numpy as np

app = Flask(__name__)

# Lecture du fichier config.ini
config = configparser.ConfigParser()
config.read("config.ini")
DB_CONFIG = config["database"]

def get_connection():
    return psycopg2.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        database=DB_CONFIG["database"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"]
    )

# Import des données dans la table tampon et dans la table promoteur



@app.route("/import_excel", methods=["POST"])
def import_excel():
    print("Contenu de request.files :", request.files)
    if 'file' not in request.files:
        return jsonify({"error": "Aucun fichier fourni"}), 400

    file = request.files['file']
    try:
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

        if not all(col in df.columns for col in required_columns):
            return jsonify({"error": "Colonnes manquantes dans le fichier Excel"}), 400

        conn = get_connection()
        cur = conn.cursor()

        for _, row in df.iterrows():
            row_dict = row.to_dict()

            # Insertion dans donnees_importees
            cur.execute(sql.SQL("""
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
            """), row_dict)

            # Vérifier ou insérer promoteur
            cur.execute("""
                INSERT INTO promoteur (nom_promoteur, nom_entite, sexe_promoteur, statut_juridique)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, (
                row_dict["nom_promoteur"],
                row_dict["denomination_entite"],
                row_dict["sexe_promoteur"],
                row_dict["statut_juridique"]
            ))

        conn.commit()
        return jsonify({"message": "Fichier importé dans donnees_importees."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()






# iMPORT DANS LA TABLE projet_financement


@app.route("/inserer_donnees_projet_financement", methods=["POST"])
def inserer_donnees_projet_financement():
    try:
        conn = get_connection()
        cur = conn.cursor()

        insert_query = """
            INSERT INTO projet_financement (
                date_comite_validation,
                intitule_projet,
                cout_total_projet,
                credit_sollicite,
                credit_accorde,
                refinancement_accorde,
                total_financement,
                id_commune,
                id_filiere,
                id_psf,
                id_promoteur,
                statut_dossier
            )
            SELECT
                d.date_comite_validation,
                d.intitule_projet,
                d.cout_total_projet,
                d.credit_solicite,
                d.credit_accorde,
                d.refinancement_accorde,
                d.total_financement,
                c.id_commune,
                f.id_filiere,
                p.id_psf,
                pr.id_promoteur,
                d.statut_dossier
            FROM donnees_importees d
            JOIN commune c ON TRIM(LOWER(c.nom_commune)) = TRIM(LOWER(d.commune))
            JOIN filiere f ON LOWER(f.nom_filiere) = LOWER(d.filiere)
            JOIN psf p ON LOWER(p.nom_psf) = LOWER(d.psf)
            JOIN promoteur pr ON LOWER(pr.nom_promoteur) = LOWER(d.nom_promoteur)
                               AND LOWER(pr.nom_entite) = LOWER(d.denomination_entite)
        """

        cur.execute(insert_query)
        conn.commit()
        return jsonify({"message": "Insertion dans projet_financement réussie"}), 200

    except Exception as e:
        print("Erreur :", e)
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()




















# Route pour afficher et gérer les modifications sur la table



@app.route("/get_table", methods=["GET"])
def get_table():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM donnees_importees ORDER BY id")
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        return jsonify({"columns": columns, "data": rows}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()


@app.route("/update_row", methods=["POST"])
def update_row():
    try:
        data = request.json
        row_id = data.get("id")
        updates = data.get("updates")

        if not row_id or not updates:
            return jsonify({"error": "Données manquantes"}), 400

        updates = {k: (None if pd.isna(v) else v) for k, v in updates.items()}

        set_clause = ", ".join([f'"{key}" = %s' for key in updates.keys()])
        values = list(updates.values()) + [row_id]

        conn = get_connection()
        cur = conn.cursor()
        cur.execute(f'UPDATE donnees_importees SET {set_clause} WHERE id = %s', values)
        conn.commit()
        return jsonify({"message": "Mise à jour réussie"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()


@app.route("/insert_row", methods=["POST"])
def insert_row():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Données manquantes"}), 400

        data = {k: (None if pd.isna(v) else v) for k, v in data.items()}

        conn = get_connection()
        cur = conn.cursor()

        columns = ', '.join([f'"{col}"' for col in data.keys()])
        placeholders = ', '.join(['%s'] * len(data))
        values = list(data.values())

        query = f'INSERT INTO donnees_importees ({columns}) VALUES ({placeholders})'
        cur.execute(query, values)
        conn.commit()
        return jsonify({"message": "Ligne insérée"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()


@app.route("/delete_row", methods=["POST"])
def delete_row():
    try:
        data = request.get_json()
        row_id = data.get("id")
        if not row_id:
            return jsonify({"error": "ID manquant"}), 400

        conn = get_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM donnees_importees WHERE id = %s", (row_id,))
        conn.commit()
        return jsonify({"message": "Ligne supprimée avec succès"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()
    
if __name__ == "__main__":
    app.run(debug=True)
