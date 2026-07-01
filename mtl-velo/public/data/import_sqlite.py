#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sqlite3
import csv
import glob

conn = sqlite3.connect('./comptage_velo.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS comptage_velo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_heure TEXT,
    id_compteur INTEGER,
    nb_passages INTEGER
)
''')
conn.commit()

# Read all files matching the pattern
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

print("All data inserted successfully.")
conn.close()