import express from 'express';
import { askAssistant, reportAssistant } from '../controllers/assistantController.js';

const router = express.Router();

router.post('/', askAssistant);
router.post('/signalement', reportAssistant);

export default router;
