from flask import Blueprint, request, jsonify, session, current_app, send_from_directory
from flask_login import LoginManager, login_user, logout_user, login_required, current_user, UserMixin
from db import get_connection
from utils.password import hash_password, check_password, verify_password
import pandas as pd
import numpy as np
from config import get_db_config
import jwt
from psycopg2.errors import UniqueViolation
from functools import wraps
import jwt
import datetime
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature

from flask_mail import Message
from extensions import mail  


import os
from werkzeug.utils import secure_filename








# --- Initialisation Flask-Login ---
login_manager = LoginManager()
login_manager.login_view = 'auth.signin'  # redirection par défaut si non connecté

auth_bp = Blueprint('auth', __name__)

# -----------------------------
# Classe utilisateur compatible Flask-Login
# -----------------------------

class Utilisateur(UserMixin):
    def __init__(self, id, nom, prenom, email, admin, photo_profil=None):
        self.id = id
        self.nom = nom
        self.prenom = prenom
        self.email = email
        self.admin = admin
        self.photo_profil = photo_profil

    @staticmethod
    def get(user_id):
        conn = get_connection()
        if conn is None:
            return None
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT id, nom, prenom, email, admin, photo_profil FROM utilisateur WHERE id = %s", (user_id,))
                user = cur.fetchone()
                if user:
                    return Utilisateur(*user)
        finally:
            conn.close()
        return None

# -----------------------------
# Fonction de chargement de l'utilisateur pour Flask-Login
# -----------------------------

@login_manager.user_loader
def load_user(user_id):
    return Utilisateur.get(user_id)

 
