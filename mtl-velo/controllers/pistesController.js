import { dbAll } from '../config/db.js';
import { isValidDate } from './compteursController.js';

/**
 * @route   GET /gti525/v1/pistes
 * @desc    Réseau cyclable en GeoJSON, avec filtre de pistes populaires
 * @access  Public
 */
// ---------------------------------------------------------------------------
// T3.1 / T3.2 : GET /pistes - GeoJSON depuis la base, avec logique "pistes populaires"
// ---------------------------------------------------------------------------
export const getPistes = async (req, res) => {
    try {
        const { arrondissement, categorie, populaireDebut, populaireFin } = req.query;

        const conditions = [];
        const params = [];

        // T3.2 : pistes populaires
        if (populaireDebut && populaireFin) {
            if (!isValidDate(populaireDebut) || !isValidDate(populaireFin)) {
                return res.status(400).json({ erreur: "'populaireDebut' et 'populaireFin' doivent être au format calendaire valide YYYY-MM-DD.", status: 400 });
            }
            if (populaireDebut > populaireFin) {
                return res.status(400).json({ erreur: "La date de début ne peut pas être postérieure à la date de fin.", status: 400 });
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
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la récupération des pistes cyclables.", status: 500 });
    }
};
