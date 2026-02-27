# UtsukushiiAI Component Specification

This document provides detailed specifications for all frontend components in the UtsukushiiAI application.

---

## Table of Contents

1. [Component Architecture](#component-architecture)
2. [UI Components](#ui-components)
3. [Feature Components](#feature-components)
4. [Canvas Components](#canvas-components)
5. [Timeline Components](#timeline-components)
6. [Component Patterns](#component-patterns)
7. [State Management](#state-management)

---

## Component Architecture

### Directory Structure

```
src/components/
├── ui/                    # Base UI components (Button, Input, etc.)
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── index.ts
│
├── forge/                 # Upload/Forge components
│   ├── MangaUploader/
│   ├── AudioUploader/
│   └── YouTubeDownloader/
│
├── canvas/                # Canvas editor components
│   ├── Canvas/
│   ├── BoundingBox/
│   ├── LayerManager/
│   └── Toolbar/
│
├── timeline/              # Timeline components
│   ├── Timeline/
│   ├── Waveform/
│   ├── BeatMarker/
│   └── Track/
│
├── render/               # Render components
│   ├── RenderPanel/
│   └── RenderProgress/
│
└── layout/               # Layout components
    ├── Sidebar    ├── Header/
/
    └── Footer/
```

---

## UI Components

### Button

**Path**: `components/ui/Button/Button.tsx`

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

**Usage**:

```tsx
<Button 
  variant="primary" 
  size="md"
  onClick={handleClick}
>
  Create Project
</Button>
```

### Input

**Path**: `components/ui/Input/Input.tsx`

```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'number' | 'search';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  isRequired?: boolean;
}
```

### Modal

**Path**: `components/ui/Modal/Modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}
```

---

## Feature Components

### MangaUploader

**Path**: `components/forge/MangaUploader/MangaUploader.tsx`

```typescript
interface MangaUploaderProps {
  projectId: string;
  onUploadComplete: (pages: MangaPage[]) => void;
  onUploadError: (error: Error) => void;
}
```

**States**:
- `idle`: Ready to upload
- `uploading`: File being uploaded with progress
- `processing`: ML detection in progress
- `complete`: Panels detected and ready
- `error`: Upload or processing failed

**Features**:
- Drag-and-drop PDF, PNG, JPG files
- Progress indicator for upload
- Automatic panel detection preview
- Manual panel adjustment

### AudioUploader

**Path**: `components/forge/AudioUploader/AudioUploader.tsx`

```typescript
interface AudioUploaderProps {
  projectId: string;
  onUploadComplete: (audioInfo: AudioInfo) => void;
  onAnalysisComplete: (beats: BeatMarker[]) => void;
}
```

**Features**:
- Drag-and-drop MP3, WAV files
- Waveform visualization preview
- Auto BPM detection display
- Beat marker preview

### YouTubeDownloader

**Path**: `components/forge/YouTubeDownloader/YouTubeDownloader.tsx`

```typescript
interface YouTubeDownloaderProps {
  projectId: string;
  onDownloadComplete: (audioInfo: AudioInfo) => void;
}
```

**Features**:
- YouTube URL input with validation
- Download progress indicator
- Audio preview after download

---

## Canvas Components

### Canvas

**Path**: `components/canvas/Canvas/Canvas.tsx`

```typescript
interface CanvasProps {
  projectId: string;
  imageUrl: string;
  panels: Panel[];
  selectedPanelId?: string;
  onPanelSelect: (panelId: string) => void;
  onPanelUpdate: (panelId: string, bbox: NormalizedBBox) => void;
  onPanelAdd: (bbox: NormalizedBBox) => void;
  onPanelDelete: (panelId: string) => void;
}
```

**Features**:
- Pan and zoom controls
- Grid overlay toggle
- Zoom to fit / 100% / custom zoom
- Panel selection with visual feedback
- Multi-select with shift-click

### BoundingBox

**Path**: `components/canvas/BoundingBox/BoundingBox.tsx`

```typescript
interface BoundingBoxProps {
  bbox: NormalizedBBox;
  isSelected: boolean;
  isLocked?: boolean;
  onDrag: (bbox: NormalizedBBox) => void;
  onResize: (bbox: NormalizedBBox) => void;
  onSelect: () => void;
  onDelete: () => void;
}
```

**Features**:
- Draggable positioning
- Resize handles on corners and edges
- Lock/unlock panel
- Delete panel
- Show panel index number

### LayerManager

**Path**: `components/canvas/LayerManager/LayerManager.tsx`

```typescript
interface LayerManagerProps {
  panels: Panel[];
  selectedPanelId?: string;
  onSelect: (panelId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onToggleVisibility: (panelId: string) => void;
  onToggleLock: (panelId: string) => void;
}
```

**Features**:
- Layer list with thumbnails
- Drag-and-drop reordering
- Visibility toggle
- Lock toggle
- Rename layer

### CanvasToolbar

**Path**: `components/canvas/Canvas/CanvasToolbar.tsx`

```typescript
interface CanvasToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  tool: CanvasTool;
  onToolChange: (tool: CanvasTool) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

type CanvasTool = 'select' | 'pan' | 'draw' | 'erase';
```

---

## Timeline Components

### Timeline

**Path**: `components/timeline/Timeline/Timeline.tsx`

```typescript
interface TimelineProps {
  duration: number;
  panels: Panel[];
  beats: BeatMarker[];
  currentTime: number;
  onTimeChange: (time: number) => void;
  onPanelSelect: (panelId: string) => void;
  onBeatAdd: (time: number) => void;
  onBeatRemove: (beatId: string) => void;
}
```

**Features**:
- Horizontal scrollable timeline
- Time ruler with markers
- Panel tracks
- Beat markers
- Playhead with drag
- Zoom in/out

### Waveform

**Path**: `components/timeline/Waveform/Waveform.tsx`

```typescript
interface WaveformProps {
  audioUrl: string;
  beats: BeatMarker[];
  currentTime: number;
  duration: number;
  onTimeChange: (time: number) => void;
}
```

**Features**:
- Audio waveform visualization
- Click to seek
- Beat markers overlay
- Playhead indicator
- Amplitude coloring

### BeatMarker

**Path**: `components/timeline/BeatMarker/BeatMarker.tsx`

```typescript
interface BeatMarkerProps {
  beat: BeatMarker;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onTimeChange: (time: number) => void;
}
```

### Track

**Path**: `components/timeline/Track/Track.tsx`

```typescript
interface TrackProps {
  panel: Panel;
  startTime: number;
  endTime: number;
  isSelected: boolean;
  onSelect: () => void;
  onResizeStart: (newStart: number) => void;
  onResizeEnd: (newEnd: number) => void;
}
```

---

## Render Components

### RenderPanel

**Path**: `components/render/RenderPanel/RenderPanel.tsx`

```typescript
interface RenderPanelProps {
  project: Project;
  settings: RenderSettings;
  onSettingsChange: (settings: RenderSettings) => void;
  onStartRender: () => void;
  isRendering: boolean;
}
```

**Features**:
- Quality selector (Draft/Standard/High/Ultra)
- Resolution selector
- Effect toggles (Glow, Glitch, Parallax)
- Format selector (MP4/WebM)
- Estimated file size
- Render time estimate

### RenderProgress

**Path**: `components/render/RenderProgress/RenderProgress.tsx`

```typescript
interface RenderProgressProps {
  job: RenderJob;
  onCancel: () => void;
}
```

**States**:
- `queued`: Shows queue position
- `processing`: Shows stage and progress
- `completed`: Shows download link
- `failed`: Shows error and retry button

**Progress Stages**:
1. `downloading` - Downloading assets
2. `detecting` - Detecting panels (0-20%)
3. `segmenting` - Generating masks (20-40%)
4. `depth` - Creating depth maps (40-50%)
5. `animating` - Animating characters (50-70%)
6. `analyzing` - Analyzing audio (70-80%)
7. `composing` - Composing video (80-95%)
8. `uploading` - Uploading to S3 (95-100%)

---

## Component Patterns

### Presentational Components

Pure UI components that receive props and render UI:

```tsx
// components/ui/Button/Button.tsx
export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={cn('btn', `btn-${variant}`, `btn-${size}`)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Container Components

Components that connect to stores and handle data:

```tsx
// components/project/ProjectList.tsx
'use client';

export function ProjectList() {
  const { projects, isLoading, fetchProjects } = useProjectStore();
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div className="project-list">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### Compound Components

Components that share state via context:

```tsx
// components/ui/Modal/Modal.tsx
const ModalContext = createContext<ModalContextValue>(null);

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <ModalContext.Provider value={{ onClose }}>
        {children}
      </ModalContext.Provider>
    </Dialog>
  );
}

Modal.Header = function ModalHeader({ children }: { children: React.ReactNode }) {
  const { onClose } = useContext(ModalContext);
  return (
    <Dialog.Title>
      {children}
      <button onClick={onClose}>×</button>
    </Dialog.Title>
  );
};

Modal.Content = function ModalContent({ children }: { children: React.ReactNode }) {
  return <Dialog.Description>{children}</Dialog.Description>;
};

Modal.Footer = function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="modal-footer">{children}</div>;
};
```

---

## State Management

### Zustand Stores

#### Project Store

```typescript
// stores/projectStore.ts
interface ProjectStore {
  // State
  project: Project | null;
  panels: Panel[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: CreateProjectDTO) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectDTO) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  // Panel Actions
  addPanel: (panel: Panel) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
  deletePanel: (id: string) => void;
  reorderPanels: (fromIndex: number, toIndex: number) => void;
}
```

#### Canvas Store

```typescript
// stores/canvasStore.ts
interface CanvasStore {
  // State
  zoom: number;
  pan: { x: number; y: number };
  selectedPanelId: string | null;
  tool: CanvasTool;
  showGrid: boolean;
  isDrawing: boolean;
  
  // Actions
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setSelectedPanel: (id: string | null) => void;
  setTool: (tool: CanvasTool) => void;
  toggleGrid: () => void;
}
```

#### Timeline Store

```typescript
// stores/timelineStore.ts
interface TimelineStore {
  // State
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  beats: BeatMarker[];
  selectedBeatId: string | null;
  zoom: number;
  
  // Actions
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  addBeat: (beat: BeatMarker) => void;
  removeBeat: (beatId: string) => void;
  setZoom: (zoom: number) => void;
}
```

#### Render Store

```typescript
// stores/renderStore.ts
interface RenderStore {
  // State
  currentJob: RenderJob | null;
  jobs: RenderJob[];
  isPolling: boolean;
  
  // Actions
  startRender: (projectId: string, settings: RenderSettings) => Promise<void>;
  cancelRender: (jobId: string) => Promise<void>;
  fetchJobStatus: (jobId: string) => Promise<void>;
  downloadResult: (jobId: string) => Promise<void>;
}
```

---

## Custom Hooks

### useProject

```typescript
// hooks/useProject.ts
export const useProject = (projectId: string) => {
  const store = useProjectStore();
  
  useEffect(() => {
    if (projectId) {
      store.fetchProject(projectId);
    }
  }, [projectId, store.fetchProject]);
  
  return {
    project: store.project,
    panels: store.panels,
    isLoading: store.isLoading,
    error: store.error,
    updatePanel: store.updatePanel,
  };
};
```

### useCanvas

```typescript
// hooks/useCanvas.ts
export const useCanvas = () => {
  const canvasStore = useCanvasStore();
  const projectStore = useProjectStore();
  
  const selectedPanel = useMemo(() => {
    if (!canvasStore.selectedPanelId) return null;
    return projectStore.panels.find(p => p.id === canvasStore.selectedPanelId);
  }, [canvasStore.selectedPanelId, projectStore.panels]);
  
  return {
    ...canvasStore,
    selectedPanel,
    setPanelBBox: (bbox: NormalizedBBox) => {
      if (canvasStore.selectedPanelId) {
        projectStore.updatePanel(canvasStore.selectedPanelId, { bbox });
      }
    },
  };
};
```

### useRender

```typescript
// hooks/useRender.ts
export const useRender = () => {
  const renderStore = useRenderStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const newSocket = io('/render', {
      auth: { token: getAccessToken() }
    });
    
    newSocket.on('connect', () => {
      if (renderStore.currentJob) {
        newSocket.emit('join', renderStore.currentJob.projectId);
      }
    });
    
    newSocket.on('render:progress', (data) => {
      renderStore.updateProgress(data);
    });
    
    newSocket.on('render:complete', (data) => {
      renderStore.setCompleted(data);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  return {
    ...renderStore,
    socket,
  };
};
```

---

## Animation Guidelines

### Framer Motion

Use Framer Motion for UI animations:

```tsx
import { motion, AnimatePresence } from 'framer-motion';

export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function Modal({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Canvas Animations

For canvas-specific animations, use `requestAnimationFrame`:

```typescript
function useCanvasAnimation(panel: Panel) {
  const [animatedPanel, setAnimatedPanel] = useState(panel);
  
  useAnimationFrame((time) => {
    if (panel.effects.parallax > 0) {
      const offset = Math.sin(time / 1000) * panel.effects.parallax * 0.01;
      setAnimatedPanel({
        ...panel,
        bbox: {
          ...panel.bbox,
          y: panel.bbox.y + offset
        }
      });
    }
  });
  
  return animatedPanel;
}
```

---

## Accessibility

### ARIA Labels

```tsx
<button 
  aria-label="Zoom in"
  aria-describedby="zoom-tooltip"
  onClick={onZoomIn}
>
  <ZoomInIcon />
</button>
```

### Keyboard Navigation

```tsx
function BoundingBox({ bbox, onSelect }: BoundingBoxProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      {/* Box content */}
    </div>
  );
}
```

### Focus Management

```tsx
function Modal({ isOpen, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <Dialog 
      ref={dialogRef}
      aria-modal="true"
      onClose={onClose}
    >
      {children}
    </Dialog>
  );
}
```

---

## Performance

### Code Splitting

```tsx
const LazyCanvas = lazy(() => import('./canvas/Canvas'));
const LazyTimeline = lazy(() => import('./timeline/Timeline'));

function ProjectEditor() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyCanvas />
      <LazyTimeline />
    </Suspense>
  );
}
```

### Memoization

```tsx
const PanelCard = memo(function PanelCard({ panel, isSelected, onSelect }: PanelCardProps) {
  return (
    <div 
      className={isSelected ? 'selected' : ''}
      onClick={() => onSelect(panel.id)}
    >
      {panel.title}
    </div>
  );
}, (prev, next) => {
  return prev.panel === next.panel && prev.isSelected === next.isSelected;
});
```

### Virtualization

For long lists of panels:

```tsx
import { FixedSizeList } from 'react-window';

function PanelList({ panels, onSelect }: PanelListProps) {
  return (
    <FixedSizeList
      height={400}
      itemCount={panels.length}
      itemSize={60}
    >
      {({ index, style }) => (
        <PanelCard 
          style={style}
          panel={panels[index]}
          onSelect={onSelect}
        />
      )}
    </FixedSizeList>
  );
}
```
