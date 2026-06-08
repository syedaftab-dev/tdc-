import { Router } from 'express';
import { getClientsList, getClientDetails, addNote, pitchMatch } from '../controllers/clientController.js';

const router = Router();

router.get('/', getClientsList);
router.get('/:id', getClientDetails);
router.post('/:id/notes', addNote);
router.post('/:id/matches', pitchMatch);

export default router;
