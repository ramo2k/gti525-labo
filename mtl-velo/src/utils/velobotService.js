import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';

const logFilePath = path.join(process.cwd(), 'logs', 'velobot.log');

export function logSignalement(question, reponse) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] SIGNALEMENT ERREUR - Q: "${question}" | R: "${reponse}"\n`;
    fs.appendFileSync(logFilePath, logMsg);
}

export async function askVelobot(question, dbAll, reqIp) {
    const startTime = Date.now();
    let errorStatus = 'Success';
    let finalAnswer = '';

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const systemInstruction = `Tu es le Vélobot, un assistant expert sur le réseau cyclable de Montréal.
Règles strictes :
1. Tu ne dois JAMAIS inventer de chiffres (aucune hallucination).
2. Si la donnée n'est pas disponible, tu dois le dire explicitement (ex: "Je n'ai pas de données pour cette requête.").
3. Utilise toujours les outils à ta disposition pour trouver les données avant de répondre.
4. Réponds toujours en français de manière polie et concise.`;

        const getPassagesStatsDeclaration = {
            name: 'get_passages_stats',
            description: "Obtenir la somme totale des passages de vélos sur tous les compteurs pour une période donnée.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    debut: { type: Type.STRING, description: "Date de début (YYYY-MM-DD)" },
                    fin: { type: Type.STRING, description: "Date de fin (YYYY-MM-DD)" }
                },
                required: ['debut', 'fin']
            }
        };

        const getPistesArrondissementDeclaration = {
            name: 'get_pistes_arrondissement',
            description: "Obtenir des informations sur les pistes cyclables (catégorie, longueur totale, nombre) dans un arrondissement spécifique.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    arrondissement: { type: Type.STRING, description: "Le nom de l'arrondissement (ex: Le Plateau-Mont-Royal)" }
                },
                required: ['arrondissement']
            }
        };

        const comparerArrondissementsDeclaration = {
            name: 'comparer_passages_arrondissements',
            description: "Comparer la somme des passages de vélos entre deux arrondissements sur une période donnée.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    arrondissement1: { type: Type.STRING, description: "Le nom du premier arrondissement" },
                    arrondissement2: { type: Type.STRING, description: "Le nom du deuxième arrondissement" },
                    debut: { type: Type.STRING, description: "Date de début (YYYY-MM-DD)" },
                    fin: { type: Type.STRING, description: "Date de fin (YYYY-MM-DD)" }
                },
                required: ['arrondissement1', 'arrondissement2', 'debut', 'fin']
            }
        };

        let contents = [
            { role: 'user', parts: [{ text: question }] }
        ];

        let response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [
                    getPassagesStatsDeclaration, 
                    getPistesArrondissementDeclaration, 
                    comparerArrondissementsDeclaration
                ]}]
            }
        });

        // Si le LLM décide d'appeler un outil
        if (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const args = call.args;
            let resultData;

            if (call.name === 'get_passages_stats') {
                const sql = `SELECT SUM(nb_passages) as total FROM comptage_velo WHERE substr(date_heure, 1, 10) BETWEEN ? AND ?`;
                resultData = await dbAll(sql, [args.debut, args.fin]);
            } else if (call.name === 'get_pistes_arrondissement') {
                const sql = `SELECT categorie, SUM(longueur) as longueur_totale, COUNT(*) as nombre FROM pistes WHERE arrondissement = ? GROUP BY categorie`;
                resultData = await dbAll(sql, [args.arrondissement]);
            } else if (call.name === 'comparer_passages_arrondissements') {
                const sql = `
                    SELECT c.Arrondissement as arrondissement, SUM(cv.nb_passages) as total 
                    FROM compteurs c 
                    JOIN comptage_velo cv ON c.ID = cv.id_compteur 
                    WHERE c.Arrondissement IN (?, ?) 
                    AND substr(cv.date_heure, 1, 10) BETWEEN ? AND ? 
                    GROUP BY c.Arrondissement
                `;
                resultData = await dbAll(sql, [args.arrondissement1, args.arrondissement2, args.debut, args.fin]);
            }

            // Méthode 100% robuste : On refait un prompt simple avec les données pour la réponse finale
            const finalPrompt = `L'utilisateur a posé la question suivante : "${question}".
            
J'ai interrogé la base de données avec l'outil et voici les résultats bruts en JSON :
${JSON.stringify(resultData)}

Formule une réponse finale naturelle, claire et concise en français pour l'utilisateur en te basant UNIQUEMENT sur ces résultats JSON. N'invente aucune donnée. Si le JSON est vide, dis qu'il n'y a pas de données. 
IMPORTANT: Fournis ta réponse en texte BRUT (pure text) uniquement. N'utilise AUCUN formatage Markdown, ni gras (**), ni italique, ni puces.`;

            response = await ai.models.generateContent({
                model: 'gemini-3.5-flash-lite',
                contents: finalPrompt,
                config: {
                    systemInstruction: systemInstruction
                    // On ne remet pas les outils ici pour forcer une réponse texte
                }
            });
        }

        finalAnswer = response.text || "Je n'ai pas pu formuler de réponse.";

    } catch (error) {
        console.error("Erreur Vélobot:", error);
        errorStatus = `Error: ${error.message}`;
        finalAnswer = "Désolé, une erreur technique m'empêche de répondre pour le moment.";
    }

    // T6.4 : Journalisation des appels
    const durationMs = Date.now() - startTime;
    const logMsg = `[${new Date().toISOString()}] IP:${reqIp} | Q_Len:${question.length} | Time:${durationMs}ms | Status:${errorStatus}\n`;
    fs.appendFileSync(logFilePath, logMsg);

    return finalAnswer;
}
