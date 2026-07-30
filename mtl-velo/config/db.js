import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion à la base de données
const dbPath = path.join(__dirname, '..', 'public', 'data', 'comptage_velo.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erreur de connexion à SQLite:", err.message);
    } else {
        console.log("Connecté à la base de données SQLite.");
    }
});

// Utilitaires pour transformer sqlite3 (callbacks) en Promises
export const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});

export const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

export const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
        err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    });
});

export default db;
