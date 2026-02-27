# UtsukushiiAI Database Schema

This document describes the MongoDB schemas and data models for the UtsukushiiAI platform.

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Collections](#collections)
3. [User Schema](#user-schema)
4. [Project Schema](#project-schema)
5. [Panel Schema](#panel-schema)
6. [RenderJob Schema](#renderjob-schema)
7. [AudioAnalysis Schema](#audioanalysis-schema)
8. [Indexes](#indexes)
9. [Data Relationships](#data-relationships)

---

## Database Overview

- **Database Name**: `utsukushii`
- **Connection String**: `mongodb://localhost:27017/utsukushii` (development)

### Environment Variables

```bash
MONGODB_URI=mongodb://username:password@host:port/database
MONGODB_DB_NAME=utsukushii
```

---

## Collections

| Collection | Description |
|------------|-------------|
| `users` | User accounts and authentication |
| `projects` | User projects and metadata |
| `panels` | Manga panel coordinates and assets |
| `render_jobs` | Render job status and results |
| `audio_analyses` | Audio analysis results (BPM, beats) |
| `sessions` | User sessions (for refresh tokens) |

---

## User Schema

### Collection: `users`

```typescript
interface User {
  _id: ObjectId;
  
  // Authentication
  email: string;              // Unique, indexed
  passwordHash: string;
  username: string;          // Unique, indexed
  displayName: string;
  
  // Profile
  avatarUrl?: string;
  bio?: string;
  
  // Account
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  
  // Usage
  renderCredits: number;
  renderCount: number;
  
  // Security
  emailVerified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Preferences
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}
```

### Mongoose Schema

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  role: 'user' | 'admin';
  plan: 'free' | 'pro' | 'enterprise';
  renderCredits: number;
  renderCount: number;
  emailVerified: boolean;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  preferences: {
    notifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50,
    },
    avatarUrl: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    renderCredits: {
      type: Number,
      default: 10,
      min: 0,
    },
    renderCount: {
      type: Number,
      default: 0,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: false,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
```

---

## Project Schema

### Collection: `projects`

```typescript
interface Project {
  _id: ObjectId;
  
  // Ownership
  userId: ObjectId;           // Reference to users
  
  // Content
  title: string;
  description?: string;
  
  // Format
  aspectRatio: '9:16' | '16:9' | '1:1';
  
  // Status
  status: 'draft' | 'processing' | 'ready' | 'error';
  
  // Settings
  settings: {
    resolution: '720x1280' | '1080x1920' | '1440x2560';
    fps: 24 | 30 | 60;
    quality: 'draft' | 'standard' | 'high' | 'ultra';
  };
  
  // Assets
  mangaUrl?: string;
  mangaPages: MangaPage[];
  audioUrl?: string;
  audioInfo?: AudioInfo;
  thumbnailUrl?: string;
  
  // Statistics
  panelCount: number;
  renderCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface MangaPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

interface AudioInfo {
  duration: number;
  bpm?: number;
  title?: string;
  artist?: string;
  waveformData?: number[];
}
```

### Mongoose Schema

```typescript
const mangaPageSchema = new Schema(
  {
    pageNumber: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

const audioInfoSchema = new Schema(
  {
    duration: { type: Number, required: true },
    bpm: { type: Number },
    title: { type: String },
    artist: { type: String },
    waveformData: [{ type: Number }],
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    aspectRatio: {
      type: String,
      enum: ['9:16', '16:9', '1:1'],
      default: '9:16',
    },
    status: {
      type: String,
      enum: ['draft', 'processing', 'ready', 'error'],
      default: 'draft',
    },
    settings: {
      resolution: {
        type: String,
        enum: ['720x1280', '1080x1920', '1440x2560'],
        default: '1080x1920',
      },
      fps: {
        type: Number,
        enum: [24, 30, 60],
        default: 30,
      },
      quality: {
        type: String,
        enum: ['draft', 'standard', 'high', 'ultra'],
        default: 'high',
      },
    },
    mangaUrl: {
      type: String,
    },
    mangaPages: [mangaPageSchema],
    audioUrl: {
      type: String,
    },
    audioInfo: audioInfoSchema,
    thumbnailUrl: {
      type: String,
    },
    panelCount: {
      type: Number,
      default: 0,
    },
    renderCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ userId: 1, createdAt: -1 });
projectSchema.index({ status: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
```

---

## Panel Schema

### Collection: `panels`

> **IMPORTANT**: All coordinates are **normalized** between 0.0 and 1.0 for scale-invariance.

```typescript
interface Panel {
  _id: ObjectId;
  
  // References
  projectId: ObjectId;       // Reference to projects
  
  // Position
  pageIndex: number;
  order: number;
  
  // Bounding Box (Normalized 0.0 - 1.0)
  bbox: {
    x: number;      // 0.0 = left edge, 1.0 = right edge
    y: number;      // 0.0 = top edge, 1.0 = bottom edge
    width: number;  // 0.0 to 1.0
    height: number; // 0.0 to 1.0
  };
  
  // Detection Metadata
  confidence?: number;
  
  // Generated Assets
  maskUrl?: string;
  depthMapUrl?: string;
  animatedUrl?: string;
  
  // Effects
  effects: {
    parallax: number;    // 0.0 - 1.0
    glow: boolean;
    glitch: boolean;
    blur?: number;
  };
  
  // Transitions
  transitions: Transition[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

interface Transition {
  type: 'none' | 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'zoom' | 'glitch';
  duration: number;      // seconds
  beatId?: string;       // Link to beat marker
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}
```

### Mongoose Schema

```typescript
const normalizedBBoxSchema = new Schema(
  {
    x: { type: Number, required: true, min: 0, max: 1 },
    y: { type: Number, required: true, min: 0, max: 1 },
    width: { type: Number, required: true, min: 0, max: 1 },
    height: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const transitionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['none', 'fade', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'zoom', 'glitch'],
      default: 'fade',
    },
    duration: { type: Number, required: true, min: 0.1, max: 5 },
    beatId: { type: String },
    easing: {
      type: String,
      enum: ['linear', 'ease-in', 'ease-out', 'ease-in-out'],
      default: 'ease-in-out',
    },
  },
  { _id: false }
);

const panelSchema = new Schema<IPanel>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'projects',
      required: true,
      index: true,
    },
    pageIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    bbox: {
      type: normalizedBBoxSchema,
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    maskUrl: {
      type: String,
    },
    depthMapUrl: {
      type: String,
    },
    animatedUrl: {
      type: String,
    },
    effects: {
      parallax: {
        type: Number,
        default: 0.3,
        min: 0,
        max: 1,
      },
      glow: {
        type: Boolean,
        default: true,
      },
      glitch: {
        type: Boolean,
        default: false,
      },
      blur: {
        type: Number,
        min: 0,
        max: 20,
      },
    },
    transitions: [transitionSchema],
  },
  {
    timestamps: true,
  }
);

panelSchema.index({ projectId: 1, order: 1 });
panelSchema.index({ projectId: 1, pageIndex: 1 });

export const Panel = mongoose.model<IPanel>('Panel', panelSchema);
```

---

## RenderJob Schema

### Collection: `render_jobs`

```typescript
interface RenderJob {
  _id: ObjectId;
  
  // References
  projectId: ObjectId;       // Reference to projects
  userId: ObjectId;          // Reference to users
  
  // Job Identity
  jobId: string;             // Public-facing job ID (rnd_xxx)
  
  // Status
  status: RenderStatus;
  
  // Progress
  progress: {
    stage: RenderStage;
    percent: number;
    message?: string;
    currentPanel?: number;
    totalPanels?: number;
  };
  
  // Settings
  settings: {
    quality: 'draft' | 'standard' | 'high' | 'ultra';
    resolution: string;
    fps: number;
    format: 'mp4' | 'webm';
    effects: {
      glow: boolean;
      glitch: boolean;
      parallax: boolean;
    };
  };
  
  // Output
  outputUrl?: string;
  outputSize?: number;
  duration?: number;
  
  // Error
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  
  // Timing
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

type RenderStatus = 
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

type RenderStage = 
  | 'queued'
  | 'downloading'
  | 'detecting'
  | 'segmenting'
  | 'depth'
  | 'animating'
  | 'analyzing'
  | 'composing'
  | 'uploading'
  | 'complete'
  | 'error';
```

### Mongoose Schema

```typescript
const renderProgressSchema = new Schema(
  {
    stage: {
      type: String,
      enum: ['queued', 'downloading', 'detecting', 'segmenting', 'depth', 'animating', 'analyzing', 'composing', 'uploading', 'complete', 'error'],
      default: 'queued',
    },
    percent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    message: { type: String },
    currentPanel: { type: Number },
    totalPanels: { type: Number },
  },
  { _id: false }
);

const renderErrorSchema = new Schema(
  {
    code: { type: String, required: true },
    message: { type: String, required: true },
    details: { type: String },
  },
  { _id: false }
);

const renderJobSchema = new Schema<IRenderJob>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'projects',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'queued',
      index: true,
    },
    progress: {
      type: renderProgressSchema,
      default: () => ({}),
    },
    settings: {
      quality: {
        type: String,
        enum: ['draft', 'standard', 'high', 'ultra'],
        default: 'high',
      },
      resolution: {
        type: String,
        default: '1080x1920',
      },
      fps: {
        type: Number,
        default: 30,
      },
      format: {
        type: String,
        enum: ['mp4', 'webm'],
        default: 'mp4',
      },
      effects: {
        glow: { type: Boolean, default: true },
        glitch: { type: Boolean, default: false },
        parallax: { type: Boolean, default: true },
      },
    },
    outputUrl: { type: String },
    outputSize: { type: Number },
    duration: { type: Number },
    error: renderErrorSchema,
    queuedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

renderJobSchema.index({ projectId: 1, createdAt: -1 });
renderJobSchema.index({ userId: 1, status: 1 });
renderJobSchema.index({ status: 1, createdAt: -1 });

export const RenderJob = mongoose.model<IRenderJob>('RenderJob', renderJobSchema);
```

---

## AudioAnalysis Schema

### Collection: `audio_analyses`

```typescript
interface AudioAnalysis {
  _id: ObjectId;
  
  // References
  projectId: ObjectId;       // Reference to projects
  
  // Analysis Results
  duration: number;
  bpm: number;
  
  // Beat Markers
  beats: BeatMarker[];
  
  // Onset Detection
  onsets: Onset[];
  
  // Segments
  segments: AudioSegment[];
  
  // Metadata
  analysisVersion: string;
  
  // Timestamps
  createdAt: Date;
}

interface BeatMarker {
  id: string;
  timestamp: number;         // seconds
  strength: number;          // 0.0 - 1.0
  type: 'downbeat' | 'beat' | 'offbeat';
}

interface Onset {
  timestamp: number;         // seconds
  strength: number;          // 0.0 - 1.0
}

interface AudioSegment {
  start: number;
  end: number;
  label: string;             // 'intro', 'verse', 'chorus', 'bridge', 'outro'
}
```

### Mongoose Schema

```typescript
const beatMarkerSchema = new Schema(
  {
    id: { type: String, required: true },
    timestamp: { type: Number, required: true },
    strength: { type: Number, required: true, min: 0, max: 1 },
    type: {
      type: String,
      enum: ['downbeat', 'beat', 'offbeat'],
      default: 'beat',
    },
  },
  { _id: false }
);

const onsetSchema = new Schema(
  {
    timestamp: { type: Number, required: true },
    strength: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false }
);

const audioSegmentSchema = new Schema(
  {
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    label: {
      type: String,
      enum: ['intro', 'verse', 'chorus', 'bridge', 'outro', 'break'],
      required: true,
    },
  },
  { _id: false }
);

const audioAnalysisSchema = new Schema<IAudioAnalysis>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'projects',
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    bpm: {
      type: Number,
      required: true,
    },
    beats: [beatMarkerSchema],
    onsets: [onsetSchema],
    segments: [audioSegmentSchema],
    analysisVersion: {
      type: String,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
  }
);

audioAnalysisSchema.index({ projectId: 1 });

export const AudioAnalysis = mongoose.model<IAudioAnalysis>('AudioAnalysis', audioAnalysisSchema);
```

---

## Session Schema

### Collection: `sessions`

```typescript
interface Session {
  _id: ObjectId;
  
  // References
  userId: ObjectId;          // Reference to users
  
  // Token
  refreshTokenHash: string;
  
  // Security
  userAgent?: string;
  ipAddress?: string;
  
  // Status
  revoked: boolean;
  
  // Expiration
  expiresAt: Date;
  
  // Timestamps
  createdAt: Date;
  lastUsedAt?: Date;
}
```

### Mongoose Schema

```typescript
const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    userAgent: { type: String },
    ipAddress: { type: String },
    revoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastUsedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ userId: 1, revoked: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
```

---

## Indexes

### users Collection

```javascript
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });
```

### projects Collection

```javascript
db.projects.createIndex({ userId: 1, createdAt: -1 });
db.projects.createIndex({ status: 1 });
```

### panels Collection

```javascript
db.panels.createIndex({ projectId: 1, order: 1 });
db.panels.createIndex({ projectId: 1, pageIndex: 1 });
```

### render_jobs Collection

```javascript
db.render_jobs.createIndex({ projectId: 1 }, { unique: true });
db.render_jobs.createIndex({ userId: 1, status: 1 });
db.render_jobs.createIndex({ status: 1, createdAt: -1 });
```

### audio_analyses Collection

```javascript
db.audio_analyses.createIndex({ projectId: 1 }, { unique: true });
```

### sessions Collection

```javascript
db.sessions.createIndex({ userId: 1, revoked: 1 });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

## Data Relationships

```
users (1) ──────< (N) projects (1) ──────< (N) panels
    │                                        │
    └────< (N) render_jobs                   │
              │                              │
              │                              │
              └────< (1) audio_analyses     │
                       │                    │
                       └────────────────────┘
```

### Cascade Deletion

When a **project** is deleted:
- All associated **panels** are deleted
- All associated **render_jobs** are marked as cancelled
- **audio_analyses** is deleted

When a **user** is deleted:
- All associated **projects** are deleted (cascade)
- All associated **render_jobs** are marked as cancelled
- All **sessions** are revoked

---

## Example Queries

### Get User's Recent Projects

```javascript
db.projects.find({ userId: ObjectId("...") })
  .sort({ createdAt: -1 })
  .limit(10);
```

### Get Project with Panels

```javascript
db.projects.aggregate([
  { $match: { _id: ObjectId("...") } },
  {
    $lookup: {
      from: "panels",
      localField: "_id",
      foreignField: "projectId",
      as: "panels"
    }
  }
]);
```

### Get Active Render Jobs

```javascript
db.render_jobs.find({
  status: { $in: ["queued", "processing"] }
}).sort({ createdAt: 1 });
```

### Get User Statistics

```javascript
db.users.aggregate([
  { $match: { _id: ObjectId("...") } },
  {
    $lookup: {
      from: "projects",
      localField: "_id",
      foreignField: "userId",
      as: "projects"
    }
  },
  {
    $lookup: {
      from: "render_jobs",
      localField: "_id",
      foreignField: "userId",
      as: "renders"
    }
  },
  {
    $project: {
      totalProjects: { $size: "$projects" },
      totalRenders: { $size: "$renders" },
      completedRenders: {
        $size: {
          $filter: {
            input: "$renders",
            cond: { $eq: ["$$this.status", "completed"] }
          }
        }
      }
    }
  }
]);
```

---

## Migrations

### Version 1.0.0 (Initial Schema)

```javascript
// migrations/001_initial_schema.js
exports.up = async function(db) {
  // Users
  await db.createCollection('users');
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('users').createIndex({ username: 1 }, { unique: true });
  
  // Projects
  await db.createCollection('projects');
  await db.collection('projects').createIndex({ userId: 1, createdAt: -1 });
  
  // Panels
  await db.createCollection('panels');
  await db.collection('panels').createIndex({ projectId: 1, order: 1 });
  
  // Render Jobs
  await db.createCollection('render_jobs');
  await db.collection('render_jobs').createIndex({ projectId: 1 }, { unique: true });
  await db.collection('render_jobs').createIndex({ status: 1, createdAt: -1 });
  
  // Audio Analyses
  await db.createCollection('audio_analyses');
  await db.collection('audio_analyses').createIndex({ projectId: 1 }, { unique: true });
  
  // Sessions
  await db.createCollection('sessions');
  await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
};

exports.down = async function(db) {
  await db.dropCollection('sessions');
  await db.dropCollection('audio_analyses');
  await db.dropCollection('render_jobs');
  await db.dropCollection('panels');
  await db.dropCollection('projects');
  await db.dropCollection('users');
};
```
