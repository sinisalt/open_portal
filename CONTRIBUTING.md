# Contributing to OpenPortal

Thank you for your interest in contributing to OpenPortal! This document provides guidelines and instructions for setting up your development environment and contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Environment Setup](#development-environment-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Project Structure](#project-structure)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Code of Conduct

We expect all contributors to adhere to professional and respectful communication. Please be kind, considerate, and constructive in all interactions.

## Getting Started

### Prerequisites

- **Node.js**: Version 18.20.0 or higher (use nvm or volta for version management)
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: Version 2.x or higher
- **Docker**: Version 20.x or higher (optional, for containerized development)
- **Docker Compose**: Version 2.x or higher (optional)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/sinisalt/open_portal.git
   cd open_portal
   ```

2. **Install Node.js** (using nvm)

   ```bash
   # Install nvm if not already installed
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Install and use the correct Node version
   nvm install
   nvm use
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Start the development server**

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Development Environment Setup

### Option 1: Local Development (Recommended for Frontend)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env` and update values as needed:

   ```bash
   cp .env.example .env
   ```

3. **Start development server**

   ```bash
   npm start
   ```

   The application will automatically reload when you make changes.

### Option 2: Docker Development (Full Stack)

1. **Build and start all services**

   ```bash
   docker-compose up --build
   ```

2. **Access the services**

   - Frontend: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

3. **Stop all services**

   ```bash
   docker-compose down
   ```

4. **Clean up volumes** (removes database data)

   ```bash
   docker-compose down -v
   ```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### 2. Make Changes

Follow the [Coding Standards](#coding-standards) and [Project Architecture](/documentation/architecture.md).

### 3. Test Your Changes

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run linting
npx eslint 'src/**/*.{js,jsx,ts,tsx}'

# Check formatting
npm run format:check

# Auto-format code
npm run format
```

### 4. Commit Changes

We use Husky for pre-commit hooks that automatically:
- Format code with Prettier
- Lint code with ESLint
- Run tests (if configured)

```bash
git add .
git commit -m "feat: add new widget component"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test additions or changes
- `chore:` - Build process or auxiliary tool changes

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots for UI changes
- Test results (if applicable)

## Coding Standards

### JavaScript/TypeScript

- **Style**: Follow the Prettier configuration (`.prettierrc`)
- **Linting**: Follow ESLint rules (extends `react-app`)
- **Naming**:
  - Components: PascalCase (e.g., `TextInputWidget.js`)
  - Functions/variables: camelCase (e.g., `handleSubmit`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
  - Files: camelCase for utilities, PascalCase for components

### React Components

```javascript
// Prefer functional components with hooks
function MyComponent({ config, data, onEvent }) {
  const [state, setState] = useState(initialState);
  
  // Component logic
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

export default MyComponent;
```

### Widget Development

All widgets must follow the configuration-driven pattern:

1. **No hardcoded business logic** - Everything configurable via props
2. **Stable contracts** - Props interface should not break backward compatibility
3. **Accessibility** - WCAG 2.1 Level AA compliance
4. **Responsive** - Mobile-first design
5. **Performance** - Optimize rendering, use React.memo when needed

See [Widget Catalog](/documentation/widget-catalog.md) for detailed specifications.

### CSS

- Use CSS Modules for component styles
- Follow BEM naming convention
- Mobile-first responsive design
- Use CSS custom properties for theming

## Testing

### Unit Tests (Jest + React Testing Library)

```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component with props', () => {
  const config = { title: 'Test' };
  render(<MyComponent config={config} />);
  
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- MyComponent.test.js
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npx playwright test --ui
```

### Test Coverage

- Target: 80%+ coverage for core components
- All widgets must have comprehensive tests
- Critical paths must be tested

## Submitting Changes

### Pull Request Checklist

Before submitting a pull request, ensure:

- [ ] Code follows project coding standards
- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npx eslint src/`)
- [ ] Code is formatted (`npm run format`)
- [ ] New code has appropriate tests
- [ ] Documentation is updated (if needed)
- [ ] Commit messages follow convention
- [ ] PR description is clear and complete
- [ ] Screenshots included for UI changes

### Pull Request Process

1. **Create PR** with clear title and description
2. **CI checks** must pass (automated via GitHub Actions)
3. **Code review** by at least one maintainer
4. **Address feedback** and update PR
5. **Merge** once approved (squash and merge preferred)

## Project Structure

```
/
├── .github/              # GitHub configurations
│   ├── workflows/        # CI/CD workflows
│   └── issues/           # Issue templates
├── documentation/        # Project documentation
├── public/               # Static assets
├── scripts/              # Utility scripts
├── src/                  # Source code
│   ├── widgets/          # Widget components (to be created)
│   ├── core/             # Core engine (to be created)
│   ├── state/            # State management (to be created)
│   └── App.js            # Main application
├── .env.example          # Environment variable template
├── .nvmrc                # Node version specification
├── docker-compose.yml    # Docker services configuration
├── Dockerfile            # Production Dockerfile
├── Dockerfile.dev        # Development Dockerfile
└── package.json          # Dependencies and scripts
```

## Common Tasks

### Add a New Widget

1. Create widget component in `src/widgets/`
2. Follow widget contract (props, bindings, events)
3. Add comprehensive tests
4. Update widget registry
5. Document in `/documentation/widget-catalog.md`

### Update Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm update package-name

# Update all dependencies (careful!)
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

### Run Linting and Formatting

```bash
# Lint code
npx eslint 'src/**/*.{js,jsx,ts,tsx}'

# Fix linting issues
npx eslint 'src/**/*.{js,jsx,ts,tsx}' --fix

# Check formatting
npm run format:check

# Auto-format code
npm run format
```

### Build for Production

```bash
# Create production build
npm run build

# Serve production build locally
npx serve -s build
```

### Docker Commands

```bash
# Build Docker image
docker build -t openportal-frontend .

# Run production container
docker run -p 3000:80 openportal-frontend

# Use Docker Compose
docker-compose up -d        # Start in background
docker-compose logs -f      # View logs
docker-compose down         # Stop services
```

## Troubleshooting

### Node Version Issues

```bash
# Ensure you're using the correct Node version
nvm install
nvm use
node --version  # Should match .nvmrc
```

### Dependency Installation Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Docker Issues

```bash
# Clean up Docker
docker system prune -a

# Reset Docker volumes
docker-compose down -v
docker-compose up --build
```

### Git Hooks Not Running

```bash
# Reinstall Husky hooks
npm run prepare
npx husky install

# Check hook permissions
chmod +x .husky/*
```

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Additional Resources

- [Getting Started Guide](/documentation/getting-started.md)
- [Architecture Documentation](/documentation/architecture.md)
- [API Specification](/documentation/api-specification.md)
- [Widget Catalog](/documentation/widget-catalog.md)
- [Roadmap](/documentation/roadmap.md)

## Questions or Issues?

- Open an issue on GitHub
- Check existing documentation in `/documentation`
- Review issue templates in `.github/issues/`

## License

By contributing to OpenPortal, you agree that your contributions will be licensed under the project's license.

---

**Thank you for contributing to OpenPortal!** 🚀
