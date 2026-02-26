# PR #1 Splitting Plan: Class to Functional Components Migration

## Executive Summary

PR #1 ("Fully featured class components") is a large refactoring that converts 202 files from class components to functional components. This document proposes splitting it into **6-8 smaller, independent PRs** that are more approachable for reviewers.

### Current PR Stats
- **Total files changed**: 202
- **Additions**: 11,452 lines
- **Deletions**: 11,731 lines
- **Net change**: -279 lines
- **Scope**: Systematic conversion of class components to functional components across the entire codebase

## Analysis of Changes

### File Distribution
- **Admin section**: 19 files
- **Shared components** (`src/components/`): 69 files
- **View/page components** (`src/views/`): 110 files
- **Infrastructure/config**: 3 files (.github, package.json)

### Nature of Changes
All changes follow the same pattern:
1. Convert class components to functional components
2. Convert instance methods to inline functions (using `const`)
3. Replace `this.props` with destructured `props`
4. Remove `Component` import where no longer needed
5. Maintain identical functionality (no behavioral changes)

## Proposed Splitting Strategy

### Option A: Split by Application Section (Recommended)

This approach groups files by functional area, making each PR independently reviewable and testable.

#### PR 1.1: Infrastructure & Configuration Updates
**Files**: 3
- `.github/agents-support/next-tooling-port.txt`
- `.github/instructions/dev-server.instructions.md`
- `package.json`

**Rationale**: Get infrastructure changes merged first. These are minimal and set up any dependencies for component changes.

**Review complexity**: ⭐ (Very Low)

---

#### PR 1.2: Admin Panel Components
**Files**: ~19
- All files under `admin/src/`
  - Components: formElements, icons, titlebar
  - Utils: routeAuth
  - Views: communities, dashboard, navbar, threads, users

**Rationale**: Admin panel is a separate application area with limited cross-dependencies to main app. Can be tested and merged independently.

**Review complexity**: ⭐⭐ (Low)

---

#### PR 1.3: Core Shared Components (Part 1)
**Files**: ~35
- Avatar components (3 files)
- Badges
- Error handling components
- Form elements
- Icons
- Gallery components
- Profile components (githubProfile)
- Utility components (goop, outsideClickHandler, etc.)

**Rationale**: These are foundational UI components used across the app. Converting these first establishes patterns for the rest.

**Review complexity**: ⭐⭐ (Low-Medium)

---

#### PR 1.4: Core Shared Components (Part 2)
**Files**: ~34
- Chat/messaging components (chatInput, message, threadAttachment)
- Composer
- Email invitation form
- Hover profile components (5 files)
- Modals (8 files)
- Upsells (3 files)
- Other utility components

**Rationale**: Second batch of shared components, focusing on more complex interactive elements. Split from Part 1 to keep review size manageable.

**Review complexity**: ⭐⭐⭐ (Medium)

---

#### PR 1.5: User & Authentication Views
**Files**: ~25
- `src/views/user/` (all files)
- `src/views/userSettings/` (all files)
- `src/views/authViewHandler/`
- `src/views/login/`
- `src/views/communityLogin/`
- `src/views/newUserOnboarding/` (all files)

**Rationale**: User-focused views form a logical unit. These components primarily deal with user profile, settings, and authentication flows.

**Review complexity**: ⭐⭐⭐ (Medium)

---

#### PR 1.6: Community Management Views
**Files**: ~30
- `src/views/community/` (all files)
- `src/views/communitySettings/` (all files)
- `src/views/communityMembers/` (all files)
- `src/views/communityAnalytics/` (all files)
- `src/views/newCommunity/` (all files)
- `src/views/privateCommunityJoin/`

**Rationale**: Community management is a major feature area. Grouping these together allows focused testing of community-related functionality.

**Review complexity**: ⭐⭐⭐ (Medium)

---

#### PR 1.7: Channel Management Views
**Files**: ~25
- `src/views/channel/` (all files)
- `src/views/channelSettings/` (all files)
- `src/views/privateChannelJoin/`

**Rationale**: Channel management is another major feature area with minimal dependencies on other view conversions.

**Review complexity**: ⭐⭐⭐ (Medium)

---

#### PR 1.8: Thread, Messaging & Remaining Views
**Files**: ~35
- `src/views/thread/` (all files)
- `src/views/directMessages/` (all files)
- `src/views/notifications/` (all files)
- `src/views/explore/` (all files)
- `src/views/search/` (all files)
- `src/views/pages/` (all files)
- `src/views/status/`
- `src/views/queryParamToastDispatcher/`
- `src/index.tsx`

**Rationale**: Final batch includes thread/message views and miscellaneous pages. This completes the conversion.

**Review complexity**: ⭐⭐⭐ (Medium)

---

### Option B: Split by Component Type (Alternative)

#### PR 1.1: Simple Presentational Components
All components with no state or lifecycle, just props rendering (~60 files)

#### PR 1.2: Components with Callbacks/Event Handlers
Components that have methods but no state management (~50 files)

#### PR 1.3: Components with State Management
Components that use state or have complex lifecycle (~50 files)

#### PR 1.4: Page/View Components
Top-level views and routes (~42 files)

