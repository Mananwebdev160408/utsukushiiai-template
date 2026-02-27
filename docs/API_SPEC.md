# UtsukushiiAI API Specification

This document provides comprehensive REST API documentation for the UtsukushiiAI platform.

---

## Table of Contents

1. [Base URL & Versioning](#base-url--versioning)
2. [Authentication](#authentication)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [API Endpoints](#api-endpoints)
7. [WebSocket Events](#websocket-events)

---

## Base URL & Versioning

| Environment | Base URL |
|------------|----------|
| Production | `https://api.utsukushii.ai` |
| Staging | `https://api.staging.utsukushii.ai` |
| Development | `http://localhost:4000` |

**Version**: The API uses URL versioning. Current version: `v1`

```
https://api.utsukushii.ai/v1/auth/login
```

---

## Authentication

### JWT Authentication

The API uses JWT (JSON Web Tokens) for authentication.

#### Access Token
- **Lifetime**: 15 minutes
- **Usage**: Include in `Authorization` header

```http
Authorization: Bearer <access_token>
```

#### Refresh Token
- **Lifetime**: 7 days
- **Usage**: Exchange for new access token

#### Token Response

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 900
}
```

---

## Request/Response Format

### Request Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <access_token>
X-Request-ID: <uuid>
```

### Success Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Paginated Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project data",
    "details": [
      {
        "field": "title",
        "message": "Title must be between 1 and 100 characters"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Codes

| Status | Code | Description |
|--------|------|-------------|
| 200 | OK | Request succeeded |
| 201 | CREATED | Resource created successfully |
| 204 | NO_CONTENT | Request succeeded, no content to return |
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Invalid or missing authentication |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE_ENTITY | Validation failed |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error |
| 503 | SERVICE_UNAVAILABLE | Service temporarily unavailable |

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing JWT token |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `REFRESH_TOKEN_INVALID` | 401 | Refresh token is invalid or revoked |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `PROJECT_NOT_FOUND` | 404 | Project does not exist |
| `PANEL_NOT_FOUND` | 404 | Panel does not exist |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `INVALID_BBOX` | 400 | Invalid bounding box coordinates |
| `RATE_LIMITED` | 429 | Too many requests |
| `UPLOAD_FAILED` | 422 | File upload failed |
| `RENDER_FAILED` | 500 | Video render failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Authentication | 10 | 1 minute |
| General API | 100 | 1 minute |
| Render Start | 5 | 1 minute |
| File Upload | 20 | 1 hour |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705316400
```

---

## API Endpoints

### Authentication Endpoints

#### Register User

```http
POST /v1/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "manga_creator",
  "displayName": "Manga Creator"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "username": "manga_creator",
      "displayName": "Manga Creator",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

#### Login

```http
POST /v1/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "username": "manga_creator",
      "displayName": "Manga Creator",
      "avatarUrl": "https://s3.../avatars/..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

#### Refresh Token

```http
POST /v1/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

#### Logout

```http
POST /v1/auth/logout
```

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (204):** No content

---

#### Get Current User

```http
GET /v1/auth/me
```

**Headers:**

```http
Authorization: Bearer <access_token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "username": "manga_creator",
    "displayName": "Manga Creator",
    "avatarUrl": "https://s3.../avatars/...",
    "plan": "pro",
    "renderCredits": 100,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Project Endpoints

#### List Projects

```http
GET /v1/projects
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| sort | string | -createdAt | Sort field |
| order | string | desc | Sort order (asc/desc) |
| search | string | | Search by title |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "prj_abc123",
      "title": "My First MMV",
      "description": "A test project",
      "aspectRatio": "9:16",
      "status": "draft",
      "thumbnailUrl": "https://s3.../thumbnails/...",
      "panelCount": 12,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

#### Create Project

```http
POST /v1/projects
```

**Request Body:**

```json
{
  "title": "My First MMV",
  "description": "A test project",
  "aspectRatio": "9:16"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "prj_abc123",
    "title": "My First MMV",
    "description": "A test project",
    "aspectRatio": "9:16",
    "status": "draft",
    "settings": {
      "resolution": "1080x1920",
      "fps": 30,
      "quality": "high"
    },
    "mangaUrl": null,
    "audioUrl": null,
    "thumbnailUrl": null,
    "panelCount": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Get Project

```http
GET /v1/projects/:id
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "prj_abc123",
    "title": "My First MMV",
    "description": "A test project",
    "aspectRatio": "9:16",
    "status": "draft",
    "settings": {
      "resolution": "1080x1920",
      "fps": 30,
      "quality": "high"
    },
    "mangaUrl": "https://s3.../manga/...",
    "mangaPages": [
      {
        "pageNumber": 1,
        "imageUrl": "https://s3.../manga/page1.png",
        "width": 1200,
        "height": 1800
      }
    ],
    "audioUrl": "https://s3.../audio/song.mp3",
    "audioInfo": {
      "duration": 180,
      "bpm": 128,
      "title": "Epic Song",
      "artist": "Artist Name"
    },
    "thumbnailUrl": "https://s3.../thumbnails/...",
    "panelCount": 12,
    "renderCount": 5,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

---

#### Update Project

```http
PUT /v1/projects/:id
```

**Request Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "settings": {
    "fps": 60,
    "quality": "ultra"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "prj_abc123",
    "title": "Updated Title",
    "description": "Updated description",
    "aspectRatio": "9:16",
    "status": "draft",
    "settings": {
      "resolution": "1080x1920",
      "fps": 60,
      "quality": "ultra"
    },
    "updatedAt": "2024-01-15T12:00:00Z"
  }
}
```

---

#### Delete Project

```http
DELETE /v1/projects/:id
```

**Response (204):** No content

---

### Panel Endpoints

#### List Panels

```http
GET /v1/projects/:projectId/panels
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "pnl_abc123",
      "projectId": "prj_abc123",
      "pageIndex": 0,
      "order": 0,
      "bbox": {
        "x": 0.0,
        "y": 0.0,
        "width": 0.5,
        "height": 0.5
      },
      "maskUrl": "https://s3.../masks/...",
      "depthMapUrl": "https://s3.../depth/...",
      "animatedUrl": "https://s3.../animated/...",
      "effects": {
        "parallax": 0.3,
        "glow": true,
        "glitch": false
      },
      "transitions": [
        {
          "type": "fade",
          "duration": 0.5,
          "beatId": "beat_001"
        }
      ],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### Create Panel

```http
POST /v1/projects/:projectId/panels
```

**Request Body:**

```json
{
  "pageIndex": 0,
  "order": 0,
  "bbox": {
    "x": 0.0,
    "y": 0.0,
    "width": 0.5,
    "height": 0.5
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "pnl_abc123",
    "projectId": "prj_abc123",
    "pageIndex": 0,
    "order": 0,
    "bbox": {
      "x": 0.0,
      "y": 0.0,
      "width": 0.5,
      "height": 0.5
    },
    "maskUrl": null,
    "depthMapUrl": null,
    "animatedUrl": null,
    "effects": {
      "parallax": 0.3,
      "glow": true,
      "glitch": false
    },
    "transitions": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Update Panel

```http
PUT /v1/projects/:projectId/panels/:panelId
```

**Request Body:**

```json
{
  "bbox": {
    "x": 0.1,
    "y": 0.1,
    "width": 0.6,
    "height": 0.6
  },
  "effects": {
    "parallax": 0.5,
    "glow": true,
    "glitch": true
  },
  "transitions": [
    {
      "type": "slide-left",
      "duration": 0.3,
      "beatId": "beat_002"
    }
  ]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "pnl_abc123",
    "bbox": {
      "x": 0.1,
      "y": 0.1,
      "width": 0.6,
      "height": 0.6
    },
    "effects": {
      "parallax": 0.5,
      "glow": true,
      "glitch": true
    },
    "transitions": [
      {
        "type": "slide-left",
        "duration": 0.3,
        "beatId": "beat_002"
      }
    ]
  }
}
```

---

#### Delete Panel

```http
DELETE /v1/projects/:projectId/panels/:panelId
```

**Response (204):** No content

---

### Detection Endpoints

#### Detect Panels (Auto-detection)

```http
POST /v1/projects/:projectId/detect
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "panels": [
      {
        "id": "pnl_abc123",
        "bbox": {
          "x": 0.0,
          "y": 0.0,
          "width": 0.5,
          "height": 0.5
        },
        "confidence": 0.95
      },
      {
        "id": "pnl_def456",
        "bbox": {
          "x": 0.5,
          "y": 0.0,
          "width": 0.5,
          "height": 0.5
        },
        "confidence": 0.92
      }
    ],
    "processingTime": 2.5
  }
}
```

---

### Audio Endpoints

#### Analyze Audio

```http
POST /v1/projects/:projectId/analyze
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "duration": 180.5,
    "bpm": 128,
    "beats": [
      {
        "id": "beat_001",
        "timestamp": 0.0,
        "strength": 1.0,
        "type": "downbeat"
      },
      {
        "id": "beat_002",
        "timestamp": 0.467,
        "strength": 0.8,
        "type": "beat"
      }
    ],
    "onsets": [
      {
        "timestamp": 0.0,
        "strength": 1.0
      }
    ],
    "segments": [
      {
        "start": 0.0,
        "end": 30.0,
        "label": "intro"
      },
      {
        "start": 30.0,
        "end": 90.0,
        "label": "verse"
      }
    ]
  }
}
```

---

### Render Endpoints

#### Start Render

```http
POST /v1/render/start
```

**Request Body:**

```json
{
  "projectId": "prj_abc123",
  "settings": {
    "quality": "high",
    "resolution": "1080x1920",
    "fps": 30,
    "format": "mp4",
    "effects": {
      "glow": true,
      "glitch": true,
      "parallax": true
    }
  }
}
```

**Response (202):**

```json
{
  "success": true,
  "data": {
    "jobId": "rnd_xyz789",
    "status": "queued",
    "queuePosition": 3,
    "estimatedTime": 300,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Get Render Status

```http
GET /v1/render/:jobId
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "jobId": "rnd_xyz789",
    "projectId": "prj_abc123",
    "status": "processing",
    "progress": {
      "stage": "composing",
      "percent": 75,
      "message": "Composing video frames"
    },
    "settings": {
      "quality": "high",
      "resolution": "1080x1920",
      "fps": 30
    },
    "outputUrl": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "startedAt": "2024-01-15T10:31:00Z",
    "completedAt": null
  }
}
```

---

#### List Render Jobs

```http
GET /v1/render
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | | Filter by status |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "jobId": "rnd_xyz789",
      "projectId": "prj_abc123",
      "projectTitle": "My First MMV",
      "status": "completed",
      "progress": {
        "stage": "complete",
        "percent": 100
      },
      "outputUrl": "https://s3.../exports/...",
      "fileSize": 15000000,
      "createdAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:35:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50
  }
}
```

---

#### Cancel Render

```http
DELETE /v1/render/:jobId
```

**Response (204):** No content

---

#### Download Render

```http
GET /v1/render/:jobId/download
```

**Response (302):** Redirects to S3 presigned download URL

---

### Upload Endpoints

#### Get Presigned URL

```http
POST /v1/upload/presign
```

**Request Body:**

```json
{
  "filename": "manga.pdf",
  "contentType": "application/pdf",
  "folder": "manga",
  "projectId": "prj_abc123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://s3.amazonaws.com/utsukushii-raw/...",
    "fileUrl": "https://s3.../raw/manga/...",
    "expiresIn": 3600,
    "fields": {
      "key": "raw/manga/abc123/manga.pdf",
      "Content-Type": "application/pdf",
      "AWSAccessKeyId": "...",
      "Signature": "...",
      "Policy": "..."
    }
  }
}
```

---

#### Confirm Upload

```http
POST /v1/upload/complete
```

**Request Body:**

```json
{
  "fileUrl": "https://s3.../raw/manga/...",
  "projectId": "prj_abc123",
  "type": "manga"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "fileId": "file_abc123",
    "fileUrl": "https://s3.../raw/manga/...",
    "type": "manga",
    "metadata": {
      "pageCount": 24,
      "format": "pdf",
      "size": 5000000
    }
  }
}
```

---

### YouTube Endpoints

#### Download YouTube Audio

```http
POST /v1/youtube/download
```

**Request Body:**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "projectId": "prj_abc123"
}
```

**Response (202):**

```json
{
  "success": true,
  "data": {
    "taskId": "yt_abc123",
    "status": "processing",
    "message": "Downloading audio from YouTube"
  }
}
```

---

### Health Check

```http
GET /v1/health
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 86400,
    "services": {
      "mongodb": "connected",
      "redis": "connected",
      "s3": "connected"
    }
  }
}
```

---

## WebSocket Events

### Connection

```javascript
const socket = io('https://api.utsukushii.ai/render', {
  auth: {
    token: '<access_token>'
  }
});
```

### Events

#### render:progress

```json
{
  "event": "render:progress",
  "data": {
    "jobId": "rnd_xyz789",
    "progress": {
      "stage": "detecting",
      "percent": 25,
      "message": "Detecting manga panels"
    }
  }
}
```

#### render:complete

```json
{
  "event": "render:complete",
  "data": {
    "jobId": "rnd_xyz789",
    "outputUrl": "https://s3.../exports/...",
    "fileSize": 15000000,
    "duration": 300
  }
}
```

#### render:error

```json
{
  "event": "render:error",
  "data": {
    "jobId": "rnd_xyz789",
    "error": {
      "code": "RENDER_FAILED",
      "message": "Failed to compose video frames",
      "details": "FFmpeg error: ..."
    }
  }
}
```

#### panel:detected

```json
{
  "event": "panel:detected",
  "data": {
    "projectId": "prj_abc123",
    "panels": [...]
  }
}
```

#### beat:analyzed

```json
{
  "event": "beat:analyzed",
  "data": {
    "projectId": "prj_abc123",
    "bpm": 128,
    "beats": [...]
  }
}
```

---

## Client Libraries

### JavaScript/TypeScript

```typescript
import { UtsukushiiClient } from '@utsukushii/client';

const client = new UtsukushiiClient({
  baseUrl: 'https://api.utsukushii.ai',
  accessToken: '...'
});

// Create project
const project = await client.projects.create({
  title: 'My MMV',
  aspectRatio: '9:16'
});

// Upload manga
const uploadUrl = await client.upload.getPresignedUrl('manga.pdf', 'application/pdf');
await client.upload.uploadFile(uploadUrl.uploadUrl, file);

// Start render
const job = await client.render.start(project.id, {
  quality: 'high'
});

// Listen to progress
client.render.onProgress((progress) => {
  console.log(`Progress: ${progress.percent}%`);
});
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-15 | Initial API release |
