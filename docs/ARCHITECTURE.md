# UtsukushiiAI Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Architecture (Express.js)](#backend-architecture-expressjs)
5. [ML Worker Architecture (FastAPI)](#ml-worker-architecture-fastapi)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [Scalability Design](#scalability-design)
9. [Infrastructure](#infrastructure)

---

## System Overview

UtsukushiiAI is a polyglot microservices platform that combines:
- **Next.js 15** for the frontend user interface
- **Express.js** for API orchestration
- **FastAPI (Python)** for ML inference
- **MongoDB** for persistent storage
- **Redis** for caching and job queuing
- **AWS S3** for object storage

### Design Principles

1. **Separation of Concerns**: Each service has a single, well-defined responsibility
2. **Loose Coupling**: Services communicate via well-defined APIs
3. **High Cohesion**: Related functionality is grouped together
4. **Scalability**: Each component can scale independently
5. **Resilience**: Failures are contained and don't cascade

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     Next.js 15 Application                          │    │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │    │
│  │  │  Forge  │  │  Canvas  │  │ Timeline │  │     Previewer       │  │    │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │         HTTPS (TLS 1.3)           │
                    └─────────────────┬─────────────────┘
                                      │
┌─────────────────────────────────────┴───────────────────────────────────────┐
│                           EDGE LAYER                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  CloudFlare / AWS CloudFront                                         │    │
│  │  - DDoS Protection                                                   │    │
│  │  - WAF (Web Application Firewall)                                    │    │
│  │  - SSL Termination                                                   │    │
│  │  - CDN for static assets                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
┌─────────────────────────────────────┴───────────────────────────────────────┐
│                          API GATEWAY LAYER                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   Express.js Application                            │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │                     API Routes                                │  │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │  │    │
│  │  │  │  Auth    │ │ Project  │ │  Render  │ │    Upload        │ │  │    │
│  │  │  │ Router   │ │ Router   │ │ Router   │ │    Router        │ │  │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘ │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │                   Middleware                                 │  │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │    │
│  │  │  │  CORS    │ │  Rate    │ │  Auth    │ │    Validation  │  │  │    │
│  │  │  │          │ │  Limit   │ │  JWT     │ │                │  │  │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │                   Services                                   │  │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │  │    │
│  │  │  │ Project  │ │  Render  │ │   S3     │ │   WebSocket    │  │  │    │
│  │  │  │ Service  │ │  Service │ │ Service  │ │   Service      │  │  │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    MongoDB      │ │     Redis       │ │     AWS S3      │
│   (Primary DB)  │ │    (Cache)      │ │   (Storage)     │
│                 │ │                 │ │                 │
│ - Projects      │ │ - Session Data  │ │ - Raw Manga     │
│ - Users         │ │ - Render Queue  │ │ - Extracted     │
│ - Panels        │ │ - Rate Limiting │ │ - Final Exports │
│ - Render Jobs   │ │                 │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
         │
         │ Internal Network
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ML WORKER LAYER                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   FastAPI Application                               │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │                     ML Pipelines                              │  │    │
│  │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐ │  │    │
│  │  │  │  YOLOv12   │ │   SAM 2     │ │   MiDaS    │ │  Librosa │ │  │    │
│  │  │  │  Detector  │ │ Segmenter   │ │  DepthEst  │ │ Analyzer │ │  │    │
│  │  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘ │  │    │
│  │  │  ┌──────────────────────────────────────────────────────┐  │  │    │
│  │  │  │           Stable Video Diffusion (SVD)              │  │  │    │
│  │  │  └──────────────────────────────────────────────────────┘  │  │    │
│  │  │  ┌──────────────────────────────────────────────────────┐  │  │    │
│  │  │  │           FFmpeg Video Composer                      │  │  │    │
│  │  │  └──────────────────────────────────────────────────────┘  │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  │  ┌──────────────────────────────────────────────────────────────┐  │    │
│  │  │                     API Routes                               │  │    │
│  │  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │  │    │
│  │  │  │  /detect   │ │ /segment   │ │  /depth    │ │ /analyze │  │  │    │
│  │  │  │  /panels   │ │ /masks      │ │  /depth    │ │ /beats   │  │  │    │
│  │  │  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │  │    │
│  │  │  ┌──────────────────────────────────────────────────────┐   │  │    │
│  │  │  │              /render (Full Pipeline)                │   │  │    │
│  │  │  └──────────────────────────────────────────────────────┘   │  │    │
│  │  └──────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Technology Stack
- **Next.js 15** (App Router)
- **TypeScript 5.x**
- **Zustand** for state management
- **Remotion** for video preview
- **Framer Motion** for animations
- **Tailwind CSS** for styling

### Application Structure

```
web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   └── [id]/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── [...routes]/route.ts
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── ...
│   │
│   ├── forge/              # Upload components
│   │   ├── MangaUploader/
│   │   ├── AudioUploader/
│   │   └── YouTubeDownloader/
│   │
│   ├── canvas/             # Canvas studio components
│   │   ├── PanelEditor/
│   │   ├── BoundingBox/
│   │   ├── LayerManager/
│   │   └── Toolbar/
│   │
│   ├── timeline/           # Timeline components
│   │   ├── Waveform/
│   │   ├── BeatMarker/
│   │   ├── Transition/
│   │   └── Track/
│   │
│   └── preview/            # Preview components
│       ├── VideoPlayer/
│       └── FramePreview/
│
├── stores/                 # Zustand stores
│   ├── projectStore.ts
│   ├── canvasStore.ts
│   ├── timelineStore.ts
│   └── renderStore.ts
│
├── hooks/                  # Custom React hooks
│   ├── useProject.ts
│   ├── useCanvas.ts
│   ├── useWebSocket.ts
│   └── useRender.ts
│
├── lib/                   # Utilities
│   ├── api.ts              # API client
│   ├── socket.ts           # WebSocket client
│   └── utils.ts
│
└── types/                  # TypeScript types
    ├── project.ts
    ├── panel.ts
    └── render.ts
```

### State Management (Zustand)

```typescript
// stores/projectStore.ts
interface ProjectStore {
  project: Project | null;
  panels: Panel[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProject: (id: string) => Promise<void>;
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  addPanel: (panel: Panel) => void;
  removePanel: (panelId: string) => void;
}
```

### Component Patterns

1. **Presentational Components**: Pure UI, no business logic
2. **Container Components**: Connect to stores, handle data fetching
3. **Compound Components**: Share state via context

---

## Backend Architecture (Express.js)

### Layered Architecture

```
api/
├── src/
│   ├── controllers/       # HTTP request handlers
│   │   ├── authController.ts
│   │   ├── projectController.ts
│   │   └── renderController.ts
│   │
│   ├── routes/           # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── projectRoutes.ts
│   │   └── renderRoutes.ts
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimit.ts
│   │   └── errorHandler.ts
│   │
│   ├── services/         # Business logic
│   │   ├── projectService.ts
│   │   ├── renderService.ts
│   │   ├── s3Service.ts
│   │   └── authService.ts
│   │
│   ├── models/           # Data models
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── RenderJob.ts
│   │
│   ├── repositories/    # Data access layer
│   │   ├── userRepository.ts
│   │   ├── projectRepository.ts
│   │   └── jobRepository.ts
│   │
│   ├── utils/            # Utilities
│   │   ├── logger.ts
│   │   └── validators.ts
│   │
│   ├── config/          # Configuration
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── s3.ts
│   │
│   ├── types/           # TypeScript types
│   │   └── express.d.ts
│   │
│   └── index.ts         # App entry point
│
└── tests/
    ├── controllers/
    ├── services/
    └── integration/
```

### Design Patterns Used

1. **Controller Pattern**: Routes delegate to controllers
2. **Service Layer**: Business logic in dedicated services
3. **Repository Pattern**: Data access abstraction
4. **Factory Pattern**: Creating complex objects
5. **Observer Pattern**: Event handling for job updates

### API Routes Structure

```typescript
// routes/projectRoutes.ts
router.post('/projects', 
  authMiddleware, 
  validateProjectCreate, 
  projectController.create
);

router.get('/projects', 
  authMiddleware, 
  projectController.list
);

router.get('/projects/:id', 
  authMiddleware, 
  projectController.getById
);

router.put('/projects/:id', 
  authMiddleware, 
  validateProjectUpdate,
  projectController.update
);

router.delete('/projects/:id', 
  authMiddleware, 
  projectController.delete
);

// Panel routes
router.get('/projects/:id/panels', 
  authMiddleware, 
  panelController.list
);

router.post('/projects/:id/panels', 
  authMiddleware, 
  validatePanelCreate,
  panelController.create
);

router.put('/projects/:id/panels/:panelId', 
  authMiddleware, 
  panelController.update
);

router.delete('/projects/:id/panels/:panelId', 
  authMiddleware, 
  panelController.delete
);
```

---

## ML Worker Architecture (FastAPI)

### Pipeline Structure

```
worker/
├── src/
│   ├── pipelines/        # ML pipelines
│   │   ├── __init__.py
│   │   ├── detection_pipeline.py    # YOLOv12 detection
│   │   ├── segmentation_pipeline.py # SAM 2 segmentation
│   │   ├── depth_pipeline.py        # MiDaS depth
│   │   ├── animation_pipeline.py     # SVD animation
│   │   ├── audio_pipeline.py         # Librosa analysis
│   │   └── composition_pipeline.py   # FFmpeg composition
│   │
│   ├── models/            # ML model wrappers
│   │   ├── yolo_detector.py
│   │   ├── sam_segmenter.py
│   │   ├── midas_estimator.py
│   │   └── svd_animate.py
│   │
│   ├── services/          # Business logic
│   │   ├── render_service.py
│   │   ├── storage_service.py
│   │   └── notification_service.py
│   │
│   ├── routes/            # API routes
│   │   ├── detection.py
│   │   ├── segmentation.py
│   │   ├── depth.py
│   │   ├── audio.py
│   │   └── render.py
│   │
│   ├── schemas/           # Pydantic models
│   │   ├── request.py
│   │   └── response.py
│   │
│   ├── utils/             # Utilities
│   │   ├── logger.py
│   │   ├── image_utils.py
│   │   └── video_utils.py
│   │
│   ├── config/           # Configuration
│   │   ├── model_config.py
│   │   └── pipeline_config.py
│   │
│   └── main.py           # App entry point
│
├── models/               # Model weights
│   ├── yolov12-manga.pt
│   ├── sam2.pt
│   └── midas-v3.pt
│
├── downloads/            # Downloaded content
│   ├── manga/
│   └── audio/
│
├── output/               # Rendered output
│   └── videos/
│
└── tests/
    ├── pipelines/
    └── models/
```

### ML Pipeline Flow

```python
# pipelines/composition_pipeline.py
class CompositionPipeline:
    async def execute(
        self,
        project_id: str,
        panels: List[PanelData],
        audio_path: str,
        beats: List[BeatMarker],
        settings: RenderSettings
    ) -> str:
        # 1. Load and prepare panels
        prepared_panels = await self._prepare_panels(panels)
        
        # 2. Generate depth maps for parallax
        depth_maps = await self._generate_depth_maps(prepared_panels)
        
        # 3. Animate characters with SVD
        animated_frames = await self._animate_characters(prepared_panels)
        
        # 4. Compose video with FFmpeg
        output_path = await self._compose_video(
            animated_frames,
            depth_maps,
            beats,
            settings
        )
        
        # 5. Upload to S3
        s3_url = await self._upload_to_s3(output_path, project_id)
        
        return s3_url
```

---

## Data Flow

### 1. Project Creation Flow

```
User Action          Express API           MongoDB              Redis
   │                      │                   │                   │
   │──POST /projects──────>│                   │                   │
   │                      │──Create Project───>│                   │
   │                      │                   │                   │
   │                      │<─Project Created──│                   │
   │                      │                   │                   │
   │<──201 Created─────────│                   │                   │
   │                      │                   │                   │
```

### 2. Upload Flow

```
User              Express API              AWS S3            ML Worker
  │                    │                      │                   │
  │──POST /upload/presign──>│                   │                   │
  │                    │<──Presigned URL───────│                   │
  │                    │                      │                   │
  │<──200 OK─────────────│                      │                   │
  │                    │                      │                   │
  │────────PUT to S3───────────────────────────>│                   │
  │                    │                      │                   │
  │                    │<──Upload Complete─────│                   │
  │                    │                      │                   │
  │                    │──Notify ML Worker─────>│                   │
  │                    │                      │                   │
```

### 3. Render Flow

```
Express API           Redis Queue         ML Worker           MongoDB
    │                    │                    │                    │
    │──Enqueue Job───────>│                    │                    │
    │                    │                    │                    │
    │<─Job Enqueued───────│                    │                    │
    │                    │                    │                    │
    │                    │<──Dequeue Job───────│                    │
    │                    │                    │                    │
    │                    │                    │──Update Job Status─>│
    │                    │                    │                    │
    │                    │                    │──Detect Panels─────>│
    │                    │                    │                    │
    │<──WS:progress───────│                    │                    │
    │                    │                    │                    │
    │                    │                    │──Segment───────────>│
    │                    │                    │                    │
    │<──WS:progress───────│                    │                    │
    │                    │                    │                    │
    │                    │                    │──Analyze Audio────>│
    │                    │                    │                    │
    │<──WS:progress───────│                    │                    │
    │                    │                    │                    │
    │                    │                    │──Compose Video────>│
    │                    │                    │                    │
    │<──WS:progress───────│                    │                    │
    │                    │                    │                    │
    │                    │                    │<──Upload Complete──│
    │                    │                    │                    │
    │                    │                    │──Update Job───────>│
    │                    │                    │                    │
    │<──WS:complete───────│                    │                    │
```

---

## Security Architecture

### Authentication

- **JWT Tokens**: Short-lived access tokens (15 min), long-lived refresh tokens (7 days)
- **Password Hashing**: bcrypt with cost factor 12
- **Session Management**: Redis-backed sessions

### Authorization

- **Role-Based Access Control (RBAC)**
  - `admin`: Full system access
  - `user`: Create/edit own projects
  - `guest`: View public projects only

### Data Protection

- **Encryption in Transit**: TLS 1.3
- **Encryption at Rest**: AWS SSE-KMS for S3
- **Input Validation**: Zod schemas on both client and server

### API Security

- **Rate Limiting**: 100 requests/minute per IP
- **CORS**: Strict origin allowlist
- **CSRF**: Token-based protection
- **SQL Injection**: Parameterized queries (MongoDB native)
- **XSS**: Content Security Policy headers

---

## Scalability Design

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
     ┌───────────┬───────────┼───────────┬───────────┐
     │           │           │           │           │
     ▼           ▼           ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ API 1  │ │ API 2  │ │ API 3  │ │ API 4  │ │ API 5  │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### Worker Scaling

```
                    ┌─────────────────┐
                    │  Redis Queue    │
                    └────────┬────────┘
                             │
     ┌───────────┬───────────┼───────────┬───────────┐
     │           │           │           │           │
     ▼           ▼           ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Worker 1│ │Worker 2│ │Worker 3│ │Worker 4│ │Worker N│
│  (GPU) │ │  (GPU) │ │  (CPU) │ │  (CPU) │ │  (CPU) │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘
```

### Caching Strategy

| Data Type | Cache | TTL |
|-----------|-------|-----|
| User Sessions | Redis | 24 hours |
| Project Metadata | Redis | 5 minutes |
| Panel Coordinates | Redis | 1 hour |
| Beat Markers | Redis | 1 hour |
| Static Assets | CDN | 1 week |

---

## Infrastructure

### Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./apps/api
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/utsukushii
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis

  worker:
    build: ./apps/worker
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - MONGODB_URI=mongodb://mongodb:27017/utsukushii
      - REDIS_URL=redis://redis:6379
    volumes:
      - worker_models:/app/models

  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:4000
    depends_on:
      - api

volumes:
   worker_models:
 mongodb_data:
```

### Production Environment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production setup.

---

## Monitoring & Observability

### Metrics

- **Application Metrics**: Request latency, error rates
- **Business Metrics**: Renders completed, active users
- **Infrastructure Metrics**: CPU, memory, GPU utilization

### Logging

- **Format**: JSON structured logs
- **Levels**: DEBUG, INFO, WARN, ERROR
- **Destination**: CloudWatch / ELK Stack

### Tracing

- **Distributed Tracing**: OpenTelemetry
- **Trace Context**: Propagated via HTTP headers

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project data",
    "details": [
      {
        "field": "title",
        "message": "Title must be between 1 and 100 characters"
      }
    ]
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Version Compatibility

| Component | Version | Notes |
|-----------|---------|-------|
| Node.js | 20.x LTS | Required |
| Python | 3.11+ | Required |
| Next.js | 15.x | App Router |
| Express | 4.x | |
| FastAPI | 0.100+ | |
| MongoDB | 6.x | |
| Redis | 7.x | |
| Docker | 24.x | |
| Kubernetes | 1.28+ | Production |
