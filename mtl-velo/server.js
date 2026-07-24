import express from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
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

app.use(express.json());

// T4.1 : Servir la frontale (fichiers statiques React générés dans /dist)
app.use(express.static(path.join(__dirname, 'dist')));

// ---------------------------------------------------------------------------
// Petits utilitaires pour transformer sqlite3 (callbacks) en Promises,
// ce qui permet d'utiliser async/await proprement dans les routes ci-dessous.
// ---------------------------------------------------------------------------
const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
    // On utilise 'function' (pas une flèche) pour avoir accès à this.lastID/this.changes
    db.run(sql, params, function (err) {
        err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    });
});

// ---------------------------------------------------------------------------
// T4.3 (esquisse) : middleware de protection par jeton pour les routes d'écriture.
// Pour l'instant, on vérifie seulement la PRÉSENCE d'un en-tête "Authorization:
// Bearer ..." (401 sinon). La vraie vérification de signature JWT sera branchée
// ici lors de l'implémentation complète de T4 (authentification).
// ---------------------------------------------------------------------------
const requireAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length <= 7) {
        return res.status(401).json({ erreur: "Jeton d'authentification manquant ou invalide." });
    }
    // TODO (T4) : remplacer cette vérification de présence par une vraie
    // vérification de signature JWT (jsonwebtoken.verify) une fois l'inscription
    // et la connexion implémentées.
    next();
};

// ---------------------------------------------------------------------------
// T1.1 : Auto-documentation de l'API à la racine
// ---------------------------------------------------------------------------
app.get('/gti525/v1/', (req, res) => {
    res.json({
        nom: "API MTL Vélo",
        points_de_terminaison: [
            { methode: "GET", route: "/gti525/v1/", description: "Liste tous les points de terminaison disponibles." },
            { methode: "GET", route: "/gti525/v1/compteurs", description: "Liste paginée des compteurs (filtres: page, limite, implantation, nom, arrondissement)." },
            { methode: "GET", route: "/gti525/v1/compteurs/:id", description: "Détails d'un compteur (sans les passages)." },
            { methode: "GET", route: "/gti525/v1/compteurs/:id/passages", description: "Passages agrégés d'un compteur (paramètres: debut, fin, intervalle)." },
            { methode: "GET", route: "/gti525/v1/pointsdinteret", description: "Liste paginée des points d'intérêt (filtres: page, limite, type, arrondissement, nom)." },
            { methode: "POST", route: "/gti525/v1/pointsdinteret", description: "Crée un point d'intérêt (protégé par jeton)." },
            { methode: "PUT", route: "/gti525/v1/pointsdinteret/:id", description: "Modifie un point d'intérêt (protégé par jeton)." },
            { methode: "DELETE", route: "/gti525/v1/pointsdinteret/:id", description: "Supprime un point d'intérêt (protégé par jeton)." },
            { methode: "GET", route: "/gti525/v1/pistes", description: "Réseau cyclable en GeoJSON (filtres: arrondissement, categorie, populaireDebut, populaireFin)." }
        ]
    });
});

// ---------------------------------------------------------------------------
// T2.1 : GET /compteurs - liste paginée, filtres délégués à la base
// ---------------------------------------------------------------------------
app.get('/gti525/v1/compteurs', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limite = Math.max(1, parseInt(req.query.limite, 10) || 20);
        const offset = (page - 1) * limite;

        // Construction dynamique du WHERE, mais TOUJOURS avec des paramètres
        // liés (?) - jamais de concaténation de valeurs utilisateur (protection
        // contre les injections SQL, voir T4.4/P8).
        const conditions = [];
        const params = [];

        if (req.query.implantation) {
            conditions.push('Annee_implante >= ?');
            params.push(parseInt(req.query.implantation, 10));
        }
        if (req.query.nom) {
            conditions.push('Nom LIKE ?');
            params.push(`%${req.query.nom}%`);
        }
        if (req.query.arrondissement) {
            conditions.push('Arrondissement = ?');
            params.push(req.query.arrondissement);
        }

        const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const total = (await dbGet(`SELECT COUNT(*) as total FROM compteurs ${whereSql}`, params)).total;
        const donnees = await dbAll(
            `SELECT * FROM compteurs ${whereSql} ORDER BY ID LIMIT ? OFFSET ?`,
            [...params, limite, offset]
        );

        res.json({ donnees, total, page, limite });
    } catch (err) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des compteurs." });
    }
});

