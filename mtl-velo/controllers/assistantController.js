import { dbAll } from '../config/db.js';
import { askVelobot, logSignalement } from '../services/velobotService.js';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5;

/**
 * @route   POST /gti525/v1/assistant
 * @desc    Appelle l'assistant IA Vélobot
 * @access  Public (Limité par IP)
 */
// ---------------------------------------------------------------------------
// T6 : Fonctionnalité conversationnelle (Vélobot)
// ---------------------------------------------------------------------------
export const askAssistant = async (req, res) => {
    const ip = req.ip;
    const now = Date.now();
    
    // Rate Limiting (T6.5)
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    const requests = rateLimitMap.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW_MS);
    if (requests.length >= MAX_REQUESTS) {
        return res.status(429).json({ erreur: "Trop de requêtes. Veuillez patienter 1 minute.", status: 429 });
    }
    requests.push(now);
    rateLimitMap.set(ip, requests);

    const { question } = req.body;
    if (!question || typeof question !== 'string') {
        return res.status(400).json({ erreur: "La question est requise.", status: 400 });
    }
    if (question.length > 1000) { // T6.1 & T6.5 : Limite de longueur
        return res.status(400).json({ erreur: "La question dépasse la limite de 1000 caractères.", status: 400 });
    }

    try {
        // Appel au service IA
        const reponse = await askVelobot(question, dbAll, ip);
        res.json({ reponse });
    } catch(err) {
        res.status(500).json({ erreur: "Erreur lors de la génération de la réponse.", status: 500 });
    }
};

/**
 * @route   POST /gti525/v1/assistant/signalement
 * @desc    Signale une erreur du Vélobot
 * @access  Public
 */
export const reportAssistant = (req, res) => {
    const { question, reponse } = req.body;
    if (question && reponse) {
        logSignalement(question, reponse);
    }
    res.status(200).send();
};
