import jwt from 'jsonwebtoken';
import { dbGet } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// ---------------------------------------------------------------------------
// T4.3 : middleware de protection par jeton pour les routes d'écriture.
// Validation stricte du JWT et vérification de l'existence de l'utilisateur.
// ---------------------------------------------------------------------------
export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erreur: "Jeton d'authentification manquant.", status: 401 });
    }

    const token = authHeader.slice(7); // retire "Bearer "

    try {
        // jwt.verify lève une exception si la signature est invalide OU si le jeton est expiré
        const payload = jwt.verify(token, JWT_SECRET);
        
        // Vérification de sécurité avancée : s'assurer que l'utilisateur existe toujours dans la DB
        const utilisateur = await dbGet('SELECT id, courriel FROM utilisateurs WHERE id = ?', [payload.id]);
        
        if (!utilisateur) {
            return res.status(401).json({ erreur: "L'utilisateur associé à ce jeton n'existe plus.", status: 401 });
        }

        req.utilisateur = utilisateur; // { id, courriel } - accessible dans les routes protégées
        next();
    } catch (err) {
        return res.status(401).json({ erreur: "Jeton invalide ou expiré.", status: 401 });
    }
};
