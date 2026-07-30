import express from 'express';
import { inscription, connexion } from '../controllers/authController.js';

const router = express.Router();

router.post('/inscription', inscription);
router.post('/connexion', connexion);

export default router;
