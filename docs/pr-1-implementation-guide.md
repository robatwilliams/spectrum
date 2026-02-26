# Implementation Guide: Splitting PR #1

This guide provides step-by-step instructions for creating each of the split PRs.

## Prerequisites

```bash
# Ensure you have the source branches
git fetch origin fully-featured:fully-featured
git fetch origin fully-featured-class-components:fully-featured-class-components
```

## General Process for Each Split PR

### Step 1: Create a new branch

```bash
# Replace [branch-name] with the specific branch name from the table below
git checkout fully-featured
git checkout -b [branch-name]
```

### Step 2: Cherry-pick the specific files

```bash
# For each file in the PR's file list:
git checkout fully-featured-class-components -- [file-path]

# Or use the helper script (see below)
```

### Step 3: Commit the changes

```bash
git add .
git commit -m "[Commit message from table below]"
```

### Step 4: Push and create PR

```bash
git push origin [branch-name]
# Then create PR via GitHub UI targeting 'fully-featured' branch
```

## Split PR Details

### PR 1.1: Infrastructure & Configuration Updates

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-infrastructure` |
| **File Count** | 3 |
| **Commit Message** | `refactor: update infrastructure and config for functional components` |
| **PR Title** | `Refactor: Update infrastructure for functional components migration` |
| **Estimated Review Time** | 30 minutes |

**Files:**
```
.github/agents-support/next-tooling-port.txt
.github/instructions/dev-server.instructions.md
package.json
```

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-infrastructure
git checkout fully-featured-class-components -- .github/agents-support/next-tooling-port.txt
git checkout fully-featured-class-components -- .github/instructions/dev-server.instructions.md
git checkout fully-featured-class-components -- package.json
git add .
git commit -m "refactor: update infrastructure and config for functional components"
git push origin refactor/class-to-func-infrastructure
```

---

### PR 1.2: Admin Panel Components

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-admin` |
| **File Count** | 19 |
| **Commit Message** | `refactor: convert admin panel components to functional components` |
| **PR Title** | `Refactor: Convert admin panel to functional components` |
| **Estimated Review Time** | 2-3 hours |

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-admin
git checkout fully-featured-class-components -- admin/
git add .
git commit -m "refactor: convert admin panel components to functional components"
git push origin refactor/class-to-func-admin
```

---

### PR 1.3: Core Shared Components (Part 1)

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-core-components-1` |
| **File Count** | 37 |
| **Commit Message** | `refactor: convert core shared components to functional components (part 1)` |
| **PR Title** | `Refactor: Convert core shared components to functional components (Part 1)` |
| **Estimated Review Time** | 3-4 hours |

**Categories included:**
- Avatar components
- Badges
- Form elements
- Icons
- Gallery
- List items
- Profile components
- Utility components (goop, menu, scrolling, etc.)

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-core-components-1

# Use the generated file list
while IFS= read -r file; do
  git checkout fully-featured-class-components -- "$file"
done < <(git diff --name-only fully-featured..fully-featured-class-components | \
  grep '^src/components/' | \
  grep -v -E 'chatInput|message|composer|emailInvitationForm|hoverProfile|inboxThread|modals|upsell')

git add .
git commit -m "refactor: convert core shared components to functional components (part 1)"
git push origin refactor/class-to-func-core-components-1
```

---

### PR 1.4: Core Shared Components (Part 2)

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-core-components-2` |
| **File Count** | 32 |
| **Commit Message** | `refactor: convert core shared components to functional components (part 2)` |
| **PR Title** | `Refactor: Convert core shared components to functional components (Part 2)` |
| **Estimated Review Time** | 3-4 hours |

**Categories included:**
- Chat/message components
- Composer
- Email invitation form
- Hover profile components
- Inbox thread components
- Modal components
- Upsell components

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-core-components-2

# Use the generated file list
while IFS= read -r file; do
  git checkout fully-featured-class-components -- "$file"
done < <(git diff --name-only fully-featured..fully-featured-class-components | \
  grep '^src/components/' | \
  grep -E 'chatInput|message|composer|emailInvitationForm|hoverProfile|inboxThread|modals|upsell')

git add .
git commit -m "refactor: convert core shared components to functional components (part 2)"
git push origin refactor/class-to-func-core-components-2
```

