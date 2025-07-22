# models.py
from flask_login import UserMixin
from db import get_connection

class User(UserMixin):
    def __init__(self, id, nom, prenom, email, admin, photo_profil=None):
        self.id = id
        self.nom = nom
        self.prenom = prenom
        self.email = email
        self.admin = admin
        self.photo_profil = photo_profil  # chemin du fichier ou nom de l'image

    @staticmethod
    def get_by_id(user_id):
        conn = get_connection()
        if not conn:
            return None
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, nom, prenom, email, admin, photo_profil 
            FROM utilisateur 
            WHERE id = %s
        """, (user_id,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if row:
            return User(*row)
        return None
