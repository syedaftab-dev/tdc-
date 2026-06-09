import { Request, Response } from 'express';
import { fetchAICompatibility, fetchAIPitchEmail } from '../services/aiService.js';

export const getAICompatibility = async (req: Request, res: Response): Promise<void> => {
  const { client, candidate, matchResult } = req.body;
  if (!client || !candidate || !matchResult) {
    res.status(400).json({ error: 'Missing required parameters.' });
    return;
  }

  const userApiKey = req.headers['x-openai-api-key'] as string | undefined;

  try {
    const result = await fetchAICompatibility(client, candidate, matchResult, userApiKey);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch AI Compatibility.' });
  }
};

export const getAIPitchEmail = async (req: Request, res: Response): Promise<void> => {
  const { client, candidate, matchResult } = req.body;
  if (!client || !candidate || !matchResult) {
    res.status(400).json({ error: 'Missing required parameters.' });
    return;
  }

  const userApiKey = req.headers['x-openai-api-key'] as string | undefined;

  try {
    const result = await fetchAIPitchEmail(client, candidate, matchResult, userApiKey);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch AI Pitch Email.' });
  }
};
