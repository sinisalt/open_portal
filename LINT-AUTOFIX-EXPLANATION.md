# Why Linter Autofix Isn't Continuous During Development

## Summary

**The linter IS configured for autofix, but it runs at commit time, not continuously during development.**

## Current Configuration

### 1. Husky Pre-Commit Hook
Located in `.husky/pre-commit`:
```bash
npx lint-staged
```

### 2. Lint-Staged Configuration
In `package.json`:
```json
"lint-staged": {
  "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}": [
    "biome check --write --no-errors-on-unmatched"
  ]
}
```

The `--write` flag means **autofix is ENABLED** on every commit.

## Why Not Continuous Autofix?

### 1. **Performance**
Running autofix on every file save would:
- Slow down the editor
- Consume CPU resources
- Interrupt development flow

### 2. **Developer Control**
Developers should:
- See and understand changes before committing
- Have control over when formatting happens
- Review diffs before they're applied

### 3. **Conflict Prevention**
Auto-formatting during editing can:
- Interfere with work in progress
- Conflict with multiple concurrent edits
- Cause confusion with undo/redo

### 4. **Industry Best Practice**
Standard approach is to:
- Run linting/formatting at commit time via pre-commit hooks
- Allow developers to manually run fixes when needed
- Enforce standards at CI/CD level

## How to Use Autofix

### Manual Autofix (During Development)
```bash
# Safe fixes only (recommended)
npm run lint:fix

# All fixes including import removal (use with caution)
npx biome check --write --unsafe .
```

### Automatic Autofix (On Commit)
When you commit changes:
1. Husky pre-commit hook triggers
2. `lint-staged` runs on staged files
3. `biome check --write` auto-fixes issues
4. Fixed files are automatically added to the commit

### Check for Errors Without Fixing
```bash
npm run lint
```

## BiomeJS Linter Overview

### Configuration
Located in `biome.json`:
- **Enabled rules**: `recommended: true`
- **Warnings**: `noUnusedVariables`, `noExplicitAny`
- **Disabled**: `noNonNullAssertion`
- **Formatting**: 2 spaces, 100 line width, single quotes

### Safe vs Unsafe Fixes

**Safe Fixes** (`npm run lint:fix`):
- Formatting corrections
- Obvious syntax fixes
- Low-risk transformations

**Unsafe Fixes** (`--unsafe`):
- Removing unused imports
- Removing unused variables
- Renaming parameters
- May require code review

## Recommendation

**The current setup is optimal for OpenPortal:**

✅ **Keep current configuration** - autofix on commit via Husky
✅ **Use `npm run lint:fix`** manually when needed during development
✅ **Run `npm run lint`** before committing to catch issues early

This approach:
- Maintains developer productivity
- Ensures code quality at commit time
- Prevents accidental breaking changes
- Follows industry best practices

## Example Workflow

```bash
# 1. During development - check for issues
npm run lint

# 2. If you want to fix issues immediately
npm run lint:fix

# 3. When committing - autofix runs automatically
git add .
git commit -m "Your message"
# Husky pre-commit hook runs biome check --write

# 4. Push to remote
git push
```

## Copilot Agent Note

When using GitHub Copilot Agent:
- The agent should run `npm run lint:fix` manually when fixing lint issues
- The `--unsafe` flag may be needed for import/variable removal
- Always verify test results after applying fixes
- Document why specific `any` types exist in test files using `biome-ignore` comments

---

*Last Updated: January 24, 2026*  
*Related: `.husky/pre-commit`, `package.json` (lint-staged), `biome.json`*
