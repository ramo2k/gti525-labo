#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sqlite3
import csv
import glob
import os

conn = sqlite3.connect('./comptage_velo.db')
cursor = conn.cursor()

# Table des passages vélos
cursor.execute('''
CREATE TABLE IF NOT EXISTS comptage_velo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_heure TEXT,
    id_compteur INTEGER,
    nb_passages INTEGER
)
''')

# Table des compteurs (ajouté pour avoir les GPS en T4.2)
cursor.execute('''
CREATE TABLE IF NOT EXISTS compteurs (
    ID INTEGER PRIMARY KEY,
    Nom TEXT,
    Statut TEXT,
    Annee_implante INTEGER,
    Latitude REAL,
    Longitude REAL
)
''')
conn.commit()

# Importation des compteurs
if os.path.exists("./compteurs.csv"):
    print("Inserting data from compteurs.csv...")
    with open("./compteurs.csv", newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        to_insert_compteurs = []
        for row in reader:
            # Gérer le cas où les coordonnées pourraient être vides
            lat = float(row['Latitude']) if row['Latitude'] else None
            lng = float(row['Longitude']) if row['Longitude'] else None
            to_insert_compteurs.append((
                int(row['ID']),
                row['Nom'],
                row['Statut'],
                int(row['Annee_implante']) if row['Annee_implante'] else None,
                lat,
                lng
            ))
        cursor.executemany('''
            INSERT OR IGNORE INTO compteurs (ID, Nom, Statut, Annee_implante, Latitude, Longitude)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', to_insert_compteurs)
        conn.commit()

# Importation des passages
csv_files = glob.glob("./comptage_velo_*.csv")

for file in csv_files:
    print(f"Inserting data from {file}...")
    with open(file, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        to_insert = [
            (row['date_heure'], int(row['id_compteur']), int(row['nb_passages']))
            for row in reader
        ]
        cursor.executemany('''
            INSERT INTO comptage_velo (date_heure, id_compteur, nb_passages)
            VALUES (?, ?, ?)
        ''', to_insert)
        conn.commit()

# Création de l'index
print("Creating index for fast queries...")
cursor.execute('CREATE INDEX IF NOT EXISTS idx_compteur_date ON comptage_velo (id_compteur, date_heure)')
conn.commit()

print("All data inserted successfully.")
conn.close()