---

### PR 1.5: User & Authentication Views

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-user-views` |
| **File Count** | 15 |
| **Commit Message** | `refactor: convert user and authentication views to functional components` |
| **PR Title** | `Refactor: Convert user & authentication views to functional components` |
| **Estimated Review Time** | 3-4 hours |

**Categories included:**
- User profile views
- User settings views
- Authentication views
- Login views
- Onboarding views

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-user-views

# Use the generated file list
while IFS= read -r file; do
  git checkout fully-featured-class-components -- "$file"
done < <(git diff --name-only fully-featured..fully-featured-class-components | \
  grep '^src/views/' | \
  grep -E 'user|authViewHandler|login|newUserOnboarding' | \
  grep -v 'community')

git add .
git commit -m "refactor: convert user and authentication views to functional components"
git push origin refactor/class-to-func-user-views
```

---

### PR 1.6: Community Management Views

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-community-views` |
| **File Count** | 31 |
| **Commit Message** | `refactor: convert community management views to functional components` |
| **PR Title** | `Refactor: Convert community management views to functional components` |
| **Estimated Review Time** | 3-4 hours |

**Categories included:**
- Community views
- Community settings
- Community members
- Community analytics
- New community creation
- Private community join

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-community-views

# Use the generated file list
while IFS= read -r file; do
  git checkout fully-featured-class-components -- "$file"
done < <(git diff --name-only fully-featured..fully-featured-class-components | \
  grep '^src/views/' | \
  grep -E 'community' | \
  grep -v 'channel')

git add .
git commit -m "refactor: convert community management views to functional components"
git push origin refactor/class-to-func-community-views
```

---

### PR 1.7: Channel Management Views

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-channel-views` |
| **File Count** | 21 |
| **Commit Message** | `refactor: convert channel management views to functional components` |
| **PR Title** | `Refactor: Convert channel management views to functional components` |
| **Estimated Review Time** | 3-4 hours |

**Categories included:**
- Channel views
- Channel settings
- Private channel join

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-channel-views

# Use the generated file list
while IFS= read -r file; do
  git checkout fully-featured-class-components -- "$file"
done < <(git diff --name-only fully-featured..fully-featured-class-components | \
  grep '^src/views/' | \
  grep -E 'channel')

git add .
git commit -m "refactor: convert channel management views to functional components"
git push origin refactor/class-to-func-channel-views
```

---

### PR 1.8: Thread, Messaging & Remaining Views

| **Attribute** | **Value** |
|--------------|-----------|
| **Branch Name** | `refactor/class-to-func-thread-views` |
| **File Count** | 47 |
| **Commit Message** | `refactor: convert thread, messaging, and remaining views to functional components` |
| **PR Title** | `Refactor: Convert thread, messaging & remaining views to functional components` |
| **Estimated Review Time** | 3-4 hours |

**Categories included:**
- Thread views
- Direct messages
- Notifications
- Search & explore
- Static pages
- Misc views (status, query dispatcher)
- Root index.tsx

**Quick setup:**
```bash
git checkout fully-featured
git checkout -b refactor/class-to-func-thread-views

# Use the generated file list
while IFS= read -r file; do
  git checkout fully-featured-class-components -- "$file"
done < <(git diff --name-only fully-featured..fully-featured-class-components | \
  grep '^src/views/' | \
  grep -v -E 'user|community|channel')

# Also include the root index.tsx
git checkout fully-featured-class-components -- src/index.tsx

git add .
git commit -m "refactor: convert thread, messaging, and remaining views to functional components"
git push origin refactor/class-to-func-thread-views
```

---

## PR Description Template

Use this template for each split PR:

