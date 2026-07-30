import express from 'express';
import authRoutes from './authRoutes.js';
import compteursRoutes from './compteursRoutes.js';
import poiRoutes from './poiRoutes.js';
import pistesRoutes from './pistesRoutes.js';
import assistantRoutes from './assistantRoutes.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// T1.1 : Auto-documentation de l'API à la racine
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
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
            { methode: "GET", route: "/gti525/v1/pistes", description: "Réseau cyclable en GeoJSON (filtres: arrondissement, categorie, populaireDebut, populaireFin)." },
            { methode: "POST", route: "/gti525/v1/auth/inscription", description: "Crée un compte utilisateur (courriel + mot de passe)." },
            { methode: "POST", route: "/gti525/v1/auth/connexion", description: "Authentifie un utilisateur et retourne un jeton JWT (valide 24h)." }
        ]
    });
});

router.use('/auth', authRoutes);
router.use('/compteurs', compteursRoutes);
router.use('/pointsdinteret', poiRoutes);
router.use('/pistes', pistesRoutes);
router.use('/assistant', assistantRoutes);

export default router;
