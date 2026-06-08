import { Request, Response } from 'express';
import { Matchmaker } from '../types/index.js';

const MATCHMAKERS: Matchmaker[] = [
  { username: 'karan', name: 'Karan Johar', role: 'Senior Matchmaker' },
  { username: 'sima', name: 'Sima Taparia', role: 'Elite Matchmaker' }
];

export const login = (req: Request, res: Response): void => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  const user = MATCHMAKERS.find(m => m.username.toLowerCase() === username.toLowerCase());
  
  if (user) {
    res.json({ success: true, matchmaker: user });
  } else {
    res.status(401).json({ error: 'Invalid username. Try "karan" or "sima".' });
  }
};
