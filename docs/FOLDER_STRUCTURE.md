# UtsukushiiAI Folder Structure

This document describes the complete folder structure of the UtsukushiiAI project, designed for production-ready applications following SOLID principles.

## Root Directory Structure

```
utsukushii-ai/
├── .github/                     # GitHub workflows and templates
│   ├── workflows/
│   │   ├── ci.yml              # CI pipeline
│   │   ├── cd.yml             # CD pipeline
│   │   └── deploy.yml         # Deployment workflow
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .vscode/                     # VSCode settings
│   ├── extensions.json
│   ├── settings.json
│   └── tasks.json
│
├── apps/                        # Monorepo applications
│   ├── web/                    # Next.js Frontend
│   ├── api/                    # Express.js Backend
│   └── worker/                 # FastAPI ML Worker
│
├── packages/                    # Shared packages
│   ├── shared/                 # Shared types & utilities
│   ├── database/               # MongoDB connection
│   ├── cache/                  # Redis utilities
│   └── s3/                     # AWS S3 utilities
│
├── tools/                       # Build and deployment tools
│   ├── scripts/
│   │   ├── build.sh
│   │   ├── deploy.sh
│   │   └── test.sh
│   └── configs/
│
├── docs/                        # Documentation
│   ├── architecture/
│   ├── api/
│   └── assets/
│
├── k8s/                         # Kubernetes manifests
│   ├── base/
│   ├── overlays/
│   │   ├── development/
│   │   └── production/
│   └── components/
│
├── docker/                      # Docker configurations
│   ├── api/
│   ├── worker/
│   └── web/
│
├── .env.example                # Environment template
├── .env.local                  # Local environment
├── .eslintrc.js                # ESLint config
├── .prettierrc                 # Prettier config
├── .gitignore
├── .dockerignore
├── turbo.json                  # Turborepo config
├── package.json                # Root package.json
├── tsconfig.json              # TypeScript base config
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml    # Production deployment
├── docker-compose.ci.yml     # CI environment
├── LICENSE
└── README.md
```

---

## Frontend Application (apps/web)

```
apps/web/
├── public/                     # Static assets
│   ├── fonts/
│   ├── images/
│   │   ├── logo.svg
│   │   └── og-image.png
│   └── favicon.ico
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth route group
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── register/
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/     # Dashboard route group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── render/
│   │   │   │           └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── billing/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/              # API routes
│   │   │   └── [...trpc]/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Landing page
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Select/
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   ├── Toast/
│   │   │   ├── Dropdown/
│   │   │   ├── Tabs/
│   │   │   ├── Slider/
│   │   │   ├── Progress/
│   │   │   ├── Spinner/
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/           # Layout components
│   │   │   ├── Header/
│   │   │   ├── Sidebar/
│   │   │   ├── Footer/
│   │   │   └── Navbar/
│   │   │
│   │   ├── forge/            # Upload components
│   │   │   ├── MangaUploader/
│   │   │   │   ├── MangaUploader.tsx
│   │   │   │   ├── DropZone.tsx
│   │   │   │   ├── FileList.tsx
│   │   │   │   └── index.ts
│   │   │   ├── AudioUploader/
│   │   │   ├── YouTubeDownloader/
│   │   │   └── index.ts
│   │   │
│   │   ├── canvas/           # Canvas studio components
│   │   │   ├── Canvas/
│   │   │   │   ├── Canvas.tsx
│   │   │   │   ├── CanvasToolbar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── PanelEditor/
│   │   │   ├── BoundingBox/
│   │   │   │   ├── BoundingBox.tsx
│   │   │   │   ├── BoundingBoxHandle.tsx
│   │   │   │   └── index.ts
│   │   │   ├── LayerManager/
│   │   │   ├── SelectionManager/
│   │   │   └── index.ts
│   │   │
│   │   ├── timeline/         # Timeline components
│   │   │   ├── Timeline/
│   │   │   │   ├── Timeline.tsx
│   │   │   │   └── TimelineHeader.tsx
│   │   │   ├── Waveform/
│   │   │   │   ├── Waveform.tsx
│   │   │   │   ├── WaveformCanvas.tsx
│   │   │   │   └── index.ts
│   │   │   ├── BeatMarker/
│   │   │   ├── Transition/
│   │   │   ├── Track/
│   │   │   └── index.ts
│   │   │
│   │   ├── preview/          # Preview components
│   │   │   ├── VideoPlayer/
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   ├── Controls.tsx
│   │   │   │   └── index.ts
│   │   │   ├── FramePreview/
│   │   │   └── index.ts
│   │   │
│   │   ├── render/          # Render components
│   │   │   ├── RenderPanel/
│   │   │   ├── RenderProgress/
│   │   │   ├── QualitySelector/
│   │   │   ├── FormatSelector/
│   │   │   └── index.ts
│   │   │
│   │   └── auth/            # Auth components
│   │       ├── LoginForm/
│   │       ├── RegisterForm/
│   │       └── index.ts
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useProject.ts
│   │   ├── useProjects.ts
│   │   ├── useCanvas.ts
│   │   ├── usePanels.ts
│   │   ├── useTimeline.ts
│   │   ├── useRender.ts
│   │   ├── useWebSocket.ts
│   │   ├── useUpload.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   │
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   ├── projectStore.ts
│   │   ├── canvasStore.ts
│   │   ├── timelineStore.ts
│   │   ├── renderStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   │
│   ├── lib/                 # Libraries and utilities
│   │   ├── api/
│   │   │   ├── client.ts    # API client
│   │   │   ├── endpoints.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   ├── socket/
│   │   │   ├── client.ts
│   │   │   ├── events.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── cn.ts        # Class name utility
│   │   │   ├── format.ts    # Number/date formatting
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── panel.ts
│   │   ├── render.ts
│   │   ├── timeline.ts
│   │   ├── api.ts
│   │   └── index.ts
│   │
│   └── config/              # Configuration
│       ├── site.ts
│       └── constants.ts
│
├── .env.example
├── .env.local
├── next.config.js
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
├── jest.config.js
├── jest.setup.ts
└── Dockerfile
```

