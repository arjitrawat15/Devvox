<h1 align="center">Devvox</h1>

<p align="center">
  <strong>AI-Powered Technical Interviews, Reinvented.</strong>
</p>

<p align="center">
  Real-time voice interviews tailored to your GitHub profile.<br/>
  Instant scoring. Detailed feedback. Full transcripts.
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Voice_AI-Real--time-7c3aed?style=for-the-badge" alt="Voice AI" /></a>
  <a href="#features"><img src="https://img.shields.io/badge/GitHub-Aware-181717?style=for-the-badge&logo=github" alt="GitHub Aware" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/React_19-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/WebRTC-Audio-333333?style=for-the-badge&logo=webrtc" alt="WebRTC" /></a>
</p>

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-violet?style=flat-square" alt="PRs Welcome" />
</p>

---

## The Problem

Traditional interview prep is broken. Reading questions off a screen doesn't prepare you for the pressure of a live technical interview. Mock interviews with friends are inconsistent. Paid coaching is expensive.

**Devvox changes that.**

## The Solution

Devvox is a full-stack AI interview platform that conducts **live, voice-based technical interviews** personalized to each candidate's actual work. No generic questions. No typing. Just talk.

```
GitHub Profile  -->  AI Analysis  -->  Voice Interview  -->  Instant Feedback
```

---

## Features

<table>
  <tr>
    <td width="50%">
      <h3>Real-time Voice AI</h3>
      <p>Natural, flowing conversation powered by <strong>WebRTC</strong> and <strong>OpenAI Realtime API</strong>. No typing, no delays — just talk like a real interview.</p>
    </td>
    <td width="50%">
      <h3>GitHub-Aware Questions</h3>
      <p>Questions generated from your <strong>actual repositories</strong>, languages, and contribution patterns. Every interview is unique to you.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>Instant Scoring & Feedback</h3>
      <p>Get rated on a <strong>10-point scale</strong> with actionable, AI-generated feedback powered by <strong>Google Gemini</strong>. Know exactly where you stand.</p>
    </td>
    <td width="50%">
      <h3>Full Transcript Review</h3>
      <p>Every question and answer preserved with <strong>real-time Deepgram transcription</strong>. Review your performance word by word.</p>
    </td>
  </tr>
</table>

---

## How It Works

```
 Step 1                    Step 2                    Step 3
 ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
 │                  │      │                  │      │                  │
 │   Paste GitHub   │ ───> │  Voice Interview │ ───> │   Get Results    │
 │   Profile URL    │      │  with AI (Live)  │      │   Score + Review │
 │                  │      │                  │      │                  │
 └─────────────────┘      └─────────────────┘      └─────────────────┘
   GitHub scraping           WebRTC + OpenAI          Gemini analysis
   Profile analysis          Real-time audio          Detailed feedback
   Question generation       Deepgram STT             Full transcript
```

1. **Paste your GitHub URL** — Devvox scrapes your profile, analyzes your repos, languages, and contributions
2. **Start talking** — A real-time voice interview begins, with questions tailored to your actual projects
3. **Get instant results** — Receive a score, detailed AI feedback, and a complete conversation transcript

---

## Tech Stack

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 19** | UI framework with latest concurrent features |
| **TypeScript** | Type-safe development |
| **Vite** | Lightning-fast build tooling |
| **Tailwind CSS v4** | Utility-first styling with OKLCH color space |
| **shadcn/ui** | Premium, accessible component library |
| **WebRTC** | Peer-to-peer real-time audio streaming |
| **Deepgram SDK** | Live speech-to-text transcription |
| **React Router v7** | Client-side navigation |

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **FastAPI** | High-performance async Python API |
| **SQLAlchemy 2.0** | Async ORM with PostgreSQL |
| **PostgreSQL** | Primary database with asyncpg driver |
| **Alembic** | Database migrations |
| **OpenAI Realtime API** | AI interviewer voice generation |
| **Google Gemini** | Interview analysis and scoring |
| **httpx** | Async HTTP client for GitHub scraping |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                           │
│                                                                  │
│   Landing Page ──> Interview Page ──> Result Page                │
│                    │           │                                  │
│                    │ WebRTC    │ WebSocket                        │
│                    │ (Audio)   │ (Deepgram STT)                   │
└────────────────────┼───────────┼─────────────────────────────────┘
                     │           │
                     v           v
