# Troubleshooting Guide

This guide helps you resolve common issues when developing OpenPortal.

## Table of Contents

- [Development Environment](#development-environment)
- [Dependencies and Installation](#dependencies-and-installation)
- [Build and Compilation](#build-and-compilation)
- [Testing](#testing)
- [Docker and Containers](#docker-and-containers)
- [Git and Version Control](#git-and-version-control)
- [IDE and Editor](#ide-and-editor)
- [Performance Issues](#performance-issues)
- [Common Error Messages](#common-error-messages)

## Development Environment

### Wrong Node.js Version

**Problem**: Scripts fail with version-related errors

**Solution**:
```bash
# Check current version
node --version

# Install and use correct version with nvm
nvm install
nvm use

# Verify version matches .nvmrc
cat .nvmrc
```

### Port 3000 Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# macOS/Linux - Find and kill process
lsof -ti:3000 | xargs kill -9

# Windows - Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm start
```

### Environment Variables Not Loading

**Problem**: App can't find configuration values

**Solution**:
```bash
# Ensure .env file exists
cp .env.example .env

# Check file is in root directory
ls -la .env

# Verify variables are prefixed with REACT_APP_
# React only loads variables starting with REACT_APP_
```

## Dependencies and Installation

### npm install Fails

**Problem**: Errors during `npm install`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete existing installations
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, try with legacy peer deps
npm install --legacy-peer-deps
```

### Peer Dependency Warnings

**Problem**: Warnings about peer dependencies

**Solution**:
```bash
# Usually safe to ignore warnings
# If causing issues, use:
npm install --legacy-peer-deps
```

### Module Not Found Errors

**Problem**: `Error: Cannot find module 'package-name'`

**Solution**:
```bash
# Ensure package is installed
npm install

# Check if package is in package.json
cat package.json | grep package-name

# Reinstall specific package
npm install package-name

# Clear module cache
rm -rf node_modules/.cache
```

## Build and Compilation

### Build Fails

**Problem**: `npm run build` fails with errors

**Solution**:
```bash
# Clear build directory
rm -rf build

# Clear cache
rm -rf node_modules/.cache

# Rebuild
npm run build

# Check for memory issues (increase Node memory)
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### Webpack Errors

**Problem**: Webpack compilation errors

**Solution**:
```bash
# Clear webpack cache
rm -rf node_modules/.cache/webpack

# Restart development server
npm start

# Check for syntax errors in modified files
```

### CSS/Style Issues

**Problem**: Styles not loading or applying

**Solution**:
```bash
# Restart development server
# Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

# Check CSS module imports
# Should be: import styles from './Component.module.css'

# Verify CSS file location and naming
```

## Testing

### Tests Fail to Run

**Problem**: Jest won't start or crashes

**Solution**:
```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests with no cache
npm test -- --no-cache

# Check for circular dependencies
```

### Tests Pass Locally but Fail in CI

**Problem**: CI tests fail but local tests pass

**Solution**:
```bash
# Run tests in CI mode locally
CI=true npm test

# Check timezone issues (use UTC in tests)
# Check file path case sensitivity
# Ensure test doesn't rely on local files/config
```

### Coverage Reports Missing

**Problem**: Coverage not generated

**Solution**:
```bash
# Run tests with coverage flag
npm test -- --coverage --watchAll=false

# Check coverage output
ls -la coverage/
```

### Playwright E2E Tests Fail

**Problem**: E2E tests don't run

**Solution**:
```bash
# Install Playwright browsers
npx playwright install

# Install system dependencies
npx playwright install-deps

# Run in headed mode to see browser
npx playwright test --headed

# Update Playwright
npm install --save-dev @playwright/test@latest
```

## Docker and Containers

### Docker Compose Fails to Start

**Problem**: Services won't start or crash immediately

**Solution**:
```bash
# Check Docker is running
docker info

# View logs
docker-compose logs

# Stop and remove containers
docker-compose down

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

### Database Connection Issues

**Problem**: Can't connect to PostgreSQL in Docker

**Solution**:
```bash
# Check if PostgreSQL container is running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Verify credentials in .env match docker-compose.yml
# Default: user=openportal, password=openportal_dev_password, db=openportal

# Connect to database manually
docker-compose exec postgres psql -U openportal -d openportal
```

### Container Port Conflicts

**Problem**: Port already in use by another container

**Solution**:
```bash
# List all running containers
docker ps

# Stop conflicting containers
docker stop <container-id>

# Or change ports in docker-compose.yml
```

### Volume Permission Issues

**Problem**: Permission denied errors with volumes

**Solution**:
```bash
# Remove volumes
docker-compose down -v

# Fix permissions (Linux/macOS)
sudo chown -R $USER:$USER .

# Restart
docker-compose up
```

### Out of Disk Space

**Problem**: Docker runs out of space

**Solution**:
```bash
# Clean up Docker
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

## Git and Version Control

### Pre-commit Hooks Not Running

**Problem**: Husky hooks don't execute

**Solution**:
```bash
# Reinstall Husky
npm run prepare

# Verify hooks are executable
chmod +x .husky/*

# Check Git hooks are installed
ls -la .git/hooks/

# Test hook manually
.husky/pre-commit
```

### Linting Fails on Commit

**Problem**: Pre-commit hook rejects commit

**Solution**:
```bash
# Run linter manually to see errors
npx eslint src/ --ext .js,.jsx,.ts,.tsx

# Auto-fix linting issues
npx eslint src/ --ext .js,.jsx,.ts,.tsx --fix

# Run formatting
npm run format

# Then commit again
git commit -m "your message"
```

### Merge Conflicts

**Problem**: Git merge conflicts in package-lock.json

**Solution**:
```bash
# For package-lock.json conflicts
git checkout --theirs package-lock.json
npm install
git add package-lock.json

# For other files, resolve manually
```

## IDE and Editor

### ESLint Not Working in VS Code

**Problem**: ESLint errors not showing in editor

**Solution**:
1. Install ESLint extension for VS Code
2. Reload VS Code window
3. Check `.vscode/settings.json` for ESLint settings
4. Ensure `node_modules` is not excluded from ESLint

### Prettier Not Formatting on Save

**Problem**: Code doesn't format automatically

**Solution**:
1. Install Prettier extension for VS Code
2. Enable "Format on Save" in settings
3. Set Prettier as default formatter
4. Check `.prettierrc` exists

### IntelliSense Not Working

**Problem**: Auto-complete not working for imports

**Solution**:
```bash
# Restart TypeScript server in VS Code
# Command Palette > TypeScript: Restart TS Server

# Regenerate lock file
rm package-lock.json
npm install

# Clear VS Code cache
# Close VS Code, delete .vscode/ folder in project
```

## Performance Issues

### Slow Development Server Startup

**Problem**: `npm start` takes too long

**Solution**:
```bash
# Clear cache
rm -rf node_modules/.cache

# Disable source maps in development (in .env)
GENERATE_SOURCEMAP=false

# Use faster development mode
FAST_REFRESH=true npm start
```

### Hot Reload Not Working

**Problem**: Changes don't trigger reload

**Solution**:
```bash
# Enable polling (especially in Docker)
# Add to .env:
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true

# Restart development server
npm start
```

### High Memory Usage

**Problem**: Node process uses too much memory

**Solution**:
```bash
# Increase Node memory limit
NODE_OPTIONS=--max_old_space_size=4096 npm start

# Close unused applications
# Reduce number of open browser tabs
```

## Common Error Messages

### "Module parse failed: Unexpected token"

**Cause**: Babel/webpack can't parse a file

**Solution**:
- Check file extension is correct (.js, .jsx)
- Ensure syntax is valid JavaScript/JSX
- Verify imports are correct

### "React Hook useX is called conditionally"

**Cause**: React hooks used inside conditions or loops

**Solution**:
```javascript
// ❌ Wrong
if (condition) {
  const [state, setState] = useState();
}

// ✅ Correct
const [state, setState] = useState();
if (condition) {
  // Use state here
}
```

### "Objects are not valid as a React child"

**Cause**: Trying to render an object directly

**Solution**:
```javascript
// ❌ Wrong
return <div>{myObject}</div>

// ✅ Correct
return <div>{myObject.property}</div>
// or
return <div>{JSON.stringify(myObject)}</div>
```

### "Failed to compile" with no specific error

**Cause**: Syntax error in recent changes

**Solution**:
1. Check the terminal for the full error
2. Undo recent changes
3. Check for missing closing brackets, quotes
4. Restart development server

### "Proxy error: Could not proxy request"

**Cause**: Backend API is not running

**Solution**:
- Start backend server
- Check proxy configuration in package.json
- Verify API URL in .env

## Still Having Issues?

If your problem isn't listed here:

1. **Check the logs**: Look for detailed error messages
2. **Search issues**: Check GitHub issues for similar problems
3. **Documentation**: Review `/documentation` folder
4. **Ask for help**: Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - What you've already tried

## Additional Resources

- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [README.md](README.md) - Project overview
- [Documentation](/documentation) - Complete documentation

---

*Last updated: January 2026*
