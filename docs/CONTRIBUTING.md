# Contributing to UtsukushiiAI

Thank you for your interest in contributing to UtsukushiiAI! This document provides guidelines for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Pull Request Process](#pull-request-process)
6. [Commit Messages](#commit-messages)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to uphold these principles.

### Standards

- **Be respectful**: Treat all community members with respect
- **Be inclusive**: Welcome people of all backgrounds and experience levels
- **Be constructive**: Provide feedback that helps others improve
- **Be collaborative**: Work together to achieve the best results

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Publishing others' private information without permission
- Personal or political attacks
- Any behavior that would create a hostile environment

---

## Getting Started

### Issues

1. **Search existing issues** before creating a new one
2. **Use issue templates** when available
3. **Provide detailed information** including:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Feature Requests

1. Explain the problem you're trying to solve
2. Describe your proposed solution
3. Consider alternatives
4. Include mockups or examples if applicable

---

## Development Setup

### Prerequisites

- Node.js 20.x
- Python 3.11+
- Docker and Docker Compose
- MongoDB 6.x
- Redis 7.x

### Local Setup

```bash
# Clone the repository
git clone https://github.com/utsukushii/utsukushii-ai.git
cd utsukushii-ai

# Install dependencies
npm install

# Start development services
docker-compose up -d

# Run the application
npm run dev
```

### Environment Variables

Copy `.env.example` files and configure:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
```

---

## Making Changes

### Branch Strategy

```
main
  │
  ├── develop (integration branch)
  │     │
  │     ├── feature/feature-name
  │     ├── fix/bug-description
  │     └── refactor/improvement-name
  │
  └── hotfix/critical-fix (from main)
```

### Creating a Branch

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Create a bug fix branch
git checkout -f fix/bug-description

# Create a refactor branch
git checkout -b refactor/improvement-name
```

### Code Style

#### TypeScript/JavaScript

- Use ESLint and Prettier
- Follow existing code patterns
- Use meaningful variable names
- Comment complex logic

```typescript
// ✅ Good
const userProjects = projects.filter(
  (project) => project.userId === currentUser.id
);

// ❌ Bad
const p = projects.filter(p => p.uid === u.id);
```

#### Python

- Follow PEP 8
- Use type hints
- Use Black for formatting

```python
# ✅ Good
def calculate_parallax_offset(depth_map: np.ndarray, strength: float) -> np.ndarray:
    """Calculate pixel offset for parallax effect."""
    return (1 - depth_map) * strength

# ❌ Bad
def calc(d, s):
    return (1-d)*s
```

---

## Pull Request Process

### Before Submitting

1. **Run tests**: Ensure all tests pass
2. **Run linters**: Fix any linting issues
3. **Update documentation**: Add docs for new features
4. **Rebase**: Rebase on latest `develop` branch

```bash
# Update your branch
git fetch origin
git rebase origin/develop

# Run tests
npm run test

# Run linting
npm run lint
```

### PR Title Format

Use conventional commits format:

```
feat: add panel detection API
fix: resolve coordinate normalization bug
docs: update API documentation
refactor: separate concerns in render service
test: add unit tests for audio analyzer
chore: update dependencies
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing performed

## Screenshots
(if applicable)

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **At least one review** required from maintainer
3. **Address feedback** promptly
4. **Squash commits** before merging

---

## Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting |
| `refactor` | Code refactoring |
| `test` | Tests |
| `chore` | Maintenance |

### Examples

```bash
# Feature
git commit -m "feat(canvas): add drag-and-drop panel reordering"

# Bug fix
git commit -m "fix(coordinates): normalize bbox to 0-1 range"

# Documentation
git commit -m "docs(api): add render endpoint documentation"

# Breaking change
git commit -m "feat(auth)!: change JWT refresh token format
BREAKING CHANGE: Refresh tokens are now JWT instead of opaque"
```

---

## Testing

### Unit Tests

```typescript
// Example test
describe('ProjectService', () => {
  it('should create a project', async () => {
    const service = new ProjectService(mockRepo, mockS3);
    
    const project = await service.create({
      title: 'Test Project',
      aspectRatio: '9:16'
    });
    
    expect(project.id).toBeDefined();
    expect(project.title).toBe('Test Project');
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific package tests
npm run test --workspace=@utsukushii/api
```

### Test Coverage Requirements

- **Minimum**: 80% coverage
- **Critical paths**: 100% coverage
- **New features**: Must include tests

---

## Documentation

### Code Documentation

```typescript
/**
 * Creates a new project for the user.
 * 
 * @param userId - The ID of the user creating the project
 * @param data - Project creation data
 * @returns The created project
 * @throws {ValidationError} If project data is invalid
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
): Promise<Project> {
  // Implementation
}
```

### README Updates

When adding new features, update relevant README files:

- `apps/web/README.md` - Frontend changes
- `apps/api/README.md` - Backend API changes
- `apps/worker/README.md` - ML worker changes
- `docs/` - Documentation updates

---

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- GitHub profile badges

---

## Questions?

- **Discord**: [Join our community](https://discord.gg/utsukushii)
- **GitHub Discussions**: For questions and ideas
- **Email**: team@utsukushii.ai

---

Thank you for contributing to UtsukushiiAI!
