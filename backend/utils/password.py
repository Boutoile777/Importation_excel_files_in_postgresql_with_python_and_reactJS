import bcrypt

from werkzeug.security import check_password_hash

def hash_password(plain_password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def verify_password(plain_password, hashed_password):
    return check_password_hash(hashed_password, plain_password)
