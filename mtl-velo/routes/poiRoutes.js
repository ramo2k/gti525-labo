import express from 'express';
import { getAllPoi, createPoi, updatePoi, deletePoi } from '../controllers/poiController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllPoi);
router.post('/', requireAuth, createPoi);
router.put('/:id', requireAuth, updatePoi);
router.delete('/:id', requireAuth, deletePoi);

export default router;
