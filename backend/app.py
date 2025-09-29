

from flask import Flask, session, send_from_directory
from flask_cors import CORS
from flask_login import LoginManager
import os

from config import get_secret_key
from extensions import mail
from models.models import User
from routes.authnew import auth_bp

# 📦 App Flask
app = Flask(__name__)
app.secret_key = get_secret_key()
CORS(app, supports_credentials=True)

# 📧 Configuration mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'cesarboutoile@gmail.com'
app.config['MAIL_PASSWORD'] = 'ufnp rloc neqo accx'
app.config['MAIL_DEFAULT_SENDER'] = 'cesarboutoile@gmail.com'
mail.init_app(app)

# 🔐 Authentification
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)

# 📁 Configuration des uploads
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
PROFILS_FOLDER = os.path.join(UPLOAD_FOLDER, 'profils')

# Crée le dossier profils s'il n'existe pas
os.makedirs(PROFILS_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route pour servir les avatars
@app.route('/uploads/profils/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(PROFILS_FOLDER, filename)

# 🔄 Enregistrement des routes
app.register_blueprint(auth_bp, url_prefix="/auth")

# ✅ Test de vie
@app.route("/")
def index():
    return "API en ligne"

# ▶️ Lancement
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