---

## Backend Application (apps/api)

```
apps/api/
├── src/
│   ├── controllers/         # HTTP request handlers
│   │   ├── authController.ts
│   │   ├── projectController.ts
│   │   ├── panelController.ts
│   │   ├── renderController.ts
│   │   ├── uploadController.ts
│   │   └── index.ts
│   │
│   ├── routes/              # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── projectRoutes.ts
│   │   ├── panelRoutes.ts
│   │   ├── renderRoutes.ts
│   │   ├── uploadRoutes.ts
│   │   ├── healthRoutes.ts
│   │   └── index.ts
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── rateLimit.ts
│   │   ├── errorHandler.ts
│   │   ├── cors.ts
│   │   ├── helmet.ts
│   │   ├── logger.ts
│   │   └── index.ts
│   │
│   ├── services/           # Business logic
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── panelService.ts
│   │   ├── renderService.ts
│   │   ├── s3Service.ts
│   │   ├── emailService.ts
│   │   ├── webhookService.ts
│   │   ├── analyticsService.ts
│   │   └── index.ts
│   │
│   ├── models/              # Domain models
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   ├── Panel.ts
│   │   ├── RenderJob.ts
│   │   └── index.ts
│   │
│   ├── repositories/       # Data access layer
│   │   ├── userRepository.ts
│   │   ├── projectRepository.ts
│   │   ├── panelRepository.ts
│   │   ├── renderJobRepository.ts
│   │   └── index.ts
│   │
│   ├── database/            # Database connection
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   └── seeders/
│   │
│   ├── cache/              # Redis operations
│   │   ├── client.ts
│   │   ├── keys.ts
│   │   └── decorators.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── logger.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── validators.ts
│   │   ├── errors.ts
│   │   └── index.ts
│   │
│   ├── config/             # Configuration
│   │   ├── index.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── s3.ts
│   │   ├── auth.ts
│   │   └── server.ts
│   │
│   ├── types/              # TypeScript types
│   │   ├── express.d.ts
│   │   └── index.ts
│   │
│   ├── errors/             # Custom error classes
│   │   ├── AppError.ts
│   │   ├── NotFoundError.ts
│   │   ├── UnauthorizedError.ts
│   │   ├── ValidationError.ts
│   │   └── index.ts
│   │
│   ├── decorators/         # Custom decorators
│   │   ├── controller.ts
│   │   ├── route.ts
│   │   └── index.ts
│   │
│   └── index.ts           # Application entry point
│
├── tests/
│   ├── controllers/
│   │   ├── authController.test.ts
│   │   └── projectController.test.ts
│   │
│   ├── services/
│   │   ├── authService.test.ts
│   │   └── projectService.test.ts
│   │
│   ├── integration/
│   │   ├── auth.test.ts
│   │   └── projects.test.ts
│   │
│   ├── fixtures/
│   │   └── index.ts
│   │
│   └── helpers/
│       └── index.ts
│
├── .env.example
├── tsconfig.json
├── package.json
├── jest.config.js
├── Dockerfile
└── ecosystem.config.js     # PM2 config
```

---

## ML Worker Application (apps/worker)

