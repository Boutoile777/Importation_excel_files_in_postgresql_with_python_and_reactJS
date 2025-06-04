import flask
import pandas as pd
import numpy as np

print("Flask version:", flask.__version__)
print("Pandas version:", pd.__version__)
print("Numpy version:", np.__version__)


from db import get_connection

conn = get_connection()
if conn:
    print("Connexion réussie à PostgreSQL.")
    conn.close()
else:
    print("Échec de connexion.")
