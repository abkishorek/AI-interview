# InterviewForge AI — Adaptive Interview Preparation Platform

> **A personalized AI interview preparation platform for engineering candidates that acts as an adaptive virtual interviewer, coding practice environment, and personal interview coach.**

Built using the **MEAN Stack** (MongoDB, Express.js, Angular, Node.js) with Google Gemini API, OpenAI API, Judge0 code compilation, and Monaco Editor.

---

## Visual Design Philosophy: Technical Editorial / Interview Lab

InterviewForge AI intentionally departs from generic AI SaaS patterns (no neon gradients, no glassmorphism, no purple glowing cards, no pill buttons). 

Instead, it employs a **"Technical Editorial / Interview Lab"** aesthetic:
* **Color System**:
  * Primary Background: Warm off-white / paper (`#F5F3EE`)
  * Secondary Surfaces: Soft ivory (`#FBFAF7`)
  * Primary Text: Near-black (`#171717`)
  * Muted Metadata: Graphite (`#66635D`)
  * Primary Accent: Deep Forest Green (`#164A3A`)
  * Secondary Accent: Burnt Orange (`#C65D32`)
  * Positive State: Muted Green (`#3D7658`)
  * Warning State: Ochre (`#B88932`)
  * Error State: Brick Red (`#A84436`)
* **Typography**:
  * Editorial Headers & Body: **IBM Plex Sans**
  * Technical Metadata, Labels, Code, and Scores: **IBM Plex Mono**
* **Structure**: Thin 1px solid borders, square or subtle `4px-6px` corners, compact data tables, minimal flat indicators, and high whitespace density.

---

## Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │             Angular Workstation (Frontend)             │
       │   - IBM Plex Editorial Design System                   │
       │   - Monaco Editor IDE                                  │
       │   - Chart.js Progression Visualization                 │
       │   - Reactive Forms & Functional Route Guards           │
       └───────────────────────────┬────────────────────────────┘
                                   │ HTTP / JWT
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │             Node.js / Express API (Backend)            │
       │   - Authentication & Candidate Profile Management      │
       │   - Adaptive Interview State Machine                   │
       │   - AI Heuristic Engine & Multi-Provider Gateway       │
       │   - Judge0 Execution Service + Local Runner Fallback   │
       └──────────────┬────────────────────────────┬────────────┘
                      │                            │
                      ▼                            ▼
