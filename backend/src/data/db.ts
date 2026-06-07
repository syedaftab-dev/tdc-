import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Client, Profile } from '../types/index.js';
import { generatePoolProfiles, generateStaticClients } from './profileGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '..', '..', 'database.json');

let clients: Client[] = [];
let pool: Profile[] = [];

export function initDatabase(): void {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      clients = data.clients || [];
      pool = data.pool || [];
      console.log('Database loaded successfully from database.json');
    } else {
      console.log('Initializing database with static mock data...');
      clients = generateStaticClients();
      pool = generatePoolProfiles(130);
      saveDatabase();
      console.log('Database initialized and saved to database.json');
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    clients = generateStaticClients();
    pool = generatePoolProfiles(130);
  }
}

export function saveDatabase(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify({ clients, pool }, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

export function getClients(): Client[] {
  return clients;
}

export function setClients(newClients: Client[]): void {
  clients = newClients;
  saveDatabase();
}

export function getPool(): Profile[] {
  return pool;
}
