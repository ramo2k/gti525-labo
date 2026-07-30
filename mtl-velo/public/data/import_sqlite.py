#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sqlite3
import csv
import glob
import os
import json

conn = sqlite3.connect('./comptage_velo.db')
cursor = conn.cursor()



def is_point_in_polygon(point, polygon):
    x, y = point
    inside = False
    j = len(polygon) - 1
    for i in range(len(polygon)):
        xi, yi = polygon[i][0], polygon[i][1]
        xj, yj = polygon[j][0], polygon[j][1]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def get_arrondissement(lng, lat, territoires):
    if lng is None or lat is None:
        return None
    pt = (lng, lat)
    for feature in territoires['features']:
        geom = feature['geometry']
        coords = geom['coordinates']
        if geom['type'] == 'Polygon':
            if is_point_in_polygon(pt, coords[0]):
                return feature['properties']['NOM']
        elif geom['type'] == 'MultiPolygon':
            for poly in coords:
                if is_point_in_polygon(pt, poly[0]):
                    return feature['properties']['NOM']
    return None


# Même logique que src/utils/mapLogic.js (getTrackCategory), reproduite ici en Python
def get_track_category(props):
    rev_status = props.get('REV_AVANCEMENT_CODE')
    status = props.get('AVANCEMENT_CODE')
    type_voie = str(props.get('TYPE_VOIE_CODE'))

    if rev_status in ('EV', 'PE', 'TR'):
        return 'REV'

    if status == 'E':
        if type_voie in ('1', '3', '8', '9'):
            return 'PARTAGEE'
        if type_voie in ('4', '5', '6'):
            return 'PROTEGEE'
        if type_voie == '7':
            return 'POLYVALENT'

    return 'AUTRE'




cursor.execute('''
CREATE TABLE IF NOT EXISTS comptage_velo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_heure TEXT,
    id_compteur INTEGER,
    nb_passages INTEGER
)
''')

# Table: compteurs
# Description: Contient les détails des compteurs cyclables avec arrondissement précalculé.
cursor.execute('''
CREATE TABLE IF NOT EXISTS compteurs (
    ID INTEGER PRIMARY KEY,
    Nom TEXT,
    Statut TEXT,
    Annee_implante INTEGER,
    Latitude REAL,
    Longitude REAL,
    Arrondissement TEXT
)
''')

# Table: utilisateurs
# Description: Contient les comptes utilisateurs (courriel, mot de passe haché) pour l'authentification.
cursor.execute('''
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    courriel TEXT UNIQUE NOT NULL,
    mot_de_passe_hache TEXT NOT NULL,
    date_creation TEXT DEFAULT CURRENT_TIMESTAMP
)
''')

# Table: pointsdinteret
# Description: Contient les points d'intérêt (fontaines, etc.) ajoutés par les utilisateurs.
cursor.execute('''
CREATE TABLE IF NOT EXISTS pointsdinteret (
    ID INTEGER PRIMARY KEY,
    Arrondissement TEXT,
    Nom TEXT,
    Type TEXT,
    Intersection TEXT,
    Latitude REAL,
    Longitude REAL
)
''')

# Table: pistes
# Description: Contient le réseau des pistes cyclables (tracés géographiques GeoJSON convertis).
cursor.execute('''
CREATE TABLE IF NOT EXISTS pistes (
    id_cycl INTEGER PRIMARY KEY,
    geometry TEXT,
    geom_type TEXT,
    longueur REAL,
    categorie TEXT,
    saisons4 TEXT,
    route_verte TEXT,
    arrondissement TEXT
)
''')
conn.commit()


territoires = None
if os.path.exists('./territoires.geojson'):
    with open('./territoires.geojson', encoding='utf-8') as f:
        territoires = json.load(f)


if os.path.exists("./compteurs.csv"):
    print("Inserting data from compteurs.csv...")
    with open("./compteurs.csv", newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        to_insert_compteurs = []
        for row in reader:
            lat = float(row['Latitude']) if row['Latitude'] else None
            lng = float(row['Longitude']) if row['Longitude'] else None
            arrondissement = get_arrondissement(lng, lat, territoires) if territoires else None
            to_insert_compteurs.append((
                int(row['ID']),
                row['Nom'],
                row['Statut'],
                int(row['Annee_implante']) if row['Annee_implante'] else None,
                lat,
                lng,
                arrondissement
            ))
        cursor.executemany('''
            INSERT OR REPLACE INTO compteurs (ID, Nom, Statut, Annee_implante, Latitude, Longitude, Arrondissement)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', to_insert_compteurs)
        conn.commit()


if os.path.exists("./poi.csv"):
    print("Inserting data from poi.csv...")
    with open("./poi.csv", newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        to_insert_poi = []
        for row in reader:
            lat = float(row['Latitude']) if row['Latitude'] else None
            lng = float(row['Longitude']) if row['Longitude'] else None
            to_insert_poi.append((
                int(row['ID']),
                row['Arrondissement'],
                row['Nom_parc_lieu'],
                'Fontaine',  
                row['Intersection'],
                lat,
                lng
            ))
        cursor.executemany('''
            INSERT OR REPLACE INTO pointsdinteret (ID, Arrondissement, Nom, Type, Intersection, Latitude, Longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', to_insert_poi)
        conn.commit()


if os.path.exists("./reseau_cyclable.geojson"):
    print("Inserting data from reseau_cyclable.geojson...")
    with open("./reseau_cyclable.geojson", encoding='utf-8') as f:
        reseau = json.load(f)

    to_insert_pistes = []
    for feature in reseau['features']:
        props = feature['properties']
        geom_type = feature['geometry']['type']
        coords = feature['geometry']['coordinates']  

        
        if geom_type == 'MultiLineString':
            premier_point = coords[0][0] if coords and coords[0] else [None, None]
        else:
            premier_point = coords[0] if coords else [None, None]

        arrondissement = get_arrondissement(premier_point[0], premier_point[1], territoires) if territoires else None

        to_insert_pistes.append((
            int(props['ID_CYCL']),
            json.dumps(coords),
            geom_type,
            props.get('LONGUEUR') or 0,
            get_track_category(props),
            props.get('SAISONS4'),
            props.get('ROUTE_VERTE'),
            arrondissement
        ))

    cursor.executemany('''
        INSERT OR REPLACE INTO pistes (id_cycl, geometry, geom_type, longueur, categorie, saisons4, route_verte, arrondissement)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', to_insert_pistes)
    conn.commit()


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


print("Creating indexes for fast queries...")
cursor.execute('CREATE INDEX IF NOT EXISTS idx_compteur_date ON comptage_velo (id_compteur, date_heure)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_compteurs_arr ON compteurs (Arrondissement)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_poi_arr ON pointsdinteret (Arrondissement)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_pistes_arr ON pistes (arrondissement)')
conn.commit()

print("All data inserted successfully.")
conn.close()