┌──────────────────────────────────────────────────────────────────┐
│                      SERVER (FastAPI)                             │
│                                                                  │
│   /api/v1/pre-interview    ──>  GitHub Scraper                   │
│   /api/v1/session/:id      ──>  OpenAI Realtime (WebRTC SDP)     │
│   /api/v1/session/user/response/:id  ──>  Transcript Storage     │
│   /api/v1/result/:id       ──>  Gemini Analysis                  │
│                                                                  │
│   PostgreSQL  <──  SQLAlchemy (Async)  ──>  Alembic Migrations   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **Python** 3.11+
- **PostgreSQL** 12+
- API Keys: **OpenAI**, **Google Gemini**, **Deepgram**

### 1. Clone the repository

```bash
git clone https://github.com/arjitrawat15/devvox.git
cd devvox
```

### 2. Backend Setup

```bash
cd apps/backend

# Create and activate virtual environment
python -m venv venv
source venv/Scripts/activate    # Windows
# source venv/bin/activate      # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your actual credentials:
#   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/devvox
#   OPENAI_KEY=sk-...
#   GEMINI_API_KEY=...

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload --port 3001
```

### 3. Frontend Setup

```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at `http://localhost:5173`

---

## Project Structure

```
devvox/
├── apps/
│   ├── frontend/                # React 19 + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Landing.tsx      # Full landing page
│   │   │   │   ├── Navbar.tsx       # Navigation bar
│   │   │   │   ├── Interview.tsx    # Live interview (WebRTC)
│   │   │   │   ├── Result.tsx       # Score & transcript
│   │   │   │   ├── VoiceOrb.tsx     # Animated voice visualizer
│   │   │   │   └── ui/             # shadcn/ui components
│   │   │   ├── lib/
│   │   │   │   ├── config.ts       # API configuration
│   │   │   │   └── utils.ts        # Utility functions
│   │   │   └── App.tsx             # Router setup
│   │   └── styles/
│   │       └── globals.css         # Design tokens (OKLCH)
│   │
│   └── backend/                 # FastAPI + SQLAlchemy
│       ├── app/
│       │   ├── main.py             # API routes & middleware
│       │   ├── models.py           # Database models
│       │   ├── schemas.py          # Pydantic schemas
│       │   ├── database.py         # Async DB connection
│       │   ├── config.py           # Environment settings
│       │   ├── result.py           # Gemini scoring engine
│       │   ├── sideband.py         # OpenAI Realtime handler
│       │   └── scrapers/
│       │       └── github.py       # GitHub profile scraper
│       └── alembic/                # Database migrations
│
└── docs/                        # Design specs & plans
```

---

## API Reference

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/v1/pre-interview` | Submit GitHub URL, create interview session |
| `POST` | `/api/v1/session/:id` | Establish WebRTC connection (SDP handshake) |
| `POST` | `/api/v1/session/user/response/:id` | Send transcribed user speech |
| `GET`  | `/api/v1/result/:id` | Retrieve interview results & transcript |

---

## Environment Variables

| Variable | Required | Description |
|:---------|:---------|:------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_KEY` | Yes | OpenAI API key for Realtime voice |
| `GEMINI_API_KEY` | Yes | Google Gemini key for scoring |
| `PROXY_URL` | No | HTTP proxy for GitHub scraping |

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with passion by <a href="https://github.com/arjitrawat15">Arjit Rawat</a></strong>
</p>

<p align="center">
  <a href="https://github.com/arjitrawat15">
    <img src="https://img.shields.io/badge/GitHub-arjitrawat15-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
  <a href="https://linkedin.com/in/arjitrawat">
    <img src="https://img.shields.io/badge/LinkedIn-Arjit_Rawat-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
  </a>
</p>

<p align="center">
  <sub>If Devvox helped you ace an interview, consider giving it a star!</sub>
</p>
