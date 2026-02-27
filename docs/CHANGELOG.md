# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2024-03-15

### Added

#### Core Features
- **Project Management**: Create, edit, delete manga projects
- **Panel Detection**: Automatic manga panel detection using YOLOv12
- **Panel Segmentation**: Character/foreground segmentation using SAM 2
- **Depth Estimation**: MiDaS-powered depth maps for parallax effects
- **Audio Analysis**: BPM detection and beat marker identification using Librosa
- **Video Rendering**: FFmpeg-based video composition with effects
- **User Authentication**: JWT-based authentication system

#### Frontend
- **Next.js 15 App Router**: Modern React framework with Server Components
- **Zustand State Management**: Lightweight state management
- **Canvas Editor**: Interactive panel bounding box editing
- **Timeline**: Visual waveform with beat markers
- **Render Progress**: Real-time render progress via WebSocket
- **YouTube Downloader**: Direct audio download from YouTube

#### Backend
- **Express.js API**: RESTful API with Express
- **FastAPI ML Worker**: Async ML inference endpoints
- **MongoDB Integration**: Full CRUD operations
- **Redis Caching**: Session and render queue caching
- **AWS S3 Integration**: File upload and storage

### Changed

#### Architecture
- Separated ML processing to dedicated FastAPI worker
- Implemented WebSocket for real-time updates
- Added render job queue with Redis

#### Performance
- Optimized YOLOv12 inference with batch processing
- Added GPU support for ML worker
- Implemented lazy loading for models

### Fixed

- Coordinate normalization for panel bounding boxes
- WebSocket reconnection handling
- Memory leaks in canvas editor
- CORS configuration for production

---

## [0.9.0] - 2024-02-01

### Added

- Initial beta release
- Basic project creation
- Manual panel bounding box editing
- Simple video rendering without effects

### Known Issues

- Panel detection accuracy needs improvement
- No YouTube integration
- Limited render quality options

---

## [0.5.0] - 2024-01-15

### Added

- Alpha release for internal testing
- Basic prototype of manga-to-video pipeline

---

## Version History

| Version | Date | Status |
|---------|------|--------|
| 1.0.0 | 2024-03-15 | Production |
| 0.9.0 | 2024-02-01 | Beta |
| 0.5.0 | 2024-01-15 | Alpha |

---

## Upgrading

### From 0.9.x to 1.0.0

**Breaking Changes:**

1. **API Changes**
   - Render endpoints restructured
   - JWT token format changed (refresh tokens now JWT)

2. **Database**
   - New indexes added
   - Run migration: `db.migrate(0.9.0)`

3. **Environment Variables**
   - New required: `JWT_REFRESH_SECRET`
   - Removed: `LEGACY_AUTH_MODE`

**Migration Steps:**

```bash
# Update environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Restart services
docker-compose down
docker-compose up -d
```

---

## Deprecation Notices

### Deprecated in 1.0.0

| Feature | Deprecated | Removed |
|---------|------------|---------|
| REST auth endpoints | 1.0.0 | 2.0.0 |
| JWT-only refresh | 1.0.0 | 2.0.0 |
| PNG panel format | 1.0.0 | 1.1.0 |

### Planned for 1.1.0

- Stable Video Diffusion animation
- 4K rendering support
- Collaborative editing
- API v2

---

## Security Advisories

### CVE-2024-001 (Fixed in 1.0.0)

**Severity**: High

**Description**: JWT validation vulnerability in refresh token endpoint

**Affected Versions**: < 1.0.0

**Resolution**: Upgrade to 1.0.0 or later

---

## Credits

Thank you to all contributors who have helped shape UtsukushiiAI!

### Contributors

- Project Team
- Beta Testers
- Community Members

---

*This changelog was generated using [GitHub Changelog Generator](https://github.com/github-changelog-generator/github-changelog-generator).*
