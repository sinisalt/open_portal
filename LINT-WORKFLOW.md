# Linting Workflow - OpenPortal

This document explains the automated linting workflow that prevents CI failures due to lint issues.

## Overview

The repository is configured with **automatic lint fixing** on every commit. This means:
- ✅ Lint issues are **automatically fixed** before commits
- ✅ **No manual intervention** required
- ✅ **CI failures eliminated** due to lint issues
- ✅ Consistent code quality across all commits

## How It Works

### Pre-Commit Hooks (Husky + lint-staged)

When you commit code, the following happens automatically:

```
1. You run: git commit -m "Your message"
   ↓
2. Husky triggers pre-commit hook
   ↓
3. lint-staged runs on staged files
   ↓
4. BiomeJS checks and auto-fixes lint issues
   ↓
5. Fixed files are re-staged
   ↓
6. Commit proceeds (only if no errors remain)
```

### Configuration Files

**Frontend:**
- `.husky/pre-commit` - Husky pre-commit hook
- `package.json` - lint-staged configuration
- `biome.json` - BiomeJS linting rules

**Backend:**
- `backend/biome.json` - BiomeJS linting rules

### lint-staged Configuration

In `package.json`:
```json
{
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}": [
      "biome check --write --no-errors-on-unmatched"
    ]
  }
}
```

This runs `biome check --write` on all staged files, which:
- Checks for lint issues
- Auto-fixes fixable issues
- Formats code
- Reports unfixable errors

## Workflow for Developers

### Normal Workflow (Automatic)

Just commit as usual - everything is automated:

```bash
# 1. Make your changes
vim src/components/MyComponent.tsx

# 2. Stage your files
git add .

# 3. Commit (lint auto-fix runs automatically)
git commit -m "Add new feature"

# 4. Push
git push
```

**What happens behind the scenes:**
- Pre-commit hook runs automatically
- BiomeJS fixes lint issues
- Fixed files are re-staged
- Commit proceeds with clean code

### Manual Linting (Optional)

You can also run linting manually:

```bash
# Check for lint issues (frontend)
npm run lint

# Auto-fix lint issues (frontend)
npm run lint:fix

# Check for lint issues (backend)
cd backend && npm run lint

# Auto-fix lint issues (backend)
cd backend && npm run lint:fix
```

### If Pre-Commit Hook Fails

If the pre-commit hook fails (unfixable errors):

1. **Review the error output** - BiomeJS will show what's wrong
2. **Fix the issues manually** - Address the reported errors
3. **Try committing again** - Hook will run again

Example error:
```
src/utils/helper.ts:42:10 lint/correctness/noUnusedVariables
  ⚠ This variable is unused.
```

Fix it:
```typescript
// Before (unused variable)
const unusedVar = 123;

// After (removed or used)
// Variable removed or actually used
```

## BiomeJS Rules

### Enabled Rules

**Frontend & Backend:**
- ✅ Recommended rules enabled
- ✅ `noExplicitAny` - Warn (not error)
- ✅ `noUnusedVariables` - Error
- ✅ Import organization
- ✅ Code formatting

### Acceptable Warnings

Some warnings are acceptable and don't block commits:
- `noExplicitAny` - In generic contexts (caches, transformers)
- These are intentional and documented

## Bypassing the Hook (Not Recommended)

If you absolutely must bypass the pre-commit hook:

```bash
# Skip pre-commit hook (NOT RECOMMENDED)
git commit --no-verify -m "Emergency fix"
```

⚠️ **Warning:** This will allow lint issues to reach CI and may cause failures.

## CI Integration

The CI workflow also runs linting:

```yaml
- name: Lint
  run: npm run lint
```

However, with pre-commit hooks, **lint should always pass in CI** because:
1. Pre-commit hook auto-fixes issues locally
2. Only clean code reaches the repository
3. CI just validates (shouldn't fail)

## Troubleshooting

### "lint-staged could not find any staged files"

This is normal and not an error. It means:
- No files matched the lint-staged pattern
- Or all staged files were in ignored directories
- The commit still proceeds normally

### Pre-commit hook is slow

The hook only runs on **staged files**, not the entire codebase:
- Small commits: < 1 second
- Large commits: 2-5 seconds

If it's consistently slow:
1. Check if you're staging too many files
2. Consider committing in smaller batches

### Hook not running

If the pre-commit hook isn't running:

```bash
# 1. Check if Husky is installed
ls -la .husky/pre-commit

# 2. Reinstall Husky
npm run prepare

# 3. Verify lint-staged config
cat package.json | grep -A 5 "lint-staged"
```

### BiomeJS not found

If you see "biome: not found":

```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

## Best Practices

### DO:
✅ Commit regularly - hooks are fast
✅ Let hooks fix issues automatically
✅ Review hook output if it fails
✅ Fix unfixable errors manually
✅ Stage files in logical groups

### DON'T:
❌ Skip the pre-commit hook
❌ Commit with `--no-verify`
❌ Disable BiomeJS rules without discussion
❌ Ignore unfixable errors
❌ Stage generated files (dist, node_modules)

## Example Workflow

### Scenario: Adding a new feature

```bash
# 1. Create feature branch
git checkout -b feature/new-component

# 2. Make changes
vim src/components/NewComponent.tsx

# 3. Stage changes
git add src/components/NewComponent.tsx

# 4. Commit (hook runs automatically)
git commit -m "Add NewComponent"

# Output:
# ✔ Preparing lint-staged...
# ✔ Running tasks for staged files...
# ✔ Applying modifications from tasks...
# ✔ Cleaning up temporary files...
# [feature/new-component abc1234] Add NewComponent

# 5. Push
git push origin feature/new-component
```

### Scenario: Fixing a bug

```bash
# 1. Fix the bug
vim src/utils/buggyFunction.ts

# 2. Stage and commit
git add src/utils/buggyFunction.ts
git commit -m "Fix bug in buggyFunction"

# If there's a lint issue:
# ✔ Preparing lint-staged...
# ✔ Running tasks for staged files...
# ✔ biome check --write fixed 1 file
# ✔ Applying modifications from tasks...
# ✔ Cleaning up temporary files...
# [branch abc1234] Fix bug in buggyFunction

# 3. Push
git push
```

## Summary

The automated linting workflow ensures:

1. **Zero manual lint fixes** - Everything is automatic
2. **Clean commits** - Every commit passes lint
3. **CI always passes** - No lint failures in CI
4. **Consistent code quality** - Same rules for everyone
5. **Fast workflow** - Hooks run in seconds

**You don't need to think about linting anymore** - just commit as usual and the hooks handle everything!

---

**Questions?** See:
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - lint-staged configuration
- `biome.json` - BiomeJS rules (frontend)
- `backend/biome.json` - BiomeJS rules (backend)
