import { Router } from 'express';
import { getAICompatibility, getAIPitchEmail } from '../controllers/aiController.js';

const router = Router();

router.post('/compatibility', getAICompatibility);
router.post('/pitch', getAIPitchEmail);

export default router;
