# from flask import Flask, session
# from flask_cors import CORS
# from routes.auth import auth_bp

# app = Flask(__name__)
# app.secret_key = "C95ar@Z001"  # ✅ obligatoire pour session
# CORS(app, supports_credentials=True)  # ✅ pour accepter les cookies côté React

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


app = Flask(__name__)
app.secret_key = get_secret_key()  # ✅ récupère la clé depuis config.ini
CORS(app, supports_credentials=True)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.get_by_id(user_id)

app.register_blueprint(auth_bp, url_prefix="/auth")

@app.route("/")
def index():
    return "API en ligne"

if __name__ == "__main__":
    app.run(debug=True)
