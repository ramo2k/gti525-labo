import { dbGet, dbAll } from '../config/db.js';

// Fonction utilitaire pour valider une date YYYY-MM-DD proprement (calendaire)
export const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    const date = new Date(dateString);
    const timestamp = date.getTime();
    if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
    return dateString === date.toISOString().split('T')[0];
};

/**
 * @route   GET /gti525/v1/compteurs
 * @desc    Liste paginée des compteurs
 * @access  Public
 */
// ---------------------------------------------------------------------------
// T2.1 : GET /compteurs - liste paginée, filtres délégués à la base
// ---------------------------------------------------------------------------
export const getAllCompteurs = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limite = Math.max(1, parseInt(req.query.limite, 10) || 20);
        const offset = (page - 1) * limite;

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
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la récupération des compteurs.", status: 500 });
    }
};

/**
 * @route   GET /gti525/v1/compteurs/:id
 * @desc    Détails d'un compteur (sans les passages)
 * @access  Public
 */
// ---------------------------------------------------------------------------
// T2.2 : GET /compteurs/:id - un seul compteur (sans les passages)
// ---------------------------------------------------------------------------
export const getCompteurById = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant du compteur doit être un entier.", status: 400 });
    }
    try {
        const compteur = await dbGet('SELECT * FROM compteurs WHERE ID = ?', [id]);
        if (!compteur) {
            return res.status(404).json({ erreur: "Compteur introuvable.", status: 404 });
        }
        res.json(compteur);
    } catch (err) {
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la récupération du compteur.", status: 500 });
    }
};

/**
 * @route   GET /gti525/v1/compteurs/:id/passages
 * @desc    Passages agrégés d'un compteur
 * @access  Public
 */
// ---------------------------------------------------------------------------
// T2.3 : GET /compteurs/:id/passages - agrégation par jour / semaine / mois
// ---------------------------------------------------------------------------
export const getPassagesByCompteurId = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { debut, fin } = req.query;
    const intervalle = req.query.intervalle || 'jour';

    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant du compteur doit être un entier.", status: 400 });
    }

    if (!debut || !fin || !isValidDate(debut) || !isValidDate(fin)) {
        return res.status(400).json({ erreur: "Les paramètres 'debut' et 'fin' sont requis au format calendaire valide YYYY-MM-DD.", status: 400 });
    }
    
    if (debut > fin) {
        return res.status(400).json({ erreur: "La date de début ne peut pas être postérieure à la date de fin.", status: 400 });
    }

    const expressionsGroupement = {
        jour: "substr(date_heure, 1, 10)",
        semaine: "strftime('%Y-S%W', date_heure)",
        mois: "strftime('%Y-%m', date_heure)"
    };
    const expressionGroupement = expressionsGroupement[intervalle];
    if (!expressionGroupement) {
        return res.status(400).json({ erreur: "Le paramètre 'intervalle' doit être 'jour', 'semaine' ou 'mois'.", status: 400 });
    }

    try {
        // Vérification d'existence (404)
        const compteurExists = await dbGet('SELECT ID FROM compteurs WHERE ID = ?', [id]);
        if (!compteurExists) {
            return res.status(404).json({ erreur: "Compteur introuvable.", status: 404 });
        }

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
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la requête des passages.", status: 500 });
    }
};