**Note**: Option B is **not recommended** because it creates dependencies (simpler components should be converted before complex ones use them) and splits related functionality.

## Recommended Approach: Option A

### Advantages
✅ **Independent changes**: Each PR touches a different functional area
✅ **Parallel review**: Multiple reviewers can work on different PRs simultaneously
✅ **Isolated testing**: Each area can be tested independently
✅ **Flexible merging**: PRs can be merged in any order (with minor exceptions)
✅ **Clear scope**: Reviewers can focus on one feature area at a time
✅ **Easier rollback**: If issues arise, only one area needs to be reverted

### Merge Order Recommendation
While most PRs are independent, the following order is recommended:

1. **PR 1.1** (Infrastructure) - Sets up any required configuration
2. **PR 1.2** (Admin) - Completely independent, can be tested separately
3. **PR 1.3** (Core Components Part 1) - Foundation components
4. **PR 1.4** (Core Components Part 2) - More complex components that may use Part 1
5. **PR 1.5, 1.6, 1.7, 1.8** (Views) - Can be merged in any order, all use the core components

**Note**: PRs 1.5-1.8 have minimal interdependencies and can be worked on/merged in parallel if desired.

## Implementation Guidelines

### For Each Split PR:

1. **Branch Naming**
   - `refactor/class-to-func-infrastructure`
   - `refactor/class-to-func-admin`
   - `refactor/class-to-func-core-components-1`
   - `refactor/class-to-func-core-components-2`
   - `refactor/class-to-func-user-views`
   - `refactor/class-to-func-community-views`
   - `refactor/class-to-func-channel-views`
   - `refactor/class-to-func-thread-views`

2. **PR Title Format**
   - "Refactor: Convert [Section] to functional components"
   - Example: "Refactor: Convert admin panel to functional components"

3. **PR Description Template**
   ```markdown
   Part of the class-to-functional component migration (split from original PR #1)
   
   This PR converts [X] components in the [section] to functional components.
   
   ## Changes
   - Converts class components to functional components
   - Converts instance methods to inline arrow functions
   - Maintains identical functionality (no behavioral changes)
   
   ## Files Changed
   - [List key files or directories]
   
   ## Testing
   - [ ] All existing tests pass
   - [ ] Manual testing of [specific features] completed
   - [ ] No console errors or warnings
   
   ## Related PRs
   - Original PR: #1
   - Previous in sequence: #[X] (if applicable)
   - Next in sequence: #[X] (if applicable)
   ```

4. **Review Checklist for Reviewers**
   - [ ] All class components successfully converted to functional components
   - [ ] No `this.props` references remain (should be destructured `props`)
   - [ ] No `this.state` references (if any state, should use hooks - though this PR shouldn't introduce hooks)
   - [ ] Methods converted to `const functionName = () => {}` format
   - [ ] No changes to component behavior or logic
   - [ ] Props are properly passed through
   - [ ] Event handlers correctly bound/passed
   - [ ] Tests pass
   - [ ] No new linting errors

## Testing Strategy

### For Each PR:
1. **Unit Tests**: Run existing test suite for modified files
2. **Integration Tests**: Test the feature area as a whole
3. **Manual Testing**: 
   - Test key user flows in the affected area
   - Verify no console errors
   - Check that UI renders correctly
   - Verify interactions work as expected

### Specific Test Areas:
- **PR 1.2 (Admin)**: Test admin dashboard, community/user management
- **PR 1.3-1.4 (Components)**: Test component rendering across different contexts
- **PR 1.5 (User)**: Test user profiles, settings, authentication
- **PR 1.6 (Community)**: Test community creation, settings, member management
- **PR 1.7 (Channel)**: Test channel browsing, settings, permissions
- **PR 1.8 (Threads)**: Test thread viewing, messaging, search

## Risk Mitigation

### Potential Risks:
1. **Merge Conflicts**: Multiple PRs changing similar files
   - **Mitigation**: Use recommended merge order; rebase frequently

2. **Incomplete Conversion**: Missing some class components
   - **Mitigation**: Each PR includes checklist of all files in scope

3. **Behavior Changes**: Accidental changes during conversion
   - **Mitigation**: Careful review; comprehensive testing; no logic changes

4. **Dependencies**: Components depend on other converted components
   - **Mitigation**: Core components converted first; views converted last

## Timeline Estimate

Assuming single-reviewer, sequential processing:
- **PR 1.1**: 30 minutes review
- **PR 1.2**: 2-3 hours review
- **PR 1.3**: 3-4 hours review
- **PR 1.4**: 3-4 hours review
- **PR 1.5-1.8**: 3-4 hours each

**Total sequential**: ~20-25 hours
**With parallel review**: ~10-12 hours (2-3 reviewers working simultaneously)

Compare to reviewing original PR #1 as a whole: 30+ hours of focused review time.

## Conclusion

Splitting PR #1 into 6-8 focused PRs will:
- Make reviews more manageable and thorough
- Enable parallel review and testing
- Reduce risk of missing issues
- Allow incremental progress
- Make it easier to identify and fix problems

The recommended approach (Option A: Split by Application Section) provides the best balance of independence, clarity, and reviewability.
