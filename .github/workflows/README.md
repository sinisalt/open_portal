# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the OpenPortal project.

## Workflows

### `ci.yml` - Continuous Integration

**⚠️ IMPORTANT: CI does NOT run automatically on every commit to PRs!**

The CI workflow uses a **label-based triggering system** to optimize CI resources and speed up development. CI only runs when explicitly requested.

**Triggers:**
- Pull requests to `main` or `develop` branches **WITH** `ci-ready` or `ready-for-ci` label
- Pushes directly to `main` or `develop` branches (label not required)
- PR events: `labeled`, `opened`, `reopened`, `synchronize`

**How to Trigger CI:**

1. Test locally first:
   ```bash
   npm run lint      # BiomeJS linting
   npm test          # Jest tests
   npm run build     # Production build
   ```

2. Add label to PR:
   ```bash
   # Using GitHub CLI
   gh pr edit <PR_NUMBER> --add-label "ci-ready"
   
   # Or via GitHub web interface
   # Add 'ci-ready' or 'ready-for-ci' label to the PR
   ```

3. CI will run automatically when label is added

**When CI Runs:**
- ✅ When `ci-ready` or `ready-for-ci` label is added to a PR
- ✅ On direct pushes to `main` or `develop` branches
- ✅ When PR is re-labeled after fixes

**When CI Does NOT Run:**
- ❌ On every commit to a PR without the label
- ❌ During iterative development and fixes
- ❌ On draft PRs without the label

**Jobs:**
1. **setup** - Install and cache dependencies (conditional: runs only with label or on push to main/develop)
2. **lint** - Run BiomeJS validation
3. **test** - Run unit tests with coverage reporting
4. **build** - Build production bundle and upload artifacts
5. **security** - Run npm audit and dependency scanning
6. **ci-success** - Summary job that checks all previous jobs

**Artifacts:**
- Build folder (retained for 7 days)
- Test coverage reports (uploaded to Codecov)

**Performance:**
- Total runtime: ~2-3 minutes with caching
- Parallel execution for faster feedback
- Reduced CI runs with label-based triggering

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

Always test locally before triggering CI with the `ci-ready` label:

```bash
# Run linting (BiomeJS)
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run tests as CI does
npm test -- --coverage --watchAll=false

# Build production bundle
npm run build
```

### Triggering CI After Local Tests Pass

```bash
# 1. Ensure all local tests pass
npm run lint && npm test -- --watchAll=false && npm run build

# 2. Commit and push your changes
git add .
git commit -m "feat: implement feature"
git push

# 3. Add label to trigger CI
gh pr edit <PR_NUMBER> --add-label "ci-ready"

# 4. Monitor CI run at:
# https://github.com/sinisalt/open_portal/actions
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
3. **Label-based triggering** - Only trigger CI when work is complete and tested locally
4. **Test locally first** - Always run lint, test, and build before adding `ci-ready` label
5. **Artifacts** - Upload important build outputs
6. **Security** - Use secrets for sensitive data
7. **Documentation** - Keep this README updated

## Development Workflow with CI

**Recommended workflow for contributors:**

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes and test locally**
   ```bash
   # During development, test frequently
   npm run dev          # Run dev server
   npm run lint         # Check for linting issues
   npm test             # Run tests
   ```

3. **Commit changes** (CI will NOT run yet)
   ```bash
   git add .
   git commit -m "feat: my feature"
   git push origin feature/my-feature
   ```

4. **Create PR** (CI will NOT run automatically)
   ```bash
   gh pr create --title "Add my feature" --body "Description"
   ```

5. **Continue iterating** (CI still won't run)
   - Make more commits
   - Fix issues found during development
   - Test locally

6. **When ready for final validation**
   ```bash
   # Run full test suite locally
   npm run lint && npm test -- --watchAll=false && npm run build
   
   # If all pass, trigger CI
   gh pr edit <PR_NUMBER> --add-label "ci-ready"
   ```

7. **If CI fails**
   ```bash
   # Optional: Remove label to prevent CI on every commit
   gh pr edit <PR_NUMBER> --remove-label "ci-ready"
   
   # Fix issues
   npm run lint:fix
   # ... make fixes ...
   
   # Test locally again
   npm run lint && npm test -- --watchAll=false && npm run build
   
   # Re-trigger CI
   gh pr edit <PR_NUMBER> --add-label "ci-ready"
   ```

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