```markdown
Part of the class-to-functional component migration (split from original PR #1)

This PR converts [X] components in the [section] area to functional components.

## What Changed

- ✅ Converts class components to functional components
- ✅ Converts instance methods to inline arrow functions
- ✅ Replaces `this.props` with destructured `props`
- ✅ Maintains identical functionality (no behavioral changes)
- ✅ No introduction of hooks (pure conversion only)

## Files Changed

[X] files in the following areas:
- [List key directories or component types]

## Testing Checklist

- [ ] All existing tests pass
- [ ] Manual testing of [specific features] completed
- [ ] No console errors or warnings
- [ ] UI renders correctly
- [ ] All interactions work as expected
- [ ] No new linting errors

## Migration Context

This is part [X] of [8] in the class-to-functional migration:
- Original PR: #1
- [Previous: #X - Title]
- [Next: #X - Title]

## Review Focus

Reviewers should verify:
- All class components successfully converted
- No `this.props` or `this.state` references remain
- Methods properly converted to arrow functions
- No changes to component behavior or logic
- Props correctly passed through
- Event handlers properly bound

## Related Issues

Closes #[X] (if applicable)
Part of #1
```

## Testing Commands

For each PR, run these tests before pushing:

```bash
# Lint check
npm run lint

# Type check (if using TypeScript)
npm run type-check

# Run tests
npm test

# Build the project
npm run build

# Start dev server for manual testing
npm run dev
```

## Merge Order

Recommended merge sequence:

1. PR 1.1 (Infrastructure) ← **Merge first**
2. PR 1.2 (Admin) ← Independent, can be parallel
3. PR 1.3 (Core Components 1) ← Should merge before views
4. PR 1.4 (Core Components 2) ← Should merge before views
5. PR 1.5, 1.6, 1.7, 1.8 (Views) ← Can merge in any order

## Troubleshooting

### Issue: Merge conflicts

**Solution:** Rebase your branch on the latest `fully-featured`:
```bash
git fetch origin fully-featured
git rebase origin/fully-featured
```

### Issue: Some files already converted

**Solution:** Skip those files or verify they're identical to avoid duplicate work

### Issue: Tests failing

**Solution:** 
1. Verify you're testing the right functionality
2. Check that no logic was accidentally changed
3. Make sure all props are properly passed through

## Automation Helper Script

Save this as `scripts/create-split-pr.sh`:

```bash
#!/bin/bash

PR_NUM=$1
BASE_BRANCH="fully-featured"
SOURCE_BRANCH="fully-featured-class-components"

case $PR_NUM in
  1.1)
    BRANCH="refactor/class-to-func-infrastructure"
    FILES=".github/agents-support/next-tooling-port.txt .github/instructions/dev-server.instructions.md package.json"
    MSG="refactor: update infrastructure and config for functional components"
    ;;
  1.2)
    BRANCH="refactor/class-to-func-admin"
    FILES="admin/"
    MSG="refactor: convert admin panel components to functional components"
    ;;
  # Add other cases as needed
  *)
    echo "Unknown PR number: $PR_NUM"
    echo "Usage: $0 <pr-number>"
    echo "Example: $0 1.1"
    exit 1
    ;;
esac

git checkout $BASE_BRANCH
git checkout -b $BRANCH
for file in $FILES; do
  git checkout $SOURCE_BRANCH -- $file
done
git add .
git commit -m "$MSG"
git push origin $BRANCH

echo "Branch $BRANCH created and pushed!"
echo "Create PR at: https://github.com/robatwilliams/spectrum/compare/$BRANCH"
```

Usage:
```bash
chmod +x scripts/create-split-pr.sh
./scripts/create-split-pr.sh 1.1
```

---

## Summary

Following this guide, you can create all 8 split PRs systematically. Each PR:
- Has a clear scope
- Is independently reviewable
- Can be tested in isolation
- Follows a consistent pattern
- Contributes to the overall migration goal

Total estimated time to create all PRs: **2-3 hours**
Total estimated review time: **20-25 hours** (sequential) or **10-12 hours** (parallel with 2-3 reviewers)
