import { dbGet, dbAll, dbRun } from '../config/db.js';

/**
 * @route   GET /gti525/v1/pointsdinteret
 * @desc    Liste paginée des points d'intérêt
 * @access  Public
 */
// ---------------------------------------------------------------------------
// T2.4 : GET /pointsdinteret - liste paginée, filtres délégués à la base
// ---------------------------------------------------------------------------
export const getAllPoi = async (req, res) => {
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
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la récupération des points d'intérêt.", status: 500 });
    }
};

/**
 * @route   POST /gti525/v1/pointsdinteret
 * @desc    Créer un point d'intérêt
 * @access  Private (Jeton requis)
 */
// ---------------------------------------------------------------------------
// T2.5 : POST/PUT/DELETE /pointsdinteret - protégées par jeton (voir requireAuth)
// ---------------------------------------------------------------------------
export const createPoi = async (req, res) => {
    const { Arrondissement, Nom, Type, Intersection, Latitude, Longitude } = req.body;
    if (!Nom || !Arrondissement) {
        return res.status(400).json({ erreur: "Les champs 'Nom' et 'Arrondissement' sont obligatoires.", status: 400 });
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
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la création du point d'intérêt.", status: 500 });
    }
};

/**
 * @route   PUT /gti525/v1/pointsdinteret/:id
 * @desc    Mettre à jour un point d'intérêt
 * @access  Private (Jeton requis)
 */
export const updatePoi = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant doit être un entier.", status: 400 });
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
            return res.status(404).json({ erreur: "Point d'intérêt introuvable.", status: 404 });
        }
        const poiModifie = await dbGet('SELECT * FROM pointsdinteret WHERE ID = ?', [id]);
        res.json(poiModifie);
    } catch (err) {
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la modification du point d'intérêt.", status: 500 });
    }
};

/**
 * @route   DELETE /gti525/v1/pointsdinteret/:id
 * @desc    Supprimer un point d'intérêt
 * @access  Private (Jeton requis)
 */
export const deletePoi = async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ erreur: "L'identifiant doit être un entier.", status: 400 });
    }
    try {
        const resultat = await dbRun('DELETE FROM pointsdinteret WHERE ID = ?', [id]);
        if (resultat.changes === 0) {
            return res.status(404).json({ erreur: "Point d'intérêt introuvable.", status: 404 });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la suppression du point d'intérêt.", status: 500 });
    }
};
