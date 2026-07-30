import express from 'express';
import { getPistes } from '../controllers/pistesController.js';

const router = express.Router();

router.get('/', getPistes);

export default router;