# -----------------------------
# Route d'enregistrement d'un nouvel user
# -----------------------------

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        nom = data.get('nom')
        prenom = data.get('prenom')
        email = data.get('email')
        mot_de_passe = data.get('mot_de_passe')

        if not all([nom, prenom, email, mot_de_passe]):
            return jsonify({'error': 'Tous les champs sont requis.'}), 400

        hashed = hash_password(mot_de_passe)

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            # Vérifie que l'email n'est pas déjà pris
            cur.execute("SELECT id FROM utilisateur WHERE email = %s", (email,))
            if cur.fetchone():
                return jsonify({'error': 'Utilisateur déjà inscrit.'}), 400

            # Insère le nouvel utilisateur avec mot_de_passe_temporaire = TRUE
            cur.execute(
                "INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, mot_de_passe_temporaire) VALUES (%s, %s, %s, %s, TRUE) RETURNING id",
                (nom, prenom, email, hashed)
            )
            user_id = cur.fetchone()[0]
            conn.commit()

        return jsonify({'message': 'Inscription réussie.', 'user_id': user_id}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()



#Décorateur pour la gestion des rôles


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'Authentification requise'}), 401
        if not getattr(current_user, 'admin', False):
            return jsonify({'error': 'Accès refusé: privilèges administrateur requis'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Route de test de la gestion des rôles 

@auth_bp.route('/test-admin', methods=['GET'])
@login_required
@admin_required
def test_admin_route():
    return jsonify({'message': 'Accès admin réussi'}), 200




# Route pour lister les utilisateurs standards (admin only)
@auth_bp.route('/utilisateurs-standard', methods=['GET'])
@login_required
@admin_required
def get_utilisateurs_standard():
    # Vérifier que l'utilisateur connecté est admin
    if not getattr(current_user, 'admin', False):
        return jsonify({'error': 'Accès non autorisé'}), 403

    conn = get_connection()
    if conn is None:
        return jsonify({'error': 'Connexion à la base impossible.'}), 500

    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT nom, prenom, date_creation
                FROM utilisateur
                WHERE admin = FALSE
                ORDER BY date_creation DESC
            """)
            rows = cur.fetchall()

            resultat = []
            for nom, prenom, date_creation in rows:
                resultat.append({
                    'nom': nom,
                    'prenom': prenom,
                    'date_creation': date_creation.strftime('%d-%m-%Y ') if date_creation else None
                })

        return jsonify(resultat), 200

    except Exception as e:
        # log l'erreur côté serveur si tu veux (print ou logger)
        return jsonify({'error': str(e)}), 500

    finally:
        conn.close()



# -----------------------------
# Route de connexion avec vérification des permissions
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
            cur.execute("""
                SELECT id, mot_de_passe, nom, prenom, admin, mot_de_passe_temporaire, permission
                FROM utilisateur 
                WHERE email = %s
            """, (email,))
            user = cur.fetchone()

        if not user:
            return jsonify({'error': 'Utilisateur non trouvé.'}), 404

        user_id, hashed_password, nom, prenom, admin, mot_temp, permission = user

        # 🔒 Vérifier si l'utilisateur est bloqué
        if permission and permission.lower() == 'bloqué':
            return jsonify({'error': 'Votre compte a été bloqué. Contactez un administrateur.'}), 403

        if not check_password(mot_de_passe, hashed_password):
            return jsonify({'error': 'Mot de passe incorrect.'}), 401

        user_obj = Utilisateur(user_id, nom, prenom, email, admin)
        login_user(user_obj)

        return jsonify({
            'message': 'Connexion réussie.',
            'user': {
                'id': user_id,
                'nom': nom,
                'prenom': prenom,
                'email': email,
                'admin': admin,
                'mot_de_passe_temporaire': mot_temp,
                'permission': permission
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()



# -----------------------------
# Route pour se déconnecter
# -----------------------------
@auth_bp.route('/signout', methods=['POST'])
@login_required
def signout():
    logout_user()  # ✅ Déconnecte l'utilisateur
    return jsonify({'message': 'Déconnexion réussie.'}), 200


# -----------------------------
# Route d'informations utilisateur
# -----------------------------
@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'nom': current_user.nom,
        'prenom': current_user.prenom,
        'email': current_user.email,
        'admin': current_user.admin,
        'photo_profil': current_user.photo_profil
    }), 200


# -----------------------------
# Mise à jour du profil utilisateur connecté
# -----------------------------

@auth_bp.route('/me', methods=['PATCH'])
@login_required
def update_current_user():
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
            """, (nom, prenom, email, current_user.id))  # 👈 utilisation de current_user.id
            conn.commit()
        return jsonify({'message': 'Profil mis à jour avec succès.'}), 200
    finally:
        conn.close()


#Route de gestion de la photo de profil 


UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
PROFILS_FOLDER = os.path.join(UPLOAD_FOLDER, 'profils')
os.makedirs(PROFILS_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route pour servir les photos de profil (optionnel ici, tu peux la mettre dans app.py)
@auth_bp.route('/uploads/profils/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(PROFILS_FOLDER, filename)

@auth_bp.route('/me/avatar', methods=['PATCH'])
@login_required
def update_photo():
    if 'photo' not in request.files:
        return jsonify({'error': 'Aucun fichier reçu.'}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'Nom de fichier vide.'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(PROFILS_FOLDER, filename)
        file.save(filepath)

        # Mise à jour base de données avec le nom du fichier
        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE utilisateur SET photo_profil = %s WHERE id = %s",
                    (filename, current_user.id)
                )
                conn.commit()
            return jsonify({'message': 'Photo mise à jour avec succès.', 'photo_profil': filename}), 200
        finally:
            conn.close()

    return jsonify({'error': 'Format de fichier non autorisé.'}), 400









# Mofification du mot de passe à la première connexion


@auth_bp.route('/change-password-first-login', methods=['POST'])
@login_required
def change_password_first_login():
    try:
        data = request.json
        new_password = data.get('new_password')

        if not new_password:
            return jsonify({'error': 'Nouveau mot de passe requis.'}), 400

        # Hash du nouveau mot de passe
        hashed = hash_password(new_password)

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            # Mise à jour mot de passe + reset flag
            cur.execute(
                """
                UPDATE utilisateur
                SET mot_de_passe = %s,
                mot_de_passe_temporaire = false
                WHERE id = %s
                """,
                (hashed, current_user.id)
            )
            conn.commit()

        return jsonify({'message': 'Mot de passe changé avec succès.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()


# -----------------------------
# Route de gestion de mot de passe oublié
# -----------------------------

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email requis.'}), 400

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute("SELECT id FROM utilisateur WHERE email = %s", (email,))
            user = cur.fetchone()

        if not user:
            return jsonify({'error': 'Aucun utilisateur trouvé avec cet email.'}), 404

        serializer = URLSafeTimedSerializer(current_app.secret_key)
        token = serializer.dumps(email, salt='reset-password')
        reset_url = f"http://localhost:3000/reset-password/{token}"

        # Construire le mail
        subject = "Réinitialisation de votre mot de passe"
        body = f"""
Bonjour,

Vous avez demandé à réinitialiser votre mot de passe.
Cliquez sur ce lien pour le faire : {reset_url}

Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.

Cordialement,
L'équipe
        """

        msg = Message(subject=subject, recipients=[email], body=body)

        # Envoi du mail
        mail.send(msg)

        return jsonify({'message': 'Email de réinitialisation envoyé.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()

#Route pour Mettre à jour les informations de l'user concernant les mots de passe 


@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    try:
        data = request.json
        new_password = data.get('new_password')

        if not new_password:
            return jsonify({'error': 'Nouveau mot de passe requis.'}), 400

        serializer = URLSafeTimedSerializer(current_app.secret_key)

        try:
            email = serializer.loads(token, salt='reset-password', max_age=400)
        except SignatureExpired:
            return jsonify({'error': 'Le lien a expiré.'}), 400
        except BadSignature:
            return jsonify({'error': 'Lien invalide.'}), 400

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            hashed = hash_password(new_password)  # ✅ hash via password.py

            cur.execute(
                "UPDATE utilisateur SET mot_de_passe = %s WHERE email = %s",
                (hashed, email)
            )
            conn.commit()

        return jsonify({'message': 'Mot de passe mis à jour avec succès.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()

# -----------------------------
# Route de gestion des users par l'admin (bloqué ou débloqué)
# -----------------------------

@auth_bp.route('/changer_permission/<int:user_id>', methods=['PUT'])
@login_required
@admin_required
def changer_permission(user_id):
    try:
        data = request.json
        nouvelle_permission = data.get('permission')

        if nouvelle_permission not in ['accepté', 'bloqué']:
            return jsonify({'error': 'Permission invalide. Doit être "accepté" ou "bloqué".'}), 400

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            # Vérifier que l'utilisateur existe
            cur.execute("SELECT id FROM utilisateur WHERE id = %s", (user_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Utilisateur non trouvé.'}), 404

            # Mettre à jour la permission
            cur.execute("""
                UPDATE utilisateur
                SET permission = %s
                WHERE id = %s
            """, (nouvelle_permission, user_id))
            conn.commit()

        return jsonify({'message': f'Permission mise à jour en "{nouvelle_permission}" pour l\'utilisateur {user_id}.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()






# -----------------------------
# Route d'insertion des facilités
# -----------------------------

@auth_bp.route('/type_projets', methods=['GET'])
@login_required
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

#Routes de sélection du type de projet avant importation des données

@auth_bp.route('/selection_type_projet', methods=['POST'])
@login_required
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




@auth_bp.route('/types_projets', methods=['GET', 'POST'])
@login_required
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
        return add_type_projet()


@login_required
def add_type_projet():
    data = request.get_json()
    nom_facilite = data.get('nom_facilite')

    if not nom_facilite:
        return jsonify({'error': 'Le champ nom_facilite est obligatoire.'}), 400

    auteur = f"{current_user.nom} {current_user.prenom}"  # Ou current_user.mail, selon ce que tu préfères

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

#Supprimer une facilité créée 

@auth_bp.route('/types_projets/<id_type_projet>', methods=['DELETE'])
@login_required
def delete_type_projet(id_type_projet):
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute("DELETE FROM type_projet WHERE id_type_projet = %s", (id_type_projet,))
            if cur.rowcount == 0:
                return jsonify({'error': "Facilité introuvable ou déjà supprimée."}), 404
            conn.commit()

        return jsonify({'message': 'Facilité supprimée avec succès.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()



#Route d'importation dans excel

# @auth_bp.route("/import_excel", methods=["POST"])
# @login_required
# def import_excel():
#     conn = None
#     try:
#         if 'file' not in request.files:
#             return jsonify({"error": "Aucun fichier fourni"}), 400

#         file = request.files['file']
#         nom_fichier = file.filename if file else None

#         df = pd.read_excel(file)
#         df = df.replace({np.nan: None})

#         required_columns = [
#             "date_comite_validation", "numero", "pda", "psf", "departement",
#             "commune", "intitule_projet", "denomination_entite", "nom_promoteur",
#             "sexe_promoteur", "statut_juridique", "adresse_contact", "filiere",
#             "maillon_type_credit", "cout_total_projet", "credit_solicite",
#             "credit_accorde", "refinancement_accorde", "credit_accorde_statut",
#             "total_financement", "statut_dossier"
#         ]

#         missing_cols = [col for col in required_columns if col not in df.columns]
#         if missing_cols:
#             return jsonify({"error": f"Colonnes manquantes dans le fichier Excel: {', '.join(missing_cols)}"}), 400

#         if df["date_comite_validation"].dtype in ["float64", "int64"]:
#             df["date_comite_validation"] = pd.to_datetime(df["date_comite_validation"], unit='d', origin='1899-12-30')

#         id_type_projet = session.get('id_type_projet')
#         if not id_type_projet:
#             return jsonify({"error": "Type de projet non sélectionné dans la session."}), 400

#         created_by = f"{current_user.prenom} {current_user.nom}"

#         conn = get_connection()
#         if conn is None:
#             return jsonify({"error": "Connexion à la base impossible."}), 500

#         with conn.cursor() as cur:
#             # Vider table temporaire
#             cur.execute("TRUNCATE TABLE donnees_importees RESTART IDENTITY CASCADE")

#             for _, row in df.iterrows():
#                 row_dict = row.to_dict()

#                 cur.execute("""
#                     INSERT INTO donnees_importees (
#                         date_comite_validation, numero, pda, psf, departement,
#                         commune, intitule_projet, denomination_entite, nom_promoteur,
#                         sexe_promoteur, statut_juridique, adresse_contact, filiere,
#                         maillon_type_credit, cout_total_projet, credit_solicite,
#                         credit_accorde, refinancement_accorde, credit_accorde_statut,
#                         total_financement, statut_dossier
#                     ) VALUES (
#                         %(date_comite_validation)s, %(numero)s, %(pda)s, %(psf)s, %(departement)s,
#                         %(commune)s, %(intitule_projet)s, %(denomination_entite)s, %(nom_promoteur)s,
#                         %(sexe_promoteur)s, %(statut_juridique)s, %(adresse_contact)s, %(filiere)s,
#                         %(maillon_type_credit)s, %(cout_total_projet)s, %(credit_solicite)s,
#                         %(credit_accorde)s, %(refinancement_accorde)s, %(credit_accorde_statut)s,
#                         %(total_financement)s, %(statut_dossier)s
#                     )
#                 """, row_dict)

#                 cur.execute("""
#                     INSERT INTO promoteur (nom_promoteur, nom_entite, sexe_promoteur, statut_juridique)
#                     VALUES (%s, %s, %s, %s)
#                     ON CONFLICT (nom_promoteur, nom_entite) DO NOTHING
#                 """, (
#                     row_dict["nom_promoteur"], row_dict["denomination_entite"],
#                     row_dict["sexe_promoteur"], row_dict["statut_juridique"]
#                 ))

#                 cur.execute("""
#                     INSERT INTO psf (nom_psf)
#                     VALUES (%s)
#                     ON CONFLICT (nom_psf) DO NOTHING
#                 """, (row_dict["psf"],))

#                 cur.execute("""
#                     INSERT INTO filiere (nom_filiere, maillon)
#                     VALUES (%s, %s)
#                     ON CONFLICT (nom_filiere) DO NOTHING
#                 """, (row_dict["filiere"], row_dict["maillon_type_credit"]))

#                 # Récupérer les ids liés
#                 cur.execute("SELECT id_promoteur FROM promoteur WHERE nom_promoteur = %s AND nom_entite = %s",
#                             (row_dict["nom_promoteur"], row_dict["denomination_entite"]))
#                 id_promoteur = cur.fetchone()
#                 id_promoteur = id_promoteur[0] if id_promoteur else None

#                 cur.execute("SELECT id_psf FROM psf WHERE nom_psf = %s", (row_dict["psf"],))
#                 id_psf = cur.fetchone()
#                 id_psf = id_psf[0] if id_psf else None

#                 cur.execute("SELECT id_filiere FROM filiere WHERE nom_filiere = %s", (row_dict["filiere"],))
#                 id_filiere = cur.fetchone()
#                 id_filiere = id_filiere[0] if id_filiere else None

#                 nom_commune = row_dict["commune"].strip().lower()
#                 cur.execute("""
#                     SELECT id_commune FROM commune
#                     WHERE TRIM(LOWER(nom_commune)) = %s
#                 """, (nom_commune,))
#                 result_commune = cur.fetchone()
#                 id_commune = result_commune[0] if result_commune else None

#                 if not id_commune:
#                     raise ValueError(f"Commune non trouvée pour : '{row_dict['commune']}'")

#                 # Insertion finale dans projet_financement
#                 cur.execute("""
#                     INSERT INTO projet_financement (
#                         date_comite_validation, id_psf, id_commune,
#                         intitule_projet, id_promoteur, id_filiere,
#                         cout_total_projet, credit_solicite, credit_accorde,
#                         refinancement_accorde, credit_accorde_statut, total_financement,
#                         statut_dossier, id_type_projet, created_by
#                     ) VALUES (
#                         %(date_comite_validation)s, %(id_psf)s, %(id_commune)s,
#                         %(intitule_projet)s, %(id_promoteur)s, %(id_filiere)s,
#                         %(cout_total_projet)s, %(credit_solicite)s, %(credit_accorde)s,
#                         %(refinancement_accorde)s, %(credit_accorde_statut)s, %(total_financement)s,
#                         %(statut_dossier)s, %(id_type_projet)s, %(created_by)s
#                     )
#                 """, {
#                     "date_comite_validation": row_dict["date_comite_validation"],
#                     "id_psf": id_psf,
#                     "id_commune": id_commune,
#                     "intitule_projet": row_dict["intitule_projet"],
#                     "id_promoteur": id_promoteur,
#                     "id_filiere": id_filiere,
#                     "cout_total_projet": row_dict["cout_total_projet"],
#                     "credit_solicite": row_dict["credit_solicite"],
#                     "credit_accorde": row_dict["credit_accorde"],
#                     "refinancement_accorde": row_dict["refinancement_accorde"],
#                     "credit_accorde_statut": row_dict["credit_accorde_statut"],
#                     "total_financement": row_dict["total_financement"],
#                     "statut_dossier": row_dict["statut_dossier"],
#                     "id_type_projet": id_type_projet,
#                     "created_by": created_by
#                 })

#             # Commit des données principales
#             conn.commit()

#             # Insérer l'historique d'importation en succès
#             cur.execute("""
#                 INSERT INTO historique_importation (
#                     nom_fichier, id_type_projet, utilisateur, statut
#                 ) VALUES (%s, %s, %s, %s)
#             """, (nom_fichier, id_type_projet, created_by, True))

#             conn.commit()

#         session.pop('id_type_projet', None)
#         return jsonify({"message": "Fichier importé et données insérées avec succès."}), 200

#     except Exception as e:
#         if conn:
#             conn.rollback()
#         try:
#             # Enregistrement dans historique d'import en cas d'erreur
#           with conn.cursor() as cur:
#                 cur.execute("""
#                     INSERT INTO historique_importation (
#                         nom_fichier, id_type_projet, utilisateur, statut
#                     ) VALUES (%s, %s, %s, %s)
#                 """, (
#                     nom_fichier if 'nom_fichier' in locals() else None,
#                     id_type_projet if 'id_type_projet' in locals() else None,
#                     created_by if 'created_by' in locals() else None,
#                     False
#                 ))
#                 conn.commit()

#         except:
#             # On ignore l'erreur ici pour ne pas masquer l'originale
#             pass

#         return jsonify({"error": str(e)}), 500

#     finally:
#         if conn:
#             conn.close()







#Routes pour récupérer puis afficher toute les opérations faites


@auth_bp.route('/projets_financement', methods=['GET'])
@login_required
def get_projets_financement():
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    pf.id_projet,
                    pf.date_comite_validation,
                    pf.intitule_projet,
                    pf.cout_total_projet,
                    pf.credit_solicite,
                    pf.credit_accorde,
                    pf.refinancement_accorde,
                    pf.total_financement,
                    c.nom_commune,
                    f.nom_filiere,
                    ps.nom_psf,
                    p.nom_promoteur,
                    p.nom_entite,
                    pf.statut_dossier,
                    pf.credit_accorde_statut,
                    tp.nom_facilite,
                    pf.created_by,
                    pf.created_at
                FROM projet_financement pf
                LEFT JOIN commune c ON pf.id_commune = c.id_commune
                LEFT JOIN filiere f ON pf.id_filiere = f.id_filiere
                LEFT JOIN psf ps ON pf.id_psf = ps.id_psf
                LEFT JOIN promoteur p ON pf.id_promoteur = p.id_promoteur
                LEFT JOIN type_projet tp ON pf.id_type_projet = tp.id_type_projet
                ORDER BY pf.created_at DESC
            """)
            rows = cur.fetchall()

            projets = [
                {
                    'id_projet': r[0],
                    'date_comite_validation': r[1],
                    'intitule_projet': r[2],
                    'cout_total_projet': r[3],
                    'credit_solicite': r[4],
                    'credit_accorde': r[5],
                    'refinancement_accorde': r[6],
                    'total_financement': r[7],
                    'nom_commune': r[8],
                    'nom_filiere': r[9],
                    'nom_psf': r[10],
                    'nom_promoteur': r[11],
                    'prenom_promoteur': r[12],  # ici c'est nom_entite qu'on utilise
                    'statut_dossier': r[13],
                    'credit_accorde_statut': r[14],
                    'nom_type_projet': r[15],
                    'created_by': r[16],
                    'created_at': r[17].strftime('%Y-%m-%d %H:%M:%S') if r[17] else None
                }
                for r in rows
            ]

        return jsonify(projets), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()


#Route pour affichage dynamique des facilités


@auth_bp.route('/<string:id_type_projet>', methods=['GET'])
@login_required
def get_projets_par_facilite(id_type_projet):
    try:
        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    pf.id_projet,
                    pf.date_comite_validation,
                    pf.intitule_projet,
                    pf.cout_total_projet,
                    pf.credit_solicite,
                    pf.credit_accorde,
                    pf.refinancement_accorde,
                    pf.total_financement,
                    c.nom_commune,
                    f.nom_filiere,
                    ps.nom_psf,
                    p.nom_promoteur,
                    p.nom_entite,
                    pf.statut_dossier,
                    pf.credit_accorde_statut,
                    tp.nom_facilite,
                    pf.created_by,
                    pf.created_at
                FROM projet_financement pf
                LEFT JOIN commune c ON pf.id_commune = c.id_commune
                LEFT JOIN filiere f ON pf.id_filiere = f.id_filiere
                LEFT JOIN psf ps ON pf.id_psf = ps.id_psf
                LEFT JOIN promoteur p ON pf.id_promoteur = p.id_promoteur
                LEFT JOIN type_projet tp ON pf.id_type_projet = tp.id_type_projet
                WHERE pf.id_type_projet = %s
                ORDER BY pf.created_at DESC
            """, (id_type_projet,))
            rows = cur.fetchall()

            projets = [
                {
                    'id_projet': r[0],
                    'date_comite_validation': r[1],
                    'intitule_projet': r[2],
                    'cout_total_projet': r[3],
                    'credit_solicite': r[4],
                    'credit_accorde': r[5],
                    'refinancement_accorde': r[6],
                    'total_financement': r[7],
                    'nom_commune': r[8],
                    'nom_filiere': r[9],
                    'nom_psf': r[10],
                    'nom_promoteur': r[11],
                    'prenom_promoteur': r[12],
                    'statut_dossier': r[13],
                    'credit_accorde_statut': r[14],
                    'nom_type_projet': r[15],
                    'created_by': r[16],
                    'created_at': r[17].strftime('%Y-%m-%d %H:%M:%S') if r[17] else None
                }
                for r in rows
            ]

        return jsonify(projets), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if conn:
            conn.close()

# Gestion et affichage de l'historique 

@auth_bp.route('/history', methods=['GET'])
@login_required
def import_excel_history():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, nom_fichier, id_type_projet, utilisateur, date_import, statut
                FROM historique_importation
                ORDER BY date_import DESC
                LIMIT 100
            """)
            rows = cur.fetchall()
            columns = [desc[0] for desc in cur.description]
            data = [dict(zip(columns, row)) for row in rows]

        return jsonify(data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()




from flask import jsonify, request
from flask_login import login_required, current_user

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    try:
        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({'error': 'Champs requis manquants.'}), 400

        conn = get_connection()
        if conn is None:
            return jsonify({'error': 'Connexion à la base impossible.'}), 500

        with conn.cursor() as cur:
            cur.execute("SELECT mot_de_passe FROM utilisateur WHERE id = %s", (current_user.id,))
            result = cur.fetchone()

            if not result:
                return jsonify({'error': 'Utilisateur non trouvé.'}), 404

            hashed_password = result[0]

            if not verify_password(current_password, hashed_password):
                return jsonify({'error': 'Mot de passe actuel incorrect.'}), 401

            new_hashed = hash_password(new_password)

            cur.execute("""
                UPDATE utilisateur
                SET mot_de_passe = %s, mot_de_passe_temporaire = false
                WHERE id = %s
            """, (new_hashed, current_user.id))
            conn.commit()

        return jsonify({'message': 'Mot de passe changé avec succès.'}), 200

    except Exception as e:
        # Toujours renvoyer une réponse JSON
        return jsonify({'error': f'Erreur serveur : {str(e)}'}), 500

    finally:
        if 'conn' in locals() and conn:
            conn.close()































































@auth_bp.route("/import_excel", methods=["POST"])
@login_required
def import_excel():
    conn = None
    try:
        if 'file' not in request.files:
            return jsonify({"error": "Aucun fichier fourni"}), 400

        file = request.files['file']
        nom_fichier = file.filename if file else None

        # 1️⃣ Lecture du fichier Excel
        df = pd.read_excel(file)
        df = df.replace({np.nan: None})

        # 2️⃣ Mapping des noms Excel → noms de colonnes en base
        column_mapping = {
            "Date comité": "date_comite_validation",
            "N° dossier": "numero",
            "PDA": "pda",
            "Nom PSF": "psf",
            "Département": "departement",
            "Commune": "commune",
            "Intitulé du projet": "intitule_projet",
            "Nom de l'entité": "denomination_entite",
            "Nom du promoteur": "nom_promoteur",
            "Sexe": "sexe_promoteur",
            "Statut juridique": "statut_juridique",
            "Adresse": "adresse_contact",
            "Filière": "filiere",
            "Maillon / type crédit": "maillon_type_credit",
            "Coût total": "cout_total_projet",
            "Crédit sollicité": "credit_solicite",
            "Crédit accordé": "credit_accorde",
            "Refinancement": "refinancement_accorde",
            "Statut crédit accordé": "credit_accorde_statut",
            "Total financement": "total_financement",
            "Statut dossier": "statut_dossier"
        }

        # Renommer les colonnes selon le mapping
        df.rename(columns=column_mapping, inplace=True)

        # 3️⃣ Vérifier que toutes les colonnes attendues existent après renommage
        required_columns = list(column_mapping.values())
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Colonnes manquantes après renommage : {', '.join(missing_cols)}"}), 400

        # 4️⃣ Conversion de date si nécessaire
        if df["date_comite_validation"].dtype in ["float64", "int64"]:
            df["date_comite_validation"] = pd.to_datetime(
                df["date_comite_validation"], unit='d', origin='1899-12-30'
            )

        # 5️⃣ Récupération de la session
        id_type_projet = session.get('id_type_projet')
        if not id_type_projet:
            return jsonify({"error": "Type de projet non sélectionné dans la session."}), 400

        created_by = f"{current_user.prenom} {current_user.nom}"

        # 6️⃣ Connexion BDD
        conn = get_connection()
        if conn is None:
            return jsonify({"error": "Connexion à la base impossible."}), 500

        with conn.cursor() as cur:
            # Vider la table temporaire
            cur.execute("TRUNCATE TABLE donnees_importees RESTART IDENTITY CASCADE")

            # Boucle d'insertion inchangée
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

                # Récupérer les ids liés
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

                # Insertion finale dans projet_financement
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

            # Commit des données principales
            conn.commit()

            # Insérer l'historique d'importation en succès
            cur.execute("""
                INSERT INTO historique_importation (
                    nom_fichier, id_type_projet, utilisateur, statut
                ) VALUES (%s, %s, %s, %s)
            """, (nom_fichier, id_type_projet, created_by, True))

            conn.commit()

        session.pop('id_type_projet', None)
        return jsonify({"message": "Fichier importé et données insérées avec succès."}), 200

    except Exception as e:
        if conn:
            conn.rollback()
        try:
            # Enregistrement dans historique d'import en cas d'erreur
          with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO historique_importation (
                        nom_fichier, id_type_projet, utilisateur, statut
                    ) VALUES (%s, %s, %s, %s)
                """, (
                    nom_fichier if 'nom_fichier' in locals() else None,
                    id_type_projet if 'id_type_projet' in locals() else None,
                    created_by if 'created_by' in locals() else None,
                    False
                ))
                conn.commit()

        except:
            # On ignore l'erreur ici pour ne pas masquer l'originale
            pass

        return jsonify({"error": str(e)}), 500

    finally:
        if conn:
            conn.close()