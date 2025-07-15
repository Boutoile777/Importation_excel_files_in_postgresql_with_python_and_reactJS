
# from flask import Flask, session
# from flask_cors import CORS
# from routes.authnew import auth_bp
# from config import get_secret_key
# from flask_login import LoginManager
# from models.models import User


# app = Flask(__name__)
# app.secret_key = get_secret_key()  # ✅ récupère la clé depuis config.ini
# CORS(app, supports_credentials=True)

# login_manager = LoginManager()
# login_manager.init_app(app)

# @login_manager.user_loader
# def load_user(user_id):
#     return User.get_by_id(user_id)

# app.register_blueprint(auth_bp, url_prefix="/auth")

# @app.route("/")
# def index():
#     return "API en ligne"

# if __name__ == "__main__":
#     app.run(debug=True)


from flask import Flask, session
from flask_cors import CORS
from routes.authnew import auth_bp
from config import get_secret_key
from flask_login import LoginManager
from models.models import User

# 🔄 importe depuis extensions
from extensions import mail

app = Flask(__name__)
app.secret_key = get_secret_key()
CORS(app, supports_credentials=True)

# 📧 CONFIGURATION DU MAIL
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'cesarboutoile@gmail.com'
app.config['MAIL_PASSWORD'] = 'ufnp rloc neqo accx'
app.config['MAIL_DEFAULT_SENDER'] = 'cesarboutoile@gmail.com'

# ✅ Initialisation mail AVEC L'APP
mail.init_app(app)

# 🔐 LoginManager
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)

# 🟢 Blueprint
app.register_blueprint(auth_bp, url_prefix="/auth")

@app.route("/")
def index():
    return "API en ligne"

if __name__ == "__main__":
    app.run(debug=True)

