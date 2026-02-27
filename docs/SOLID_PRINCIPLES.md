# SOLID Principles Implementation Guide

This document outlines how SOLID principles are applied throughout the UtsukushiiAI project to ensure maintainability, scalability, and code quality.

---

## Table of Contents

1. [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
2. [Open/Closed Principle (OCP)](#openclosed-principle-ocp)
3. [Liskov Substitution Principle (LSP)](#liskov-substitution-principle-lsp)
4. [Interface Segregation Principle (ISP)](#interface-segregation-principle-isp)
5. [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
6. [Application in Each Layer](#application-in-each-layer)

---

## Single Responsibility Principle (SRP)

> **A class should have one, and only one, reason to change.**

### Implementation

Each class has a single, focused responsibility:

```
src/
├── controllers/     # Handle HTTP requests only
├── services/        # Business logic only
├── repositories/   # Data access only
├── models/         # Domain entities only
└── utils/          # Utility functions only
```

### Examples

#### ❌ WRONG: Controller with multiple responsibilities

```typescript
class ProjectController {
  async create(req, res) {
    // Validation
    const project = this.validate(req.body);
    
    // Database operation
    const saved = await this.projectRepo.save(project);
    
    // Email notification
    await this.emailService.sendProjectCreated(saved);
    
    // Logging
    this.logger.info('Project created');
    
    res.json(saved);
  }
}
```

#### ✅ CORRECT: Separated responsibilities

```typescript
// Controller: Only handles HTTP
class ProjectController {
  constructor(
    private projectService: IProjectService,
    private validationMiddleware: ValidationMiddleware
  ) {}

  @route.post('/projects')
  @middleware(this.validationMiddleware.validate(CreateProjectSchema))
  async create(req: Request, res: Response) {
    const project = await this.projectService.createProject(req.user.id, req.body);
    res.status(201).json(project);
  }
}

// Service: Business logic
class ProjectService implements IProjectService {
  constructor(
    private projectRepository: IProjectRepository,
    private notificationService: INotificationService,
    private logger: ILogger
  ) {}

  async createProject(userId: string, data: CreateProjectDTO): Promise<Project> {
    const project = await this.projectRepository.create({ ...data, userId });
    this.logger.info('Project created', { projectId: project.id });
    await this.notificationService.notifyProjectCreated(project);
    return project;
  }
}

// Repository: Data access only
class ProjectRepository implements IProjectRepository {
  async create(data: CreateProjectDTO): Promise<Project> {
    return this.db.collection('projects').insertOne(data);
  }
}
```

### Benefits

- Easier to understand and maintain
- Changes in one area don't affect others
- Easier to test each component in isolation

---

## Open/Closed Principle (OCP)

> **Software entities should be open for extension but closed for modification.**

### Implementation

Use strategies, plugins, and inheritance to extend behavior without modifying existing code:

### Examples

#### ❌ WRONG: Adding new features requires modifying existing code

```typescript
class RenderService {
  async render(projectId: string, settings: RenderSettings) {
    if (settings.format === 'mp4') {
      // MP4 rendering logic
    } else if (settings.format === 'webm') {
      // WebM rendering logic
    } else if (settings.format === 'gif') {
      // GIF rendering logic
    }
    // Every new format requires modifying this method!
  }
}
```

#### ✅ CORRECT: Use strategy pattern for extensibility

```typescript
// Strategy Interface
interface RenderStrategy {
  render(frames: Frame[], settings: RenderSettings): Promise<Buffer>;
}

// Concrete Strategies
class MP4RenderStrategy implements RenderStrategy {
  async render(frames: Frame[], settings: RenderSettings): Promise<Buffer> {
    return ffmpeg.render(frames, { codec: 'h264', format: 'mp4' });
  }
}

class WebMRenderStrategy implements RenderStrategy {
  async render(frames: Frame[], settings: RenderSettings): Promise<Buffer> {
    return ffmpeg.render(frames, { codec: 'vp9', format: 'webm' });
  }
}

class GIFRenderStrategy implements RenderStrategy {
  async render(frames: Frame[], settings: RenderSettings): Promise<Buffer> {
    return ffmpeg.render(frames, { format: 'gif' });
  }
}

// Factory to create strategies
class RenderStrategyFactory {
  private strategies: Map<string, RenderStrategy> = new Map();

  register(format: string, strategy: RenderStrategy) {
    this.strategies.set(format, strategy);
  }

  get(format: string): RenderStrategy {
    const strategy = this.strategies.get(format);
    if (!strategy) {
      throw new Error(`Unknown format: ${format}`);
    }
    return strategy;
  }
}

// Service uses strategies
class RenderService {
  constructor(private strategyFactory: RenderStrategyFactory) {}

  async render(projectId: string, settings: RenderSettings) {
    const strategy = this.strategyFactory.get(settings.format);
    const frames = await this.getFrames(projectId);
    return strategy.render(frames, settings);
  }
}
```

### Adding New Formats

```typescript
// Adding a new format doesn't require modifying existing code
class AV1RenderStrategy implements RenderStrategy {
  async render(frames: Frame[], settings: RenderSettings): Promise<Buffer> {
    return ffmpeg.render(frames, { codec: 'av1', format: 'mp4' });
  }
}

strategyFactory.register('av1', new AV1RenderStrategy());
```

---

## Liskov Substitution Principle (LSP)

> **Objects of a superclass should be replaceable with objects of its subclasses without affecting correctness.**

### Implementation

Subclasses must maintain the behavior expected by the parent class:

#### ❌ WRONG: Subclass changes expected behavior

```typescript
class BaseRepository {
  findById(id: string): Promise<Entity | null> {
    return this.db.find(id);
  }
  
  findAll(limit: number = 100): Promise<Entity[]> {
    return this.db.findMany({ limit });
  }
}

class UserRepository extends BaseRepository {
  // LSP Violation: Returns empty array instead of null
  findById(id: string): Promise<User[] | null> {  // Different return type!
    return this.db.findMany({ where: { id }, limit: 1 });
  }
}
```

#### ✅ CORRECT: Subclass maintains parent contract

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(limit?: number): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class BaseRepository<T> implements IRepository<T> {
  constructor(protected db: Database) {}
  
  async findById(id: string): Promise<T | null> {
    return this.db.collection.findOne({ _id: id });
  }
  
  async findAll(limit: number = 100): Promise<T[]> {
    return this.db.collection.findMany({}).limit(limit).toArray();
  }
  
  async create(data: Partial<T>): Promise<T> {
    return this.db.collection.insertOne(data);
  }
  
  async update(id: string, data: Partial<T>): Promise<T> {
    return this.db.collection.findOneAndUpdate({ _id: id }, { $set: data });
  }
  
  async delete(id: string): Promise<void> {
    await this.db.collection.deleteOne({ _id: id });
  }
}

class UserRepository extends BaseRepository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.db.collection.findOne({ email });
  }
  
  async findByRole(role: string): Promise<User[]> {
    return this.db.collection.findMany({ role });
  }
}
```

### For ML Pipelines

```typescript
interface IPipeline {
  execute(input: PipelineInput): Promise<PipelineOutput>;
  validate(input: PipelineInput): ValidationResult;
}

abstract class BasePipeline implements IPipeline {
  abstract execute(input: PipelineInput): Promise<PipelineOutput>;
  
  validate(input: PipelineInput): ValidationResult {
    if (!input.imageUrl) {
      return { valid: false, errors: ['Image URL is required'] };
    }
    return { valid: true, errors: [] };
  }
}

class DetectionPipeline extends BasePipeline {
  async execute(input: PipelineInput): Promise<DetectionOutput> {
    // Detection-specific logic
  }
}

// Can be substituted anywhere IPipeline is expected
async function runPipeline(pipeline: IPipeline, input: PipelineInput) {
  const validation = pipeline.validate(input);
  if (!validation.valid) {
    throw new ValidationError(validation.errors);
  }
  return pipeline.execute(input);
}
```

---

## Interface Segregation Principle (ISP)

> **Clients should not be forced to depend on interfaces they do not use.**

### Implementation

Create small, focused interfaces rather than large, general-purpose ones:

#### ❌ WRONG: Fat interface forces unnecessary dependencies

```typescript
interface IProjectService {
  createProject(data: CreateProjectDTO): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  getProject(id: string): Promise<Project>;
  listProjects(userId: string): Promise<Project[]>;
  
  uploadManga(projectId: string, file: File): Promise<void>;
  uploadAudio(projectId: string, file: File): Promise<void>;
  
  startRender(projectId: string, settings: RenderSettings): Promise<RenderJob>;
  cancelRender(jobId: string): Promise<void>;
  
  analyzeAudio(projectId: string): Promise<AudioAnalysis>;
  detectPanels(projectId: string): Promise<Panel[]>;
}
```

#### ✅ CORRECT: Segregated interfaces

```typescript
// Focused interfaces
interface IProjectCrudService {
  createProject(userId: string, data: CreateProjectDTO): Promise<Project>;
  getProject(id: string): Promise<Project>;
  listProjects(userId: string, pagination: PaginationaginatedResult<Project>>;
  updateProject(id:): Promise<P string, data: UpdateProjectDTO): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

interface IAssetService {
  uploadManga(projectId: string, file: File): Promise<MangaAsset>;
  uploadAudio(projectId: string, file: File): Promise<AudioAsset>;
  deleteId: string): Promise<void>;
}

interface IRenderService {
  startRender(projectId: stringAsset(asset, settings: RenderSettings): Promise<RenderJob>;
  getRenderStatus(jobId: string): Promise<RenderJob>;
  cancelRender(jobId: string): Promise<void>;
}

interface IAnalysisService {
  detectPanels(projectId: string): Promise<Panel[]>;
  analyzeAudio(projectId: string): Promise<AudioAnalysis>;
}

// Controllers depend only on what they need
class ProjectController {
  constructor(
    private projectService: IProjectCrudService,
    private assetService: IAssetService,
    private renderService: IRenderService,
    private analysisService: IAnalysisService
  ) {}
}
```

### TypeScript Utility Types for ISP

```typescript
// Extract only needed methods
type ProjectReader = Pick<IProjectCrudService, 'getProject' | 'listProjects'>;

// Exclude unneeded methods  
type ProjectWriter = Omit<IProjectCrudService, 'getProject' | 'listProjects'>;
```

---

## Dependency Inversion Principle (DIP)

> **High-level modules should not depend on low-level modules. Both should depend on abstractions.**

### Implementation

Depend on abstractions (interfaces), not concrete implementations:

#### ❌ WRONG: Direct dependency on concrete classes

```typescript
class ProjectService {
  private mongoRepo = new MongoProjectRepository();
  private s3Client = new S3Client();
  private emailService = new SendGridEmailService();
  
  async createProject(data: CreateProjectDTO) {
    const project = await this.mongoRepo.create(data);
    await this.s3Client.upload(project.thumbnailUrl);
    await this.emailService.sendWelcomeEmail(data.email);
    return project;
  }
}
```

#### ✅ CORRECT: Depend on interfaces

```typescript
// Define interfaces in separate package (packages/shared)
interface IProjectRepository {
  create(data: CreateProjectDTO): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  update(id: string, data: UpdateProjectDTO): Promise<Project>;
  delete(id: string): Promise<void>;
}

interface IStorageService {
  upload(file: Buffer, path: string): Promise<string>;
  delete(path: string): Promise<void>;
}

interface INotificationService {
  sendEmail(to: string, template: string, data: Record<string, any>): Promise<void>;
}

// Implementations in app layer
class MongoProjectRepository implements IProjectRepository {
  constructor(private db: Database) {}
  
  async create(data: CreateProjectDTO): Promise<Project> {
    return this.db.collection('projects').insertOne(data);
  }
  // ...
}

class S3StorageService implements IStorageService {
  constructor(private s3Client: S3Client) {}
  
  async upload(file: Buffer, path: string): Promise<string> {
    return this.s3Client.upload(file, path);
  }
  // ...
}

class SendGridNotificationService implements INotificationService {
  constructor(private sendGrid: SendGridClient) {}
  
  async sendEmail(to: string, template: string, data: Record<string, any>) {
    await this.sendGrid.send({ to, template, data });
  }
}

// Dependencies injected via constructor
class ProjectService {
  constructor(
    private projectRepository: IProjectRepository,
    private storageService: IStorageService,
    private notificationService: INotificationService
  ) {}

  async createProject(data: CreateProjectDTO): Promise<Project> {
    const project = await this.projectRepository.create(data);
    await this.notificationService.sendEmail(data.email, 'welcome', { name: data.displayName });
    return project;
  }
}

// DI Container / Factory
class ServiceFactory {
  createProjectService(): IProjectCrudService {
    return new ProjectService(
      new MongoProjectRepository(database),
      new S3StorageService(s3Client),
      new SendGridNotificationService(sendGrid)
    );
  }
}
```

### Dependency Injection in Express

```typescript
// Middleware that provides dependencies
const container = new DIContainer();

app.use((req, res, next) => {
  req.services = {
    projectService: container.resolve(IProjectCrudService),
    renderService: container.resolve(IRenderService),
  };
  next();
});

app.post('/projects', async (req, res) => {
  const project = await req.services.projectService.createProject(req.user.id, req.body);
  res.json(project);
});
```

---

## Application in Each Layer

### Frontend (Next.js/React)

#### Single Responsibility: Custom Hooks

```typescript
// hooks/useProject.ts - Only handles project-related logic
export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [panels, setPanels] = useState<Panel[]>([]);
  
  const fetchProject = useCallback(async () => {
    const data = await api.projects.get(projectId);
    setProject(data);
    setPanels(data.panels);
  }, [projectId]);
  
  const updatePanel = useCallback(async (panelId: string, updates: Partial<Panel>) => {
    await api.panels.update(projectId, panelId, updates);
    setPanels(prev => prev.map(p => p.id === panelId ? { ...p, ...updates } : p));
  }, [projectId]);
  
  return { project, panels, fetchProject, updatePanel };
};
```

#### Dependency Inversion: Stores

```typescript
// stores/projectStore defines contract.ts - Interface
interface IProjectStore {
  project: Project | null;
  panels: Panel[];
  isLoading: boolean;
  
  fetchProject(id: string): Promise<void>;
  updatePanel(id: string, updates: Partial<Panel>): Promise<void>;
}

// Zustand store implements the interface
const useProjectStore = create<IProjectStore>((set, get) => ({
  project: null,
  panels: [],
  isLoading: false,
  
  fetchProject: async (id: string) => {
    set({ isLoading: true });
    const project = await api.projects.get(id);
    set({ project, panels: project.panels, isLoading: false });
  },
  
  updatePanel: async (id: string, updates: Partial<Panel>) => {
    await api.panels.update(get().project!.id, id, updates);
    set(state => ({
      panels: state.panels.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  }
}));
```

---

### Backend (Express.js)

#### Single Responsibility: Layered Architecture

```
controllers/     →  Handle HTTP requests/responses
     ↓
services/        →  Business logic
     ↓
repositories/    →  Data access
     ↓
database/        →  Database connection
```

#### Interface Segregation: Route-Specific Services

```typescript
// Each controller uses only what it needs
class ProjectController {
  constructor(
    private createProjectUseCase: ICreateProjectUseCase,
    private listProjectsUseCase: IListProjectsUseCase,
    private deleteProjectUseCase: IDeleteProjectUseCase
  ) {}
  
  async create(req, res) {
    const result = await this.createProjectUseCase.execute(req.body);
    res.json(result);
  }
  
  async list(req, res) {
    const result = await this.listProjectsUseCase.execute(req.query);
    res.json(result);
  }
  
  async delete(req, res) {
    await this.deleteProjectUseCase.execute(req.params.id);
    res.status(204).send();
  }
}
```

---

### ML Worker (FastAPI)

#### Open/Closed: Pipeline Strategy

```python
# pipelines/base.py
class BasePipeline(ABC):
    @abstractmethod
    async def execute(self, input_data: PipelineInput) -> PipelineOutput:
        pass
    
    def validate(self, input_data: PipelineInput) -> ValidationResult:
        # Common validation
        pass

# pipelines/detection.py
class DetectionPipeline(BasePipeline):
    async def execute(self, input_data: ImageInput) -> DetectionOutput:
        # Detection-specific implementation
        pass

# pipelines/composition.py
class CompositionPipeline(BasePipeline):
    async def execute(self, input_data: CompositionInput) -> CompositionOutput:
        # Composition-specific implementation
        pass

# Easy to add new pipelines without modifying existing code
class AnimationPipeline(BasePipeline):
    async def execute(self, input_data: AnimationInput) -> AnimationOutput:
        pass
```

#### Dependency Inversion: Model Injection

```python
# models/base.py
class BaseModel(ABC):
    @abstractmethod
    def predict(self, input_data) -> Output:
        pass

# models/yolo.py
class YOLOModel(BaseModel):
    def __init__(self, model_path: str, device: str = "cuda"):
        self.model = self._load_model(model_path, device)
    
    def predict(self, image) -> DetectionOutput:
        return self.model.predict(image)

# services/detection.py - Depends on abstraction
class DetectionService:
    def __init__(self, model: BaseModel):
        self.model = model
    
    async def detect(self, image_url: str) -> DetectionResult:
        image = await self._load_image(image_url)
        return self.model.predict(image)

# Easy to swap models
detection_service = DetectionService(YOLOModel("yolov12-manga.pt"))
# Or use a different model
detection_service = DetectionService(YOLOMobileModel("yolov8n.pt"))
```

---

## Testing with SOLID

### Unit Testing with Mocks

```typescript
// Easy to test because of dependency injection
describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepository: jest.Mocked<IProjectRepository>;
  let mockNotification: jest.Mocked<INotificationService>;
  
  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    mockNotification = {
      sendEmail: jest.fn(),
    };
    
    service = new ProjectService(mockRepository, mockNotification);
  });
  
  it('should create project and send notification', async () => {
    const input = { title: 'Test', userId: 'user-1' };
    const project = { id: 'proj-1', ...input };
    
    mockRepository.create.mockResolvedValue(project);
    
    const result = await service.createProject(input);
    
    expect(result).toEqual(project);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
    expect(mockNotification.sendEmail).toHaveBeenCalled();
  });
});
```

---

## Summary Table

| Principle | Application | Benefit |
|-----------|-------------|---------|
| **SRP** | Separate controllers, services, repositories | Focused classes, easier maintenance |
| **OCP** | Strategy pattern for render formats | Add features without modifying existing code |
| **LSP** | Subclasses maintain parent contracts | Reliable polymorphism |
| **ISP** | Small, focused interfaces | No unnecessary dependencies |
| **DIP** | Inject dependencies via constructor | Flexible, testable code |

---

## Code Review Checklist

- [ ] Does each class have a single responsibility?
- [ ] Can new features be added without modifying existing code?
- [ ] Can subclasses be substituted for their parents?
- [ ] Are interfaces small and focused?
- [ ] Do high-level modules depend on abstractions?
- [ ] Are dependencies injected rather than created internally?
- [ ] Can components be tested in isolation?
