import { Router } from 'express';
import { getMatchPool } from '../controllers/poolController.js';

const router = Router();

router.get('/', getMatchPool);

export default router;