// ---------------------------------------------------------------------------
// T2.2 : GET /compteurs/:id - un seul compteur (sans les passages)
// ---------------------------------------------------------------------------
app.get('/gti525/v1/compteurs/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant du compteur doit être un entier." });
    }
    try {
        const compteur = await dbGet('SELECT * FROM compteurs WHERE ID = ?', [id]);
        if (!compteur) {
            return res.status(404).json({ erreur: "Compteur introuvable." });
        }
        res.json(compteur);
    } catch (err) {
        res.status(500).json({ erreur: "Erreur lors de la récupération du compteur." });
    }
});

// ---------------------------------------------------------------------------
// T2.3 : GET /compteurs/:id/passages - agrégation par jour / semaine / mois
// ---------------------------------------------------------------------------
app.get('/gti525/v1/compteurs/:id/passages', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { debut, fin } = req.query;
    const intervalle = req.query.intervalle || 'jour';

    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant du compteur doit être un entier." });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format YYYY-MM-DD
    if (!debut || !fin || !dateRegex.test(debut) || !dateRegex.test(fin)) {
        return res.status(400).json({ erreur: "Les paramètres 'debut' et 'fin' sont requis au format YYYY-MM-DD." });
    }

    // Expression SQL de regroupement selon l'intervalle demandé
    const expressionsGroupement = {
        jour: "substr(date_heure, 1, 10)",
        semaine: "strftime('%Y-S%W', date_heure)",
        mois: "strftime('%Y-%m', date_heure)"
    };
    const expressionGroupement = expressionsGroupement[intervalle];
    if (!expressionGroupement) {
        return res.status(400).json({ erreur: "Le paramètre 'intervalle' doit être 'jour', 'semaine' ou 'mois'." });
    }

    try {
        const sql = `
            SELECT ${expressionGroupement} as periode, SUM(nb_passages) as passages
            FROM comptage_velo
            WHERE id_compteur = ?
            AND substr(date_heure, 1, 10) BETWEEN ? AND ?
            GROUP BY periode
            ORDER BY periode ASC
        `;
        const rows = await dbAll(sql, [id, debut, fin]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ erreur: "Erreur lors de la requête des passages." });
    }
});

// ---------------------------------------------------------------------------
// T2.4 : GET /pointsdinteret - liste paginée, filtres délégués à la base
// ---------------------------------------------------------------------------
app.get('/gti525/v1/pointsdinteret', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limite = Math.max(1, parseInt(req.query.limite, 10) || 20);
        const offset = (page - 1) * limite;

        const conditions = [];
        const params = [];

        if (req.query.type) {
            conditions.push('Type = ?');
            params.push(req.query.type);
        }
        if (req.query.arrondissement) {
            conditions.push('Arrondissement = ?');
            params.push(req.query.arrondissement);
        }
        if (req.query.nom) {
            conditions.push('Nom LIKE ?');
            params.push(`%${req.query.nom}%`);
        }

        const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const total = (await dbGet(`SELECT COUNT(*) as total FROM pointsdinteret ${whereSql}`, params)).total;
        const donnees = await dbAll(
            `SELECT * FROM pointsdinteret ${whereSql} ORDER BY ID LIMIT ? OFFSET ?`,
            [...params, limite, offset]
        );

        res.json({ donnees, total, page, limite });
    } catch (err) {
        res.status(500).json({ erreur: "Erreur lors de la récupération des points d'intérêt." });
    }
});

