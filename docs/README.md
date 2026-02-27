# UtsukushiiAI - Generative Manga-to-Shorts (MMV) Animation Platform

<p align="center">
  <img src="docs/assets/logo.svg" alt="UtsukushiiAI Logo" width="200"/>
</p>

<p align="center">
  <a href="https://discord.gg/utsukushii">
    <img src="https://img.shields.io/discord/1234567890" alt="Discord"/>
  </a>
  <a href="https://twitter.com/utsukushii_ai">
    <img src="https://img.shields.io/twitter/follow/utsukushii_ai" alt="Twitter"/>
  </a>
  <img src="https://img.shields.io/github/license/utsukushii/utsukushii-ai" alt="License"/>
  <img src="https://img.shields.io/github/v/release/utsukushii/utsukushii-ai" alt="Version"/>
</p>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [ML Pipeline](#ml-pipeline)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Overview

**UtsukushiiAI** (Japanese: 美しい - "Beautiful") is a production-grade generative media platform designed to automate the creation of high-energy, beat-synced "Manga Music Videos" (MMVs). It utilizes Computer Vision (CV) to segment static manga pages and Generative AI to animate them into vertical video formats (9:16) for social media platforms like TikTok, Instagram Reels, and YouTube Shorts.

### Core Objectives

- **Automated Motion**: Convert static 2D manga panels into 3D parallax animations
- **Rhythm Intelligence**: Precisely sync visual transitions to audio beats
- **Aesthetic Preservation**: Maintain the original mangaka's art style while adding cinematic "glow" and "glitch" effects
- **Efficiency**: Reduce manual video editing time from 4 hours to < 2 minutes

---

## Features

### The Forge (Upload)
- Multi-modal drag-and-drop for Manga (PDF, PNG, JPG) and Music (MP3, WAV)
- Automatic manga page extraction from PDF files
- YouTube audio download via yt-dlp for "Vibe-Matching" music

### The Canvas Studio
- Interactive Bounding Box (BBox) adjustment for AI-detected panels
- Real-time preview of panel segmentation
- Layer management for foreground/background elements

### Rhythm Timeline
- Visual waveform display with automated beat-marker detection
- Millisecond-accurate sync point placement
- Drag-and-drop transition effects

### Render Engine
- YOLOv12 panel detection with Manga109 fine-tuning
- MiDaS depth estimation for 3D "Wiggle" parallax effects
- Stable Video Diffusion (SVD) for character animation
- FFmpeg/MoviePy video composition

### Export Options
- Multiple aspect ratios: 9:16 (Stories/Reels), 16:9 (YouTube), 1:1 (Instagram)
- Quality presets: Draft, Standard, High, Ultra
- Direct upload to social platforms

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Next.js 15 | App Router, React Server Components |
| TypeScript | Type safety across full stack |
| Zustand | Global state management |
| Remotion | Frame-accurate video preview |
| Framer Motion | Cinematic UI animations |
| Tailwind CSS | Utility-first styling |

### Backend (Orchestration)
| Technology | Purpose |
|------------|---------|
| Express.js | REST API server |
| Socket.io | Real-time progress updates |
| JWT | Authentication |
| AWS SDK | S3 signed URL generation |

### Backend (ML Inference)
| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance ML API |
| Python 3.11+ | ML runtime |
| PyTorch | Deep learning framework |
| YOLOv12 | Panel detection |
| SAM 2 | Instance segmentation |
| MiDaS | Depth estimation |
| Stable Video Diffusion | Character animation |
| Librosa | Audio analysis |
| FFmpeg | Video processing |

### Data & Infrastructure
| Technology | Purpose |
|------------|---------|
| MongoDB | Project metadata, panel JSON |
| Redis | Render queue, session cache |
| AWS S3 | Object storage |
| Docker | Containerization |
| Kubernetes | Production orchestration |

---

## Quick Start

### Prerequisites

- Node.js 20.x+
- Python 3.11+
- Docker & Docker Compose
- MongoDB 6.x
- Redis 7.x
- AWS Account (S3)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/utsukushii/utsukushii-ai.git
cd utsukushii-ai
```

2. **Environment Configuration**
```bash
# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env

# Edit with your credentials
# Required: MongoDB URI, Redis URL, AWS credentials, JWT secret
```

3. **Start with Docker Compose**
```bash
# Start all services
docker-compose up -d

# Or start individual services
docker-compose up -d mongodb redis
```

4. **Install and Run Locally**

```bash
# Frontend
cd apps/web
npm install
npm run dev

# Backend API
cd apps/api
npm install
npm run dev

# ML Worker
cd apps/worker
pip install -r requirements.txt
uvicorn main:app --reload
```

5. **Access the Application**
- Frontend: http://localhost:3000
- API: http://localhost:4000
- ML Worker: http://localhost:8000

---

## Architecture

UtsukushiiAI follows a **Polyglot Microservices** architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│                  http://localhost:3000                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Express.js)                  │
│                  http://localhost:4000                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Auth API   │  │ Project API │  │   Render API        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────┬───────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
│  MongoDB    │  │    Redis    │  │  AWS S3         │
│  (State)    │  │   (Queue)   │  │  (Storage)      │
└─────────────┘  └─────────────┘  └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               ML Worker (FastAPI + Python)                 │
│                  http://localhost:8000                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │Detector  │  │Segmenter │  │DepthEst  │  │AudioAnalyzer│ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │              Video Composer (FFmpeg)                 │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Event-Driven**: Real-time progress via WebSockets
- **CQRS**: Separate read/write models for project data
- **Repository Pattern**: Data abstraction layer
- **Factory Pattern**: Component creation for different video formats
- **Observer Pattern**: Job status updates

---

## Project Structure

```
utsukushii-ai/
├── apps/
│   ├── web/                    # Next.js 15 Frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── lib/           # Utilities
│   │   │   ├── stores/        # Zustand stores
│   │   │   └── types/         # TypeScript types
│   │   └── public/            # Static assets
│   │
│   ├── api/                   # Express.js Backend
│   │   ├── src/
│   │   │   ├── controllers/  # Route handlers
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── models/        # Business logic
│   │   │   ├── routes/        # API routes
│   │   │   ├── services/      # Core services
│   │   │   └── utils/         # Utilities
│   │   └── tests/             # API tests
│   │
│   └── worker/               # FastAPI ML Worker
│       ├── src/
│       │   ├── models/        # ML models
│       │   ├── pipelines/    # Processing pipelines
│       │   ├── services/      # ML services
│       │   └── utils/         # Utilities
│       ├── models/            # Downloaded model weights
│       └── tests/             # ML tests
│
├── packages/
│   ├── shared/               # Shared types & utilities
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Shared utilities
│   │
│   ├── database/            # MongoDB connection & schemas
│   │
│   ├── cache/               # Redis client & utilities
│   │
│   └── s3/                  # AWS S3 utilities
│
├── tools/
│   ├── scripts/             # Build & deployment scripts
│   └── configs/            # Configuration files
│
├── docs/                    # Documentation
│   ├── architecture/
│   ├── api/
│   └── assets/
│
├── docker-compose.yml       # Local development
├── docker-compose.prod.yml  # Production deployment
├── turbo.json              # Turborepo config
├── package.json            # Root package.json
└── README.md               # This file
```

---

## API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/logout` | POST | Logout user |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/auth/me` | GET | Get current user |

### Projects

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET | List user projects |
| `/api/projects` | POST | Create new project |
| `/api/projects/:id` | GET | Get project details |
| `/api/projects/:id` | PUT | Update project |
| `/api/projects/:id` | DELETE | Delete project |
| `/api/projects/:id/panels` | GET | Get project panels |
| `/api/projects/:id/panels` | POST | Add panel to project |
| `/api/projects/:id/panels/:panelId` | PUT | Update panel |
| `/api/projects/:id/panels/:panelId` | DELETE | Delete panel |

### | Method | Description Rendering

| Endpoint |
|----------|--------|-------------|
| `/api/render/start` | POST | Start render job |
| `/api/render/:jobId` | GET | Get render status |
| `/api/render/:jobId` | DELETE | Cancel render job |
| `/api/render/:jobId/download` | GET | Download rendered video |

### Presigned URLs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/presign` | POST | Get presigned S3 URL |
| `/api/upload/complete` | POST | Confirm upload complete |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `render:progress` | Server→Client | Render progress update |
| `render:complete` | Server→Client | Render completed |
| `render:error` | Server→Client | Render error |
| `panel:detected` | Server→Client | Panel detection complete |

---

## ML Pipeline

### Stage 1: Panel Detection (YOLOv12)
- Input: Manga image (PNG/JPG/PDF page)
- Output: Bounding box coordinates for each panel
- Model: Fine-tuned on Manga109 dataset
- Coordinates: Normalized (0.0 - 1.0) for scale invariance

### Stage 2: Instance Segmentation (SAM 2)
- Input: Panel bounding boxes + original image
- Output: Binary masks for characters/foreground
- Model: SAM 2 (Segment Anything 2)

### Stage 3: Depth Estimation (MiDaS)
- Input: Original image
- Output: Depth map for parallax effect
- Effect: "Wiggle" 3D animation based on depth

### Stage 4: Audio Analysis (Librosa)
- Input: Audio file (MP3/WAV)
- Output: BPM, onset timestamps, beat markers
- Algorithm: Harmonic-Percussive Source Separation (HPSS)

### Stage 5: Character Animation (SVD)
- Input: Segmented character images
- Output: Animated frames with subtle movement
- Model: Stable Video Diffusion

### Stage 6: Video Composition (FFmpeg)
- Input: All layers + audio + beat markers
- Output: Final MP4 video (9:16, 30fps)
- Effects: Glow, glitch, transitions synced to beats

---

## Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Kubernetes (Production)
```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Scale workers
kubectl scale deployment worker --replicas=5
```

### Environment Variables

See `.env.example` files in each app directory for required variables.

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write unit tests for new features
- Document public APIs with JSDoc

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Manga109 Dataset](https://github.com/Manga109/Manga109) for training data
- [Ultralytics](https://ultralytics.com) for YOLOv12
- [Meta AI](https://ai.meta.com) for SAM 2
- [Stability AI](https://stability.ai) for Stable Video Diffusion
- [The community](https://discord.gg/utsukushii) for feedback and support

---

<p align="center">
  Made with ❤️ by the UtsukushiiAI Team
</p>
