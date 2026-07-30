import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { dbGet, dbRun } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * @route   POST /gti525/v1/auth/inscription
 * @desc    Crée un compte utilisateur (hachage bcrypt 12 rounds)
 * @access  Public
 */
// ---------------------------------------------------------------------------
// T4.1 / T4.2 : Inscription - hachage du mot de passe avec bcrypt (12 rounds)
// ---------------------------------------------------------------------------
export const inscription = async (req, res) => {
    const { courriel, mot_de_passe } = req.body;

    if (!courriel || !mot_de_passe) {
        return res.status(400).json({ erreur: "Les champs 'courriel' et 'mot_de_passe' sont obligatoires.", status: 400 });
    }
    if (mot_de_passe.length < 8) {
        return res.status(400).json({ erreur: "Le mot de passe doit contenir au moins 8 caractères.", status: 400 });
    }
    if (!/[A-Z]/.test(mot_de_passe)) {
        return res.status(400).json({ erreur: "Le mot de passe doit contenir au moins une majuscule.", status: 400 });
    }
    if (!/[0-9]/.test(mot_de_passe)) {
        return res.status(400).json({ erreur: "Le mot de passe doit contenir au moins un chiffre.", status: 400 });
    }
    if (!/[^A-Za-z0-9]/.test(mot_de_passe)) {
        return res.status(400).json({ erreur: "Le mot de passe doit contenir au moins un caractère spécial.", status: 400 });
    }

    try {
        // T4.2 : 12 rounds de bcrypt (au-dessus du minimum de 10 exigé) - jamais de mot de passe en clair stocké
        const hache = await bcrypt.hash(mot_de_passe, 12);

        const resultat = await dbRun(
            'INSERT INTO utilisateurs (courriel, mot_de_passe_hache) VALUES (?, ?)',
            [courriel, hache]
        );

        // On ne renvoie jamais le hash du mot de passe dans la réponse HTTP
        res.status(201).json({ id: resultat.lastID, courriel });
    } catch (err) {
        // Code SQLite pour violation de contrainte UNIQUE (courriel déjà utilisé)
        if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ erreur: "Ce courriel est déjà associé à un compte.", status: 409 });
        }
        res.status(500).json({ erreur: "Erreur interne du serveur lors de l'inscription.", status: 500 });
    }
};

/**
 * @route   POST /gti525/v1/auth/connexion
 * @desc    Authentifie un utilisateur et retourne un jeton JWT
 * @access  Public
 */
// ---------------------------------------------------------------------------
// T4.1 : Connexion - émission d'un jeton JWT avec durée de vie limitée
// ---------------------------------------------------------------------------
export const connexion = async (req, res) => {
    const { courriel, mot_de_passe } = req.body;

    if (!courriel || !mot_de_passe) {
        return res.status(400).json({ erreur: "Les champs 'courriel' et 'mot_de_passe' sont obligatoires.", status: 400 });
    }

    const erreurGenerique = { erreur: "Courriel ou mot de passe invalide.", status: 401 };

    try {
        const utilisateur = await dbGet('SELECT * FROM utilisateurs WHERE courriel = ?', [courriel]);
        if (!utilisateur) {
            return res.status(401).json(erreurGenerique);
        }

        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe_hache);
        if (!motDePasseValide) {
            return res.status(401).json(erreurGenerique);
        }

        // Émission du jeton JWT, signé avec le secret côté serveur, expirant après JWT_EXPIRATION
        const jeton = jwt.sign(
            { id: utilisateur.id, courriel: utilisateur.courriel },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        res.json({ jeton, expireDans: JWT_EXPIRATION, utilisateur: { id: utilisateur.id, courriel: utilisateur.courriel } });
    } catch (err) {
        res.status(500).json({ erreur: "Erreur interne du serveur lors de la connexion.", status: 500 });
    }
};