// ---------------------------------------------------------------------------
// T2.5 : POST/PUT/DELETE /pointsdinteret - protégées par jeton (voir requireAuth)
// ---------------------------------------------------------------------------
app.post('/gti525/v1/pointsdinteret', requireAuth, async (req, res) => {
    const { Arrondissement, Nom, Type, Intersection, Latitude, Longitude } = req.body;
    if (!Nom || !Arrondissement) {
        return res.status(400).json({ erreur: "Les champs 'Nom' et 'Arrondissement' sont obligatoires." });
    }
    try {
        const resultat = await dbRun(
            `INSERT INTO pointsdinteret (Arrondissement, Nom, Type, Intersection, Latitude, Longitude)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [Arrondissement, Nom, Type || null, Intersection || null, Latitude || null, Longitude || null]
        );
        const nouveauPoi = await dbGet('SELECT * FROM pointsdinteret WHERE ID = ?', [resultat.lastID]);
        res.status(201).json(nouveauPoi);
    } catch (err) {
        res.status(500).json({ erreur: "Erreur lors de la création du point d'intérêt." });
    }
});

app.put('/gti525/v1/pointsdinteret/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant doit être un entier." });
    }
    const { Arrondissement, Nom, Type, Intersection, Latitude, Longitude } = req.body;
    try {
        const resultat = await dbRun(
            `UPDATE pointsdinteret
             SET Arrondissement = ?, Nom = ?, Type = ?, Intersection = ?, Latitude = ?, Longitude = ?
             WHERE ID = ?`,
            [Arrondissement, Nom, Type, Intersection, Latitude, Longitude, id]
        );
        if (resultat.changes === 0) {
            return res.status(404).json({ erreur: "Point d'intérêt introuvable." });
        }
        const poiModifie = await dbGet('SELECT * FROM pointsdinteret WHERE ID = ?', [id]);
        res.json(poiModifie);
    } catch (err) {
        res.status(500).json({ erreur: "Erreur lors de la modification du point d'intérêt." });
    }
});

app.delete('/gti525/v1/pointsdinteret/:id', requireAuth, async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant doit être un entier." });
    }
    try {
        const resultat = await dbRun('DELETE FROM pointsdinteret WHERE ID = ?', [id]);
        if (resultat.changes === 0) {
            return res.status(404).json({ erreur: "Point d'intérêt introuvable." });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erreur: "Erreur lors de la suppression du point d'intérêt." });
    }
});

// ---------------------------------------------------------------------------
// T3.1 / T3.2 : GET /pistes - GeoJSON depuis la base, avec logique "pistes populaires"
// ---------------------------------------------------------------------------
app.get('/gti525/v1/pistes', async (req, res) => {
    try {
        const { arrondissement, categorie, populaireDebut, populaireFin } = req.query;

        const conditions = [];
        const params = [];

        // T3.2 : si une période est fournie, on calcule les 3 arrondissements avec
        // le meilleur ratio (somme des passages / nombre de compteurs) sur cette
        // période, puis on ne garde que les pistes de ces arrondissements.
        // NOTE (documentée comme demandé par l'énoncé) : l'arrondissement de chaque
        // piste a été précalculé une seule fois à l'import (voir import_sqlite.py,
        // via un test "point dans un polygone" sur le premier point du tracé),
        // plutôt que d'exécuter une vraie requête géospatiale à chaque appel.
        if (populaireDebut && populaireFin) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(populaireDebut) || !dateRegex.test(populaireFin)) {
                return res.status(400).json({ erreur: "'populaireDebut' et 'populaireFin' doivent être au format YYYY-MM-DD." });
            }

            const ratiosParArrondissement = await dbAll(`
                SELECT c.Arrondissement as arrondissement,
                       SUM(cv.nb_passages) as total_passages,
                       COUNT(DISTINCT c.ID) as nb_compteurs
                FROM compteurs c
                JOIN comptage_velo cv ON cv.id_compteur = c.ID
                WHERE substr(cv.date_heure, 1, 10) BETWEEN ? AND ?
                AND c.Arrondissement IS NOT NULL
                GROUP BY c.Arrondissement
            `, [populaireDebut, populaireFin]);

            const top3 = ratiosParArrondissement
                .map(r => ({ arrondissement: r.arrondissement, ratio: r.total_passages / r.nb_compteurs }))
                .sort((a, b) => b.ratio - a.ratio)
                .slice(0, 3)
                .map(r => r.arrondissement);

            if (top3.length === 0) {
                return res.json({ type: "FeatureCollection", features: [] });
            }

            conditions.push(`arrondissement IN (${top3.map(() => '?').join(',')})`);
            params.push(...top3);
        } else if (arrondissement) {
            conditions.push('arrondissement = ?');
            params.push(arrondissement);
        }

        if (categorie) {
            conditions.push('categorie = ?');
            params.push(categorie);
        }

        const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const pistes = await dbAll(`SELECT * FROM pistes ${whereSql}`, params);

        // Reconstruction de la FeatureCollection GeoJSON à partir des lignes de la base
        const features = pistes.map(p => ({
            type: "Feature",
            properties: {
                id_cycl: p.id_cycl,
                longueur: p.longueur,
                categorie: p.categorie,
                saisons4: p.saisons4,
                route_verte: p.route_verte,
                arrondissement: p.arrondissement
            },
            geometry: {
                type: p.geom_type,
                coordinates: JSON.parse(p.geometry)
            }
        }));

        res.json({ type: "FeatureCollection", features });
    } catch (err) {
        console.error(err);
        res.status(500).json({ erreur: "Erreur lors de la récupération des pistes cyclables." });
    }
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