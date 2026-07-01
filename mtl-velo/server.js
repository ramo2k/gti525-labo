import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;

// Connexion à la base de données
const dbPath = path.join(__dirname, 'public', 'data', 'comptage_velo.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erreur de connexion à SQLite:", err.message);
    } else {
        console.log("Connecté à la base de données SQLite.");
    }
});

// Middleware pour analyser le JSON
app.use(express.json());

// T4.1 : Servir la frontale (fichiers statiques React générés dans /dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Fonction utilitaire pour parser les CSV
const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            Papa.parse(data, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    });
};

// Routes API (T4.2 & T4.3)

// T4.3: Retourner le réseau cyclable (GeoJSON)
app.get('/gti525/v1/pistes', (req, res) => {
    const geojsonPath = path.join(__dirname, 'public', 'data', 'reseau_cyclable.geojson');
    fs.promises.readFile(geojsonPath, 'utf8')
        .then(data => {
            res.json(JSON.parse(data));
        })
        .catch(err => {
            res.status(500).json({ erreur: "Erreur lors de la lecture du réseau cyclable." });
        });
});

// T4.3: Retourner les points d'intérêt (CSV vers JSON)
app.get('/gti525/v1/pointsdinteret', (req, res) => {
    const poiPath = path.join(__dirname, 'public', 'data', 'poi.csv');
    parseCSV(poiPath)
        .then(poiData => {
            res.json(poiData);
        })
        .catch(err => {
            res.status(500).json({ erreur: "Erreur lors du traitement des points d'intérêt." });
        });
});

// T4.2: Retourner la collection des compteurs (Depuis la base SQLite pour avoir les GPS de T2.1)
app.get('/gti525/v1/compteurs', (req, res) => {
    new Promise((resolve, reject) => {
        db.all('SELECT * FROM compteurs', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    })
    .then(rows => {
        res.json(rows);
    })
    .catch(err => {
        res.status(500).json({ erreur: "Erreur lors de la récupération des compteurs." });
    });
});

// T4.2 & T4.4: Retourner les passages agrégés pour un compteur sur une période
app.get('/gti525/v1/compteurs/:id/passages', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const debut = req.query.debut;
    const fin = req.query.fin;

    // Validation stricte des entrées (T4.4)
    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant du compteur doit être un entier." });
    }
    
    const dateRegex = /^\d{8}$/; // Format YYYYMMDD
    if (!debut || !fin || !dateRegex.test(debut) || !dateRegex.test(fin)) {
        return res.status(400).json({ erreur: "Les paramètres 'debut' et 'fin' sont requis au format YYYYMMDD." });
    }

    // Conversion YYYYMMDD vers YYYY-MM-DD
    const formattedDebut = `${debut.substring(0, 4)}-${debut.substring(4, 6)}-${debut.substring(6, 8)}`;
    const formattedFin = `${fin.substring(0, 4)}-${fin.substring(4, 6)}-${fin.substring(6, 8)}`;

    // Requête paramétrée (T4.4: prévention des injections SQL)
    const sql = `
        SELECT substr(date_heure, 1, 10) as date, SUM(nb_passages) as passages 
        FROM comptage_velo 
        WHERE id_compteur = ? 
        AND substr(date_heure, 1, 10) BETWEEN ? AND ? 
        GROUP BY substr(date_heure, 1, 10)
        ORDER BY date ASC
    `;

    new Promise((resolve, reject) => {
        db.all(sql, [id, formattedDebut, formattedFin], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    })
    .then(rows => {
        res.json(rows);
    })
    .catch(err => {
        res.status(500).json({ erreur: "Erreur lors de la requête des passages." });
    });
});

// Toute autre route non-API est gérée par React (pour la navigation côté client)
app.use((req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application non compilée. Veuillez exécuter npm run build.');
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
