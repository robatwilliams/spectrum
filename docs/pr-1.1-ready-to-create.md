# PR 1.1 - Ready to Create

## Branch Information

**Branch name**: `refactor/class-to-func-infrastructure`  
**Base branch**: `fully-featured`  
**Status**: ✅ Ready - Branch created and committed locally

## Files Changed (3)

1. `.github/agents-support/next-tooling-port.txt` - **DELETED**
2. `.github/instructions/dev-server.instructions.md` - Modified
3. `package.json` - Modified (dev:web script simplified)

## Changes Summary

This PR updates infrastructure configuration to prepare for the functional components migration:

- **Removes** `next-tooling-port.txt` - No longer needed for dev server port management
- **Simplifies** dev server instructions - Expects a pre-running dev server instead of agents starting their own
- **Cleans up** `package.json` dev:web script - Removes debug echo command

## Commit Details

**Commit SHA**: `a6262e3a8`  
**Commit message**:
```
refactor: update infrastructure and config for functional components

- Remove next-tooling-port.txt (no longer needed for dev server management)
- Simplify dev-server instructions (expect pre-running dev server)
- Clean up dev:web script in package.json (remove debug echo)

Part of PR #1 split - Infrastructure & Configuration Updates (1/8)
This is a pure refactoring change with no functional impact.
```

## How to Create the PR

Since I cannot push directly to the repository, you'll need to create the PR manually:

### Option 1: Push the existing branch (if you have permissions)

```bash
cd /home/runner/work/spectrum/spectrum
git checkout refactor/class-to-func-infrastructure
git push -u origin refactor/class-to-func-infrastructure
```

Then create PR via GitHub UI:
- Base: `fully-featured`
- Compare: `refactor/class-to-func-infrastructure`

### Option 2: Recreate the branch (recommended for repository owner)

```bash
cd /path/to/your/local/spectrum
git fetch origin
git checkout fully-featured
git pull origin fully-featured
git checkout -b refactor/class-to-func-infrastructure

# Apply the changes
git checkout fully-featured-class-components -- .github/instructions/dev-server.instructions.md package.json
rm -f .github/agents-support/next-tooling-port.txt
git add .github/agents-support/next-tooling-port.txt

# Commit
git commit -m "refactor: update infrastructure and config for functional components

- Remove next-tooling-port.txt (no longer needed for dev server management)
- Simplify dev-server instructions (expect pre-running dev server)
- Clean up dev:web script in package.json (remove debug echo)

Part of PR #1 split - Infrastructure & Configuration Updates (1/8)
This is a pure refactoring change with no functional impact."

# Push
git push -u origin refactor/class-to-func-infrastructure
```

## PR Description Template

```markdown
# Refactor: Update infrastructure for functional components migration

Part of the class-to-functional component migration (split from original PR #1).

This PR updates infrastructure configuration files to prepare for the migration. These are small, non-code changes that set up the development environment for the functional components work.

## What Changed

- ✅ Removed `.github/agents-support/next-tooling-port.txt` (no longer needed)
- ✅ Simplified `.github/instructions/dev-server.instructions.md` (expects pre-running dev server)
- ✅ Cleaned up `dev:web` script in `package.json` (removed debug echo)

## Files Changed

3 files:
- `.github/agents-support/next-tooling-port.txt` (deleted)
- `.github/instructions/dev-server.instructions.md` (modified)
- `package.json` (modified)

## Testing

- [x] No functional changes - configuration only
- [x] Package.json remains valid JSON
- [x] Dev server instructions are clear

## Migration Context

This is **part 1 of 8** in the class-to-functional migration:
- **Current**: PR 1.1 - Infrastructure (3 files) ← You are here
- Next: PR 1.2 - Admin Panel (19 files)
- Original PR: #1

## Review Focus

This is a minimal infrastructure update:
- Verify the deleted file is no longer needed
- Check that dev server instructions are clear
- Confirm package.json script change is harmless

---

**Related**: Original PR #1
**Splitting Plan**: See `docs/pr-1-splitting-plan.md`
```

## Next Steps After PR 1.1 Approval

Once this PR is approved and merged:

1. Wait for merge to complete
2. Create PR 1.2 (Admin Panel - 19 files) using the same process
3. Follow the implementation guide in `docs/pr-1-implementation-guide.md`

## Verification

To verify the changes are correct, compare with the original PR #1:

```bash
git diff fully-featured..fully-featured-class-components -- .github/ package.json
```

The changes should match exactly.