```
apps/worker/
├── src/
│   ├── pipelines/          # ML processing pipelines
│   │   ├── __init__.py
│   │   ├── base_pipeline.py
│   │   ├── detection_pipeline.py
│   │   ├── segmentation_pipeline.py
│   │   ├── depth_pipeline.py
│   │   ├── animation_pipeline.py
│   │   ├── audio_pipeline.py
│   │   ├── composition_pipeline.py
│   │   └── render_pipeline.py
│   │
│   ├── models/             # ML model wrappers
│   │   ├── __init__.py
│   │   ├── base_model.py
│   │   ├── yolo_detector.py
│   │   ├── sam_segmenter.py
│   │   ├── midas_estimator.py
│   │   ├── svd_animate.py
│   │   └── audio_analyzer.py
│   │
│   ├── services/           # Business logic
│   │   ├── __init__.py
│   │   ├── render_service.py
│   │   ├── storage_service.py
│   │   ├── notification_service.py
│   │   ├── queue_service.py
│   │   └── metrics_service.py
│   │
│   ├── routes/             # FastAPI routes
│   │   ├── __init__.py
│   │   ├── detection.py
│   │   ├── segmentation.py
│   │   ├── depth.py
│   │   ├── audio.py
│   │   ├── render.py
│   │   └── health.py
│   │
│   ├── schemas/            # Pydantic models
│   │   ├── __init__.py
│   │   ├── request.py
│   │   ├── response.py
│   │   └── config.py
│   │
│   ├── database/           # Database operations
│   │   ├── __init__.py
│   │   ├── connection.py
│   │   └── repositories/
│   │
│   ├── cache/              # Redis operations
│   │   ├── __init__.py
│   │   └── client.py
│   │
│   ├── utils/              # Utilities
│   │   ├── __init__.py
│   │   ├── logger.py
│   │   ├── image_utils.py
│   │   ├── video_utils.py
│   │   ├── audio_utils.py
│   │   ├── file_utils.py
│   │   └── decorators.py
│   │
│   ├── config/             # Configuration
│   │   ├── __init__.py
│   │   ├── model_config.py
│   │   ├── pipeline_config.py
│   │   └── app_config.py
│   │
│   └── main.py             # Application entry point
│
├── models/                  # Model weights
│   ├── yolov12/
│   │   └── manga/
│   │       └── weights/
│   ├── sam2/
│   │   └── weights/
│   └── midas/
│       └── weights/
│
├── downloads/               # Downloaded content
│   ├── manga/
│   └── audio/
│
├── output/                  # Rendered output
│   ├── videos/
│   ├── frames/
│   └── temp/
│
├── tests/
│   ├── pipelines/
│   │   ├── test_detection_pipeline.py
│   │   ├── test_composition_pipeline.py
│   │   └── __init__.py
│   │
│   ├── models/
│   │   └── __init__.py
│   │
│   └── fixtures/
│       ├── __init__.py
│       └── sample_images/
│
├── .env.example
├── pyproject.toml
├── uv.lock
├── Dockerfile
├── docker-compose.override.yml
└── README.md
```

---

## Shared Packages (packages/)

### Shared Types (packages/shared)

```
packages/shared/
├── types/
│   ├── auth.ts
│   │   ├── User.ts
│   │   ├── AuthTokens.ts
│   │   └── LoginRequest.ts
│   │
│   ├── project.ts
│   │   ├── Project.ts
│   │   ├── ProjectCreate.ts
│   │   └── ProjectUpdate.ts
│   │
│   ├── panel.ts
│   │   ├── Panel.ts
│   │   ├── PanelBBox.ts
│   │   ├── PanelMask.ts
│   │   └── PanelCreate.ts
│   │
│   ├── render.ts
│   │   ├── RenderJob.ts
│   │   ├── RenderSettings.ts
│   │   ├── RenderStatus.ts
│   │   └── RenderProgress.ts
│   │
│   ├── timeline.ts
│   │   ├── BeatMarker.ts
│   │   ├── Transition.ts
│   │   └── TimelineTrack.ts
│   │
│   ├── api.ts
│   │   ├── ApiResponse.ts
│   │   ├── ApiError.ts
│   │   └── Pagination.ts
│   │
│   └── index.ts
│
├── utils/
│   ├── constants.ts
│   ├── validation.ts
│   └── index.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

### Database Package (packages/database)

```
packages/database/
├── src/
│   ├── connection.ts       # MongoDB connection
│   ├── client.ts           # MongoDB client
│   ├── collections.ts      # Collection names
│   ├── transactions.ts     # Transaction helpers
│   └── index.ts
│
├── schemas/               # Mongoose schemas
│   ├── userSchema.ts
│   ├── projectSchema.ts
│   ├── panelSchema.ts
│   ├── renderJobSchema.ts
│   └── index.ts
│
├── repositories/         # Repository implementations
│   ├── BaseRepository.ts
│   ├── UserRepository.ts
│   ├── ProjectRepository.ts
│   ├── PanelRepository.ts
│   ├── RenderJobRepository.ts
│   └── index.ts
│
├── migrations/           # Database migrations
│   ├── 001_initial_schema.ts
│   └── index.ts
│
├── seeders/              # Database seeders
│   ├── userSeeder.ts
│   └── index.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

