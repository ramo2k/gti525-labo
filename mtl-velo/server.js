import 'dotenv/config';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import apiRoutes from './routes/apiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vérification de la variable d'environnement critique
if (!process.env.JWT_SECRET) {
    console.error("ERREUR : la variable d'environnement JWT_SECRET est manquante (voir .env.example).");
    process.exit(1);
}

const app = express();
const port = 8080;

app.use(express.json());

// T4.1 : Servir la frontale (fichiers statiques React générés dans /dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Routage centralisé de l'API (Architecture MVC)
app.use('/gti525/v1', apiRoutes);

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