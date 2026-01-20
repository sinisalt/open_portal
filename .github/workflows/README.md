# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the OpenPortal project.

## Workflows

### `ci.yml` - Continuous Integration

**Triggers:**
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches

**Jobs:**
1. **setup** - Install and cache dependencies
2. **lint** - Run ESLint validation (zero warnings policy)
3. **format** - Check code formatting with Prettier
4. **test** - Run unit tests with coverage reporting
5. **build** - Build production bundle and upload artifacts
6. **security** - Run npm audit and dependency scanning
7. **ci-success** - Summary job that checks all previous jobs

**Artifacts:**
- Build folder (retained for 7 days)
- Test coverage reports (uploaded to Codecov)

**Performance:**
- Total runtime: ~2-3 minutes with caching
- Parallel execution for faster feedback

### `deploy-staging.yml` - Staging Deployment

**Triggers:**
- Push to `develop` branch
- Manual workflow dispatch

**Jobs:**
1. **build-and-deploy** - Build and deploy to staging
2. **rollback** - Automatic rollback on failure

**Features:**
- Docker image building with commit SHA tagging
- Deployment summary generation
- Rollback capability

**Environment:**
- Name: staging
- URL: https://staging.openportal.example.com (to be configured)

**Required Secrets:**
- `STAGING_API_URL` - API endpoint for staging
- Additional secrets for Docker registry and deployment (when configured)

## Local Testing

### Test CI Workflow Locally

```bash
# Run tests as CI does
CI=true npm test -- --coverage --watchAll=false

# Check formatting
npm run format:check

# Run linting
npx eslint src/ --ext .js,.jsx,.ts,.tsx --max-warnings 0

# Build production bundle
npm run build
```

### Simulate Pre-commit Hooks

```bash
# Test pre-commit hook
.husky/pre-commit

# Or manually run lint-staged
npx lint-staged
```

## Adding New Workflows

1. Create new `.yml` file in this directory
2. Follow existing workflow structure
3. Use caching for dependencies
4. Add appropriate triggers
5. Document in this README

## Workflow Best Practices

1. **Use caching** - Cache node_modules for faster runs
2. **Parallel jobs** - Run independent jobs in parallel
3. **Fail fast** - Use `max-warnings: 0` for strict checking
4. **Artifacts** - Upload important build outputs
5. **Security** - Use secrets for sensitive data
6. **Documentation** - Keep this README updated

## Monitoring Workflows

- View workflow runs: https://github.com/sinisalt/open_portal/actions
- Check workflow status badges (can be added to README.md)
- Review workflow logs for debugging

## Troubleshooting

### Workflow Fails on Dependency Installation

```yaml
# Clear cache by changing cache key
cache: npm
cache-dependency-path: '**/package-lock.json'
```

### Tests Timeout

```yaml
# Increase timeout in workflow
timeout-minutes: 10
```

### Build Failures

1. Check build logs in Actions tab
2. Run build locally: `npm run build`
3. Verify all dependencies installed
4. Check for environment-specific issues

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - Development guidelines

---

*Last updated: January 2026*
