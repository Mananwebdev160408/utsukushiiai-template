# UtsukushiiAI Skills and Constraints for Code Agents

This document defines the skills, constraints, and best practices that code agents (such as Cursor, Copilot, or other AI assistants) must follow when building the UtsukushiiAI project.

---

## Table of Contents

1. [Required Skills](#required-skills)
2. [Core Constraints](#core-constraints)
3. [Frontend Guidelines](#frontend-guidelines)
4. [Backend Guidelines](#backend-guidelines)
5. [ML Worker Guidelines](#ml-worker-guidelines)
6. [Database Guidelines](#database-guidelines)
7. [Security Guidelines](#security-guidelines)
8. [Testing Guidelines](#testing-guidelines)
9. [Documentation Guidelines](#documentation-guidelines)

---

## Required Skills

### External Skills (from Skills.sh)

Code agents must utilize the following external skills when available:

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `vercel-react-best-practices` | Next.js optimization | Building frontend components |
| `eslint-config-next` | Linting Next.js code | Code quality checks |
| `prettier-config` | Code formatting | All files |
| `typescript-best-practices` | TypeScript usage | TypeScript code |
| `docker-best-practices` | Container optimization | Dockerfile creation |
| `k8s-best-practices` | Kubernetes deployment | K8s manifests |

### Internal Skills

Code agents must implement these custom skills:

| Skill | Purpose | Files to Modify |
|-------|---------|-----------------|
| `utsukushii-core` | Core constraints | All |
| `utsukushii-ml-pipeline` | ML pipeline setup | apps/worker |
| `utsukushii-canvas` | Canvas interactions | apps/web |
| `utsukushii-render` | Render system | apps/api, apps/worker |

---

## Core Constraints

### Constraint 1: Normalized Coordinates

> **CRITICAL**: All coordinate data must be normalized between 0.0 and 1.0 to ensure scale-invariance between Python (ML) and React (Frontend).

```typescript
// ✅ CORRECT: Normalized coordinates (0.0 to 1.0)
interface NormalizedBBox {
  x: number;      // 0.0 = left edge, 1.0 = right edge
  y: number;      // 0.0 = top edge, 1.0 = bottom edge
  width: number;  // 0.0 to 1.0
  height: number; // 0.0 to 1.0
}

// ❌ WRONG: Pixel coordinates
interface PixelBBox {
  x: number;      // 0 to imageWidth
  y: number;      // 0 to imageHeight
  width: number;  // pixels
  height: number; // pixels
}
```

**Conversion utilities must be provided:**
```typescript
// packages/shared/src/utils/coordinates.ts
export function denormalizeBBox(
  bbox: NormalizedBBox,
  imageWidth: number,
  imageHeight: number
): PixelBBox {
  return {
    x: bbox.x * imageWidth,
    y: bbox.y * imageHeight,
    width: bbox.width * imageWidth,
    height: bbox.height * imageHeight,
  };
}

export function normalizeBBox(
  bbox: PixelBBox,
  imageWidth: number,
  imageHeight: number
): NormalizedBBox {
  return {
    x: bbox.x / imageWidth,
    y: bbox.y / imageHeight,
    width: bbox.width / imageWidth,
    height: bbox.height / imageHeight,
  };
}
```

### Constraint 2: Async Video Processing

> **CRITICAL**: Never block the Express event loop; always offload video tasks to the FastAPI worker.

```typescript
// ✅ CORRECT: Offload to worker
app.post('/api/render/start', async (req, res) => {
  const job = await renderService.enqueueJob(projectId, settings);
  
  // Return immediately with job ID
  res.json({ jobId: job.id, status: 'queued' });
  
  // Worker processes in background
});

// ❌ WRONG: Blocking the event loop
app.post('/api/render/start', async (req, res) => {
  // This blocks the server!
  const result = await renderService.processRenderSync(projectId, settings);
  res.json(result);
});
```

### Constraint 3: No Secrets in Code

> **CRITICAL**: Never commit secrets, API keys, or credentials to the repository.

```typescript
// ✅ CORRECT: Use environment variables
const apiKey = process.env.OPENAI_API_KEY;
const dbPassword = process.env.MONGODB_PASSWORD;

// ❌ WRONG: Hardcoded secrets
const apiKey = "sk-1234567890abcdef";
const dbPassword = "mySecretPassword123";
```

### Constraint 4: Type Safety

> **CRITICAL**: All code must be type-safe. Use TypeScript for all new code. Avoid `any` type.

```typescript
// ✅ CORRECT: Proper types
interface Project {
  id: string;
  title: string;
  panels: Panel[];
}

// ❌ WRONG: Using 'any'
interface Project {
  id: any;
  title: any;
  panels: any;
}
```

---

## Frontend Guidelines

### Next.js Best Practices

1. **Use App Router**: All new pages must use Next.js 15 App Router
2. **Server Components**: Default to Server Components; use `'use client'` only when needed
3. **Route Groups**: Use route groups `(auth)`, `(dashboard)` for organization
4. **Server Actions**: Use Server Actions for data mutations

```typescript
// ✅ CORRECT: Server Component with client island
// app/projects/page.tsx (Server Component)
import { ProjectList } from '@/components/project/ProjectList';

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectList projects={projects} />;
}

// components/project/ProjectList.tsx (Client Component)
'use client';

export function ProjectList({ projects }: { projects: Project[] }) {
  // Interactive logic here
}
```

### State Management (Zustand)

1. **Single Store**: Each domain has its own store
2. **Selectors**: Use selectors for derived state
3. **Immutability**: Never mutate state directly

```typescript
// ✅ CORRECT: Zustand store with proper patterns
interface ProjectStore {
  project: Project | null;
  panels: Panel[];
  setProject: (project: Project) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
}

const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  panels: [],
  setProject: (project) => set({ project, panels: project.panels }),
  updatePanel: (id, updates) =>
    set((state) => ({
      panels: state.panels.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
}));
```

### Component Patterns

1. **Presentational Components**: Pure UI, receive props, no hooks
2. **Container Components**: Connect to stores, handle data fetching
3. **Compound Components**: Share state via context

```typescript
// Presentational Component
function Button({ children, onClick, variant }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`)} onClick={onClick}>
      {children}
    </button>
  );
}

// Container Component
function ProjectButton({ projectId }: { projectId: string }) {
  const { deleteProject } = useProjectActions();
  return <Button onClick={() => deleteProject(projectId)}>Delete</Button>;
}
```

### Canvas Implementation

1. **Normalized Coordinates**: Always convert to/from normalized coordinates
2. **Debounced Updates**: Debounce panel coordinate updates
3. **Undo/Redo**: Implement undo/redo for canvas operations

```typescript
// ✅ CORRECT: Canvas with normalized coordinates
function Canvas({ imageUrl, panels, onPanelUpdate }) {
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  
  const handlePanelDrag = useCallback(
    debounce((panelId: string, bbox: NormalizedBBox) => {
      onPanelUpdate(panelId, bbox);
    }, 150),
    [onPanelUpdate]
  );
  
  return (
    <div className="canvas-container">
      <img src={imageUrl} alt="Manga page" />
      {panels.map((panel) => (
        <BoundingBox
          key={panel.id}
          bbox={panel.bbox} // Always normalized!
          isSelected={selectedPanel === panel.id}
          onChange={(newBBox) => handlePanelDrag(panel.id, newBBox)}
        />
      ))}
    </div>
  );
}
```

---

## Backend Guidelines

### Express.js Architecture

1. **Layered Architecture**: Controllers → Services → Repositories
2. **Dependency Injection**: Inject dependencies, don't import directly
3. **Error Handling**: Centralized error handling middleware

```typescript
// ✅ CORRECT: Layered architecture
// controllers/projectController.ts
export class ProjectController {
  constructor(
    private projectService: IProjectService,
    private renderService: IRenderService
  ) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await this.projectService.create(req.user.id, req.body);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
}

// services/projectService.ts
export class ProjectService implements IProjectService {
  constructor(
    private projectRepository: IProjectRepository,
    private s3Service: IS3Service
  ) {}

  async create(userId: string, data: CreateProjectDTO): Promise<Project> {
    // Business logic here
  }
}
```

### API Design

1. **RESTful**: Follow REST conventions
2. **Consistent Response Format**: Always wrap responses
3. **Pagination**: Support pagination for list endpoints

```typescript
// ✅ CORRECT: Consistent response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: Pagination;
}

// GET /api/projects
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### WebSocket Usage

1. **Namespace**: Use `/render` namespace for render events
2. **Room**: Join project room for project-specific updates
3. **Reconnection**: Implement auto-reconnection

```typescript
// Server-side
io.of('/render').on('connection', (socket) => {
  socket.on('join', (projectId) => {
    socket.join(`project:${projectId}`);
  });
});

// Emit progress
io.of('/render').to(`project:${projectId}`).emit('progress', {
  jobId,
  progress: 50,
  stage: 'detecting',
});
```

---

## ML Worker Guidelines

### FastAPI Structure

1. **Modular Routes**: Separate routes for each pipeline stage
2. **Background Tasks**: Use background tasks for long-running operations
3. **Model Loading**: Lazy load models to reduce startup time

```python
# ✅ CORRECT: Modular routes
# routes/detection.py
@router.post("/detect/panels")
async def detect_panels(request: PanelDetectionRequest):
    result = await detection_pipeline.execute(request.image_url)
    return result

# routes/segmentation.py
@router.post("/segment/masks")
async def generate_masks(request: MaskRequest):
    result = await segmentation_pipeline.execute(request)
    return result

# routes/render.py
@router.post("/render/start")
async def start_render(request: RenderRequest, background_tasks: BackgroundTasks):
    job_id = await queue_service.enqueue(request)
    background_tasks.add_task(processing_worker.process, job_id)
    return {"job_id": job_id, "status": "queued"}
```

### Pipeline Implementation

1. **Async/Await**: All pipeline methods must be async
2. **Progress Reporting**: Report progress via callbacks
3. **Cleanup**: Clean up temporary files after processing

```python
# ✅ CORRECT: Async pipeline with progress
class DetectionPipeline:
    async def execute(
        self,
        image_url: str,
        on_progress: Optional[Callable] = None
    ) -> DetectionResult:
        # Download image
        if on_progress:
            on_progress(Progress(stage="download", percent=0))
        
        image = await self._download_image(image_url)
        
        # Run detection
        if on_progress:
            on_progress(Progress(stage="detect", percent=30))
        
        bboxes = await self._detect_panels(image)
        
        # Normalize coordinates (CRITICAL!)
        normalized_bboxes = [
            self._normalize_bbox(bbox, image.size)
            for bbox in bboxes
        ]
        
        if on_progress:
            on_progress(Progress(stage="complete", percent=100))
        
        return DetectionResult(panels=normalized_bboxes)
```

### Model Management

1. **Lazy Loading**: Load models on first use
2. **Caching**: Cache models in memory
3. **Device Placement**: Explicitly place on CPU/GPU

```python
# ✅ CORRECT: Lazy model loading
class YOLODetector:
    _model = None
    
    @classmethod
    async def get_model(cls, device: str = "cuda"):
        if cls._model is None:
            cls._model = await asyncio.to_thread(
                YOLOv12, 
                model_path=MODEL_PATH,
                device=device
            )
        return cls._model
    
    async def detect(self, image: Image) -> List[BoundingBox]:
        model = await self.get_model()
        results = model.predict(image)
        return results
```

---

## Database Guidelines

### MongoDB Schema

1. **Normalized Data**: Reference other collections by ID
2. **Indexes**: Create indexes for frequently queried fields
3. **Validation**: Use Mongoose validation

```typescript
// ✅ CORRECT: Proper schema with validation
const panelSchema = new Schema<Panel>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'projects',
      required: true,
      index: true,
    },
    bbox: {
      x: { type: Number, required: true, min: 0, max: 1 },
      y: { type: Number, required: true, min: 0, max: 1 },
      width: { type: Number, required: true, min: 0, max: 1 },
      height: { type: Number, required: true, min: 0, max: 1 },
    },
    maskUrl: { type: String },
    depthMapUrl: { type: String },
    order: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

panelSchema.index({ projectId: 1, order: 1 });
```

### Repository Pattern

1. **Interface**: Define repository interface
2. **Implementation**: Concrete implementation
3. **Transactions**: Use transactions for multi-document operations

```typescript
// ✅ CORRECT: Repository pattern
interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string, pagination: Pagination): Promise<PaginatedResult<Project>>;
  create(data: CreateProjectDTO): Promise<Project>;
  update(id: string, data: UpdateProjectDTO): Promise<Project>;
  delete(id: string): Promise<void>;
}

class ProjectRepository implements IProjectRepository {
  constructor(private db: Db) {}
  
  async findById(id: string): Promise<Project | null> {
    return this.db.collection<Project>('projects').findOne({ _id: new ObjectId(id) });
  }
}
```

---

## Security Guidelines

### Authentication

1. **JWT Tokens**: Use short-lived access tokens
2. **Refresh Tokens**: Implement refresh token rotation
3. **Password Hashing**: Use bcrypt with cost factor 12+

```typescript
// ✅ CORRECT: Secure authentication
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

async function authenticate(email: string, password: string) {
  const user = await userRepository.findByEmail(email);
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid credentials');
  }
  
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}
```

### Input Validation

1. **Zod**: Use Zod for schema validation
2. **Sanitization**: Sanitize user inputs
3. **Rate Limiting**: Implement rate limiting

```typescript
// ✅ CORRECT: Input validation with Zod
const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  aspectRatio: z.enum(['9:16', '16:9', '1:1']),
  settings: renderSettingsSchema.optional(),
});

export async function createProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const result = createProjectSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        details: result.error.flatten(),
      },
    });
  }
  
  // Proceed with validated data
}
```

### CORS Configuration

```typescript
// ✅ CORRECT: Strict CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## Testing Guidelines

### Unit Tests

1. **Coverage**: Aim for 80% code coverage
2. **Naming**: Use descriptive test names
3. **Isolation**: Mock external dependencies

```typescript
// ✅ CORRECT: Unit test with mocks
describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepository: jest.Mocked<IProjectRepository>;
  let mockS3Service: jest.Mocked<IS3Service>;
  
  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      // ...
    };
    mockS3Service = {
      generatePresignedUrl: jest.fn(),
      // ...
    };
    
    service = new ProjectService(mockRepository, mockS3Service);
  });
  
  describe('create', () => {
    it('should create a project with generated URL', async () => {
      const input: CreateProjectDTO = {
        title: 'Test Project',
        aspectRatio: '9:16',
      };
      
      mockRepository.create.mockResolvedValue({
        id: '123',
        ...input,
      } as Project);
      mockS3Service.generatePresignedUrl.mockResolvedValue('https://s3...');
      
      const result = await service.create('user-1', input);
      
      expect(result.title).toBe('Test Project');
      expect(mockS3Service.generatePresignedUrl).toHaveBeenCalled();
    });
  });
});
```

### Integration Tests

```typescript
// ✅ CORRECT: Integration test
describe('Projects API', () => {
  const app = createTestApp();
  
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    await teardownTestDatabase();
  });
  
  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: 'Test Project',
          aspectRatio: '9:16',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