┌───────────────────────────────┐        ┌───────────────────────────────┐
│     AI Provider Gateway       │        │    Code Execution Engine      │
│  - Google Gemini API          │        │  - Judge0 API                 │
│  - OpenAI API                 │        │  - Local Isolated Runner      │
│  - Contextual Fallback Engine │        │    (Python 3 & Node.js)       │
└───────────────────────────────┘        └───────────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────────────────────┐
│                 MongoDB Data Persistence                      │
│  - Supports MongoDB Atlas & Local MongoDB                     │
│  - Automated Embedded Memory Server Fallback                  │
│  - Users, Interviews, Questions, Answers, Coding Submissions  │
└───────────────────────────────────────────────────────────────┘
```

---

## Core Capabilities

### 1. Adaptive Virtual Interviewer
* Dynamically adjusts difficulty based on candidate performance:
  * **Strong answer ($\ge 80\%$)**: Advances difficulty from `MEDIUM` $\to$ `HARD`, prompting deeper architectural tradeoffs.
  * **Identified gap ($< 60\%$)**: Adjusts to `EASY` or pivots to foundational principles to reinforce core concepts.
  * **Repeated struggle**: Marks topic as weak, logs adaptive trajectory, and feeds the personalized recommendation engine.
* Multi-dimensional scoring: **Technical Accuracy**, **Relevance**, **Completeness**, **Clarity**, **Strengths**, **Areas to Improve**, and **Model Reference Answers**.

### 2. Professional Coding Lab
* Two-pane IDE workstation with **Monaco Editor** integration.
* Multi-language support: **Python**, **JavaScript**, **Java**, **C++**, **C**, and **C#**.
* Real-time execution against sample and hidden test cases via **Judge0**.
* **AI Code Review**: Correctness, Code Quality, Efficiency, Time Complexity ($O(n)$ vs $O(n^2)$), Space Complexity, Observations, and Actionable Optimizations.

### 3. Editorial Dashboard & Readiness Score
* Central Interview Readiness score (e.g., `82 / 100`, `+7 from previous month`).
* Categorical scores for **Technical Depth**, **Coding & Algorithms**, and **Behavioral Rigor**.
* Dynamic **Areas to Work On** diagnosis and **Next Best Practice Directive**.

### 4. Longitudinal Performance Analytics
* Thin-line telemetry charts powered by **Chart.js**.
* Topic proficiency matrix across Database Normalization, Computer Networks, Async JavaScript, and System Design.
* Coding telemetry (attempted vs solved, difficulty distribution, average runtime).

### 5. Assessment Archive & Dossier Inspection
* Compact editorial ledger of all past interviews.
* In-depth modal inspection reviewing every question, candidate transcript, and AI feedback breakdown.

---

## Quickstart & Installation

### Prerequisites
* Node.js $\ge 18$
* npm $\ge 9$
* (Optional) MongoDB Atlas URI, Google Gemini API Key, OpenAI API Key, Judge0 API Key.
  > *Note: If no API keys or local MongoDB daemon are configured, the platform automatically utilizes its embedded database engine and intelligent heuristic evaluation system so that every feature works out of the box!*

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `server/.env`:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=supersecret_interviewforge_jwt_key_2026_dev_secure

AI_PROVIDER=gemini
GEMINI_API_KEY=
OPENAI_API_KEY=

JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=
```

### 3. Run the Platform

From the project root:

```bash
# Starts unified platform on Port 5000 (serves API + Angular workstation)
npm start
```

Or run frontend and backend independently:

```bash
# Terminal 1: Backend API (Port 5000)
npm run server

# Terminal 2: Angular Dev Server (Port 4200)
npm run client
```

Navigate your browser to:
* **Unified Application**: `http://localhost:5000`
* **Angular Dev Workstation**: `http://localhost:4200`

---

## Pre-loaded Demo Account

The database automatically seeds on first launch with sample questions, coding problems, and a complete candidate profile:

* **Email**: `demo@interviewforge.ai`
* **Password**: `password123`
* *(A "FILL DEMO CREDENTIALS" shortcut button is provided directly on the Login page).*

---

## API Reference

### Authentication
* `POST /api/auth/register` — Register new candidate
* `POST /api/auth/login` — Authenticate and obtain JWT
* `GET  /api/auth/me` — Retrieve active candidate profile

### Profile
* `GET  /api/users/profile` — View technical calibration profile
* `PUT  /api/users/profile` — Update target role, experience, languages

### Mock Interviews
* `POST /api/interviews/start` — Initiate adaptive interview session
* `POST /api/interviews/:id/answer` — Submit answer and receive AI evaluation
* `POST /api/interviews/:id/next-question` — Fetch dynamically adjusted question
* `POST /api/interviews/:id/complete` — Finalize session and compute dossier
* `GET  /api/interviews/history` — List past interview sessions
* `GET  /api/interviews/:id` — Inspect full interview dossier & answers

### Coding Practice
* `GET  /api/coding/problems` — List coding challenges
* `GET  /api/coding/problems/:id` — Fetch challenge details and starter code
* `POST /api/coding/run` — Run code against sample test cases (Judge0)
* `POST /api/coding/submit` — Submit code against all tests + AI code review
* `GET  /api/coding/submissions` — Retrieve candidate submission history

### Telemetry & Analytics
* `GET  /api/analytics/dashboard` — Central readiness score and metrics
* `GET  /api/analytics/performance` — Longitudinal progression data
* `GET  /api/analytics/topics` — Weak and strong topic diagnostic analysis

---

## License
MIT License. Built for engineering interview excellence.
