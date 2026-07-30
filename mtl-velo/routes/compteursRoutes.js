import express from 'express';
import { getAllCompteurs, getCompteurById, getPassagesByCompteurId } from '../controllers/compteursController.js';

const router = express.Router();

router.get('/', getAllCompteurs);
router.get('/:id', getCompteurById);
router.get('/:id/passages', getPassagesByCompteurId);

export default router;