### Cache Package (packages/cache)

```
packages/cache/
├── src/
│   ├── client.ts          # Redis client
│   ├── connection.ts      # Connection management
│   ├── keys.ts           # Key naming conventions
│   ├── serializers.ts    # Data serialization
│   ├── decorators.ts     # Cache decorators
│   │   ├── cached.ts
│   │   └── invalidate.ts
│   ├── middleware.ts     # Cache middleware
│   └── index.ts
│
├── patterns/             # Caching patterns
│   ├── userCache.ts
│   ├── projectCache.ts
│   └── renderCache.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

### S3 Package (packages/s3)

```
packages/s3/
├── src/
│   ├── client.ts          # S3 client
│   ├── buckets.ts         # Bucket definitions
│   ├── presigned.ts       # Presigned URL generation
│   ├── upload.ts          # Upload helpers
│   ├── download.ts        # Download helpers
│   ├── copy.ts            # Copy operations
│   ├── delete.ts          # Delete operations
│   └── index.ts
│
├── types/                 # TypeScript types
│   ├── s3.ts
│   └── index.ts
│
├── paths/                 # Path utilities
│   ├── manga.ts
│   ├── panels.ts
│   ├── audio.ts
│   └── exports.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

---

## Kubernetes Configuration (k8s)

```
k8s/
├── base/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── service.yaml
│   ├── deployment.yaml
│   ├── pvc.yaml
│   └── network-policy.yaml
│
├── components/
│   ├── api/
│   │   ├── deployment.yaml
│   │   ├── hpa.yaml
│   │   ├── service.yaml
│   │   └── pod-disruption-budget.yaml
│   │
│   ├── worker/
│   │   ├── deployment.yaml
│   │   ├── hpa.yaml
│   │   └── service.yaml
│   │
│   ├── mongodb/
│   ├── redis/
│   │   ├── deployment.yaml
│   │   └── service.yaml
│   │
│   └── web/
│       ├── deployment.yaml
│       ├── service.yaml
│       └── ingress.yaml
│
├── overlays/
│   ├── development/
│   │   ├── kustomization.yaml
│   │   └── patches/
│   │
│   └── production/
│       ├── kustomization.yaml
│       ├── patches/
│       │   ├── scale.yaml
│       │   └── resources.yaml
│       └── secrets.enc.yaml
│
└── scripts/
    ├── deploy.sh
    ├── scale.sh
    └── rollback.sh
```

---

## Documentation (docs)

```
docs/
├── architecture/
│   ├── system-overview.md
│   ├── frontend-architecture.md
│   ├── backend-architecture.md
│   ├── ml-architecture.md
│   └── infrastructure.md
│
├── api/
│   ├── authentication.md
│   ├── projects.md
│   ├── panels.md
│   ├── rendering.md
│   └── webhooks.md
│
├── ml/
│   ├── detection.md
│   ├── segmentation.md
│   ├── depth-estimation.md
│   ├── animation.md
│   └── audio-analysis.md
│
├── guides/
│   ├── getting-started.md
│   ├── local-development.md
│   ├── deployment.md
│   └── troubleshooting.md
│
├── assets/
│   ├── diagrams/
│   │   ├── architecture.svg
│   │   ├── data-flow.svg
│   │   └── pipeline.svg
│   ├── images/
│   └── fonts/
│
└── index.md
```

---

## Key Architectural Decisions

### Monorepo Structure

We use **Turborepo** for managing the monorepo because:
- Shared code between apps is versioned together
- Dependency management is centralized
- Build caching speeds up CI/CD
- Easy to add new applications

### Package Organization

- **packages/shared**: Types and utilities used by all apps
- **packages/database**: MongoDB connection and schemas
- **packages/cache**: Redis utilities
- **packages/s3**: AWS S3 helpers

### Normalized Coordinates

> **CRITICAL**: All panel coordinates are normalized between 0.0 and 1.0 to ensure scale-invariance between Python (ML) and React (Frontend).

```typescript
// Example normalized coordinates
interface NormalizedBBox {
  x: number;      // 0.0 to 1.0
  y: number;      // 0.0 to 1.0
  width: number;  // 0.0 to 1.0
  height: number;  // 0.0 to 1.0
}
```

### Environment-Specific Files

| File | Purpose |
|------|---------|
| `.env` | Local development (not committed) |
| `.env.example` | Template for environment variables |
| `.env.local` | Local overrides (not committed) |
| `.env.production` | Production secrets |

---

## Import Aliases

We use path aliases for cleaner imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@shared/*": ["../../packages/shared/src/*"],
      "@database/*": ["../../packages/database/src/*"],
      "@cache/*": ["../../packages/cache/src/*"],
      "@s3/*": ["../../packages/s3/src/*"]
    }
  }
}
```