```

---

## Documentation Guidelines

### Code Documentation

1. **JSDoc**: Document all public APIs
2. **Types**: Use TypeScript types instead of JSDoc where possible
3. **Examples**: Include usage examples for complex functions

```typescript
/**
 * Creates a new project for the user.
 * 
 * @param userId - The ID of the user creating the project
 * @param data - Project creation data
 * @returns The created project with presigned upload URL
 * 
 * @example
 * ```typescript
 * const project = await projectService.create('user-123', {
 *   title: 'My MMV',
 *   aspectRatio: '9:16'
 * });
 * ```
 */
async function createProject(
  userId: string,
  data: CreateProjectDTO
): Promise<ProjectWithUrl> {
  // Implementation
}
```

### README Files

Each package must have a README.md with:
1. Installation instructions
2. Usage examples
3. API reference
4. Environment variables

---

## Error Codes

Use consistent error codes across the application:

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| `UPLOAD_FAILED` | File upload failed |
| `RENDER_FAILED` | Video render failed |

---

## Version Control

### Git Flow

1. **Main Branch**: Production-ready code only
2. **Develop Branch**: Integration branch
3. **Feature Branches**: `feature/description`
4. **Bug Fix Branches**: `fix/description`
5. **Hotfix Branches**: `hotfix/description`

### Commit Messages

Follow Conventional Commits:

```
feat: add panel detection API
fix: resolve coordinate normalization bug
docs: update API documentation
refactor: separate concerns in render service
test: add unit tests for audio analyzer
chore: update dependencies
```

---

## Performance Guidelines

### Frontend

1. **Code Splitting**: Use dynamic imports for heavy components
2. **Memoization**: Memoize expensive computations
3. **Image Optimization**: Use Next.js Image component

### Backend

1. **Database Indexes**: Index frequently queried fields
2. **Caching**: Cache expensive operations in Redis
3. **Pagination**: Always paginate list endpoints

### ML Worker

1. **GPU Memory**: Monitor and optimize GPU memory usage
2. **Batch Processing**: Process multiple items in batches when possible
3. **Model Quantization**: Use quantized models for inference

---

## Summary

Code agents building UtsukushiiAI must:

1. ✅ Use **normalized coordinates** (0.0-1.0) for all panel data
2. ✅ **Never block** the Express event loop with video processing
3. ✅ Use **TypeScript** with proper types (no `any`)
4. ✅ Follow **SOLID principles** in all code
5. ✅ Implement **layered architecture** (Controllers → Services → Repositories)
6. ✅ Use **Zustand** for frontend state management
7. ✅ Use **FastAPI** with async pipelines for ML
8. ✅ Implement **proper error handling** and validation
9. ✅ Write **unit tests** for business logic
10. ✅ Never commit **secrets** to the repository
11. ✅ Document all **public APIs** with JSDoc/TypeScript types
12. ✅ Follow **RESTful** API design principles
