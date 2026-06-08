import { Request, Response } from 'express';
import { getClients, setClients } from '../data/db.js';
import { Client, ClientNote, MatchHistoryItem } from '../types/index.js';

export const getClientsList = (req: Request, res: Response): void => {
  const { matchmakerName } = req.query;
  const clients = getClients();

  if (matchmakerName) {
    const filtered = clients.filter(c => c.assignedMatchmaker === matchmakerName);
    res.json(filtered);
  } else {
    res.json(clients);
  }
};

export const getClientDetails = (req: Request, res: Response): void => {
  const clients = getClients();
  const client = clients.find(c => c.id === req.params.id);

  if (client) {
    res.json(client);
  } else {
    res.status(404).json({ error: 'Client not found.' });
  }
};

export const addNote = (req: Request, res: Response): void => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === req.params.id);

  if (clientIndex === -1) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }

  const { author, text } = req.body;
  if (!text || !text.trim()) {
    res.status(400).json({ error: 'Note text cannot be empty.' });
    return;
  }

  const newNote: ClientNote = {
    id: `note_${Date.now()}`,
    timestamp: new Date().toISOString(),
    author: author || 'Matchmaker',
    text: text.trim()
  };

  const updatedClients = [...clients];
  updatedClients[clientIndex] = {
    ...updatedClients[clientIndex],
    notes: [newNote, ...updatedClients[clientIndex].notes]
  };

  setClients(updatedClients);
  res.json(updatedClients[clientIndex]);
};

export const pitchMatch = (req: Request, res: Response): void => {
  const clients = getClients();
  const clientIndex = clients.findIndex(c => c.id === req.params.id);

  if (clientIndex === -1) {
    res.status(404).json({ error: 'Client not found.' });
    return;
  }

  const { profileId, emailDraft } = req.body;
  if (!profileId) {
    res.status(400).json({ error: 'Profile ID is required.' });
    return;
  }

  const client = clients[clientIndex];
  
  // Check if candidate already pitched
  const alreadyPitched = client.matchHistory.some(m => m.profileId === profileId);
  if (alreadyPitched) {
    res.status(400).json({ error: 'This candidate is already in the matching history.' });
    return;
  }

  const newHistoryItem: MatchHistoryItem = {
    profileId,
    sentAt: new Date().toISOString(),
    status: 'Sent',
    emailDraft: emailDraft || ''
  };

  const currentStatus = client.status;
  const newStatus = (currentStatus === 'New' || currentStatus === 'Active Search') ? 'Sent Matches' : currentStatus;

  const updatedClients = [...clients];
  updatedClients[clientIndex] = {
    ...updatedClients[clientIndex],
    status: newStatus as Client['status'],
    matchHistory: [newHistoryItem, ...updatedClients[clientIndex].matchHistory]
  };

  setClients(updatedClients);
  res.json(updatedClients[clientIndex]);
};
