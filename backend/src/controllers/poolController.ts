import { Request, Response } from 'express';
import { getClients, getPool } from '../data/db.js';

export const getMatchPool = (req: Request, res: Response): void => {
  const { clientId } = req.query;
  const pool = getPool();

  if (clientId) {
    const clients = getClients();
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      res.status(404).json({ error: 'Client not found.' });
      return;
    }
    // Filter by opposite gender
    const oppositeGenderPool = pool.filter(p => p.gender !== client.gender);
    res.json(oppositeGenderPool);
  } else {
    res.json(pool);
  }
};
