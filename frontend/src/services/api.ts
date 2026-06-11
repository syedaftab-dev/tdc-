import { Client, Profile, Matchmaker, MatchScoreResult } from '../types';

let API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api';
if (API_BASE && !API_BASE.endsWith('/api') && !API_BASE.endsWith('/api/')) {
  API_BASE = API_BASE.replace(/\/$/, '') + '/api';
}

export async function loginMatchmaker(username: string, password?: string): Promise<Matchmaker> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: password || 'love123' })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Login failed');
  }
  const data = await res.json();
  return data.matchmaker;
}

export async function fetchClients(matchmakerName?: string): Promise<Client[]> {
  const url = matchmakerName 
    ? `${API_BASE}/clients?matchmakerName=${encodeURIComponent(matchmakerName)}`
    : `${API_BASE}/clients`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function fetchClientDetails(id: string): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients/${id}`);
  if (!res.ok) throw new Error('Failed to fetch client details');
  return res.json();
}

export async function addClientNote(clientId: string, author: string, text: string): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients/${clientId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, text })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to add note');
  }
  return res.json();
}

export async function pitchClientMatch(clientId: string, profileId: string, emailDraft: string): Promise<Client> {
  const res = await fetch(`${API_BASE}/clients/${clientId}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profileId, emailDraft })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to pitch match');
  }
  return res.json();
}

export async function fetchMatchPool(clientId: string): Promise<Profile[]> {
  const res = await fetch(`${API_BASE}/pool?clientId=${clientId}`);
  if (!res.ok) throw new Error('Failed to fetch match pool');
  return res.json();
}

export async function fetchAICompatibilityAssessment(
  client: Client,
  candidate: Profile,
  matchResult: MatchScoreResult
): Promise<{ analysis: string }> {
  const apiKey = localStorage.getItem('TDC_OPENAI_API_KEY') || '';
  const res = await fetch(`${API_BASE}/ai/compatibility`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-openai-api-key': apiKey } : {})
    },
    body: JSON.stringify({ client, candidate, matchResult })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch AI Compatibility');
  }
  return res.json();
}

export async function fetchAIPitchEmailDraft(
  client: Client,
  candidate: Profile,
  matchResult: MatchScoreResult
): Promise<{ pitch: string }> {
  const apiKey = localStorage.getItem('TDC_OPENAI_API_KEY') || '';
  const res = await fetch(`${API_BASE}/ai/pitch`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...(apiKey ? { 'x-openai-api-key': apiKey } : {})
    },
    body: JSON.stringify({ client, candidate, matchResult })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch AI pitch email');
  }
  return res.json();
}
