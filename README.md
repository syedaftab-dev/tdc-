# The Date Crew (TDC) - Matchmaker Dashboard & Algorithm MVP

A decoupled, premium monorepo application designed for TDC matchmakers to manage client lists, run deterministic matchmaking scores, and generate AI compatibility reviews and pitch drafts.

---

## 🏛️ Monorepo Architecture

This project is built using a fully decoupled **Frontend & Backend** architecture:

```
┌──────────────────────────────────────────────────────────────────┐
│                      CLIENTS (React - Port 5173)                 │
│                                                                  │
│  ┌──────────────────┐  ┌───────────────────┐  ┌────────────────┐ │
│  │ Dashboard Page   │  │ Biodata Details   │  │ Settings Modal │ │
│  │ • Client List    │  │ • Match Pool Grid │  │ • User API Key │ │
│  └────────┬─────────┘  └─────────┬─────────┘  └────────┬───────┘ │
└───────────┼──────────────────────┼─────────────────────┼─────────┘
            │ GET /clients         │ POST /matches       │ x-openai-api-key
            ▼                      ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                 EXPRESS API SERVER (Port 3001)                   │
│                                                                  │
│  ┌──────────────────┐  ┌───────────────────┐  ┌────────────────┐ │
│  │ Auth Routes      │  │ Client/Pool Routes│  │ AI Routes      │ │
│  │ POST /auth/login │  │ GET /pool         │  │ POST /compat   │ │
│  │                  │  │ POST /notes       │  │ POST /pitch    │ │
│  └────────┬─────────┘  └─────────┬─────────┘  └────────┬───────┘ │
└───────────┼──────────────────────┼─────────────────────┼─────────┘
            │                      │                     │
            ▼                      ▼                     ▼
┌───────────────────────┐  ┌───────────────────────────────────────┐
│  Authentication       │  │       Data Access Layer (db.ts)       │
│  • karan / sima       │  └──────────────────┬────────────────────┘
│  • Role check         │                     │
└───────────────────────┘                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                     AI Service Layer (server-side)               │
│                                                                  │
│  ┌─────────────────────────────────┐  ┌───────────────────────┐  │
│  │ GPT-4o-mini (Online API)        │  │ Natural Lang. Engine  │  │
│  │ • Customized Matrimonial Prompts│  │ (Offline Fallback)    │  │
│  └────────────────┬────────────────┘  └───────────┬───────────┘  │
└───────────────────┼───────────────────────────────┼──────────────┘
                    │                               │
                    ▼                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                database.json File Persistence (disk)             │
│   • Seeded Clients  • Profile Pools  • Call Notes  • Pitch Hist  │
└──────────────────────────────────────────────────────────────────┘
```

*   **/frontend**: A high-performance SPA built with **React**, **Vite**, **TypeScript**, and styled with a custom dark-mode design system. It handles presentation, user interaction, client-side routing, and confetti animations.
*   **/backend**: A **Node.js + Express** server running on port `3001` in TypeScript. It handles API requests, processes the matchmaking logic, interacts with the OpenAI API, and maintains data persistence by saving matches and notes to a local `database.json` file.

This separation keeps the client lightweight and guarantees that sensitive items—such as private client data and OpenAI API keys—remain hidden from the client browser.

---

## 🧮 Compatibility Matching Engine

The matching engine (`backend/src/services/matchEngine.ts`) implements gender-specific rules along with cultural matrimonial parameters:

1.  **Male Clients**:
    *   **Age**: Evaluates if the candidate is younger (ideal range: 1–5 years younger).
    *   **Height**: Verifies if the candidate matches traditional preferences (shorter).
    *   **Income**: Matches traditional filters (candidate earns less).
    *   **Children**: Strict validation on views about having kids.
2.  **Female Clients**:
    *   **Profession & Education**: Special professional alignment logic. E.g., if the client is a Doctor/MBBS, it flags a warning if the candidate is not in the medical field; for corporate professionals, it checks for corporate rank synergy.
    *   **Income**: Verifies financial stability (candidate earns equal or more).
    *   **Family Values**: Checks alignment on traditional vs. liberal family expectations.
    *   **Location**: Validates city compatibility based on the client's willingness to relocate.
3.  **Matrimonial Elements**:
    *   **Religion & Caste**: Matches faiths (+15%) and checks caste alignment (especially for traditional families).
    *   **Dietary Warning**: Flags alerts if there is a vegetarian/non-vegetarian conflict, with strict warnings for Jain diet preferences.
    *   **Horoscope Guna Milan**: A deterministic astrology calculator based on the client and candidate's *Nakshatra* and *Rashi*, generating traditional compatibility points out of 36 (requires >18 points for approval). It also performs manglik dosha checks.

---

## 🤖 AI Matchmaker Assistant

The backend features a dual-mode AI service (`backend/src/services/aiService.ts`) for generating personalized compatibility summaries and email pitches:

*   **Online Mode (Groq AI or OpenAI)**: If either `GROQ_API_KEY` or `OPENAI_API_KEY` is provided (in the backend `.env` or dynamically passed via the dashboard Settings modal), the system automatically targets the appropriate provider:
    *   **Groq AI**: Uses the state-of-the-art `llama-3.3-70b-versatile` model for ultra-fast, premium inference.
    *   **OpenAI**: Uses `gpt-4o-mini`.
*   **Offline Mode (Local Fallback)**: If no API key is set, the server falls back to an offline natural language generator that returns realistic, dynamic templates based on the computed compatibility score, client profiles, and red flags.

---

## 🚀 Running the App Locally

### 1. Start the Backend Server
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your API key (optional, for real AI generation):
   Create a `.env` file inside `backend/`:
   ```env
   PORT=3001
   GROQ_API_KEY=your_groq_api_key_here
   # OR
   OPENAI_API_KEY=your_openai_api_key_here
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will boot up on `http://localhost:3001` and initialize `database.json` with seeded data.*

### 2. Start the Frontend
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser to view the portal.*

---

## 🔑 Demo Credentials
Log in using either matchmaker account:
*   **Karan Johar**: username: `karan` (password: `tdcpassword` or any)
*   **Sima Taparia**: username: `sima` (password: `taparia` or any)
