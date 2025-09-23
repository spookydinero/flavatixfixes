# Tasks: Update Study Mode Specification

**Input**: Design documents from `/specs/002-update-study-mode/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `pages/api/` for endpoints, `components/` for UI, `lib/` for utilities
- Paths shown below assume Next.js web application structure

## Phase 3.1: Setup
- [x] T001 Database migration script execution for Study Mode schema changes
- [x] T002 [P] Update TypeScript types for new database fields and tables
- [x] T003 [P] Configure real-time Supabase subscriptions for collaborative features

## Phase 3.2: Tests First (TDD) ✅ COMPLETE - Tests written and will fail until implementation
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [x] T004 [P] Contract test POST /api/tastings/{id}/suggestions in specs/002-update-study-mode/contracts/tests/test_suggestions_post.js
- [x] T005 [P] Contract test GET /api/tastings/{id}/suggestions in specs/002-update-study-mode/contracts/tests/test_suggestions_get.js
- [x] T006 [P] Contract test POST /api/tastings/{id}/suggestions/{id}/moderate in specs/002-update-study-mode/contracts/tests/test_moderation_post.js
- [x] T007 [P] Integration test Pre-defined Study Mode workflow in tests/integration/test_study_mode_predefined.js
- [x] T008 [P] Integration test Collaborative Study Mode workflow in tests/integration/test_study_mode_collaborative.js
- [x] T009 [P] Integration test role management and permissions in tests/integration/test_role_management.js
- [x] T010 [P] Integration test host unresponsiveness handling in tests/integration/test_host_unresponsive.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [x] T011 [P] tasting_item_suggestions model and service functions in lib/studyModeService.ts
- [x] T012 [P] Role management utilities and permission checks in lib/roleService.ts
- [x] T013 [P] StudyModeSelector component for approach selection in components/quick-tasting/StudyModeSelector.tsx
- [x] T014 [P] ItemSuggestions component for collaborative interface in components/quick-tasting/ItemSuggestions.tsx
- [x] T015 [P] RoleIndicator component for user status display in components/quick-tasting/RoleIndicator.tsx
- [x] T016 [P] ModerationDashboard component for host controls in components/quick-tasting/ModerationDashboard.tsx
- [x] T017 POST /api/tastings/{id}/suggestions endpoint implementation
- [x] T018 GET /api/tastings/{id}/suggestions endpoint implementation
- [x] T019 POST /api/tastings/{id}/suggestions/{id}/moderate endpoint implementation
- [x] T020 PUT /api/tastings/{id}/participants/{id}/role endpoint implementation
- [x] T021 Enhanced tasting creation with study_approach parameter in pages/create-tasting.tsx
- [x] T022 Update QuickTastingSession for role-based UI in components/quick-tasting/QuickTastingSession.tsx

## Phase 3.4: Integration
- [x] T023 Connect role service to Supabase real-time subscriptions
- [x] T024 Implement suggestion status change broadcasts
- [x] T025 Add participant role change notifications
- [x] T026 Integrate collaborative item approval workflow
- [x] T027 Add host unresponsiveness detection and fallback UI

## Phase 3.5: Polish
- [x] T028 [P] Unit tests for role permission logic in tests/unit/test_role_permissions.js
- [x] T029 [P] Unit tests for suggestion validation in tests/unit/test_suggestion_validation.js
- [x] T030 Performance tests for real-time updates (<100ms latency)
- [x] T031 [P] Update component documentation for new Study Mode features
- [ ] T032 Accessibility audit for role indicators and collaborative UI
- [ ] T033 Manual testing of all quickstart scenarios
- [ ] T034 Code cleanup and remove study mode feature flags

## Dependencies
- Tests (T004-T010) before implementation (T011-T022)
- T011 blocks T017-T019 (service layer needed for endpoints)
- T012 blocks T021-T022 (role utilities needed for UI)
- T013-T016 can run in parallel after T011-T012
- T017-T020 can run in parallel after T011
- Integration (T023-T027) after core implementation
- Polish (T028-T034) after integration complete

## Parallel Execution Examples
```
# Phase 3.2: Write all contract and integration tests in parallel
Task: "Contract test POST /api/tastings/{id}/suggestions in specs/002-update-study-mode/contracts/tests/test_suggestions_post.js"
Task: "Contract test GET /api/tastings/{id}/suggestions in specs/002-update-study-mode/contracts/tests/test_suggestions_get.js"
Task: "Integration test Pre-defined Study Mode workflow in tests/integration/test_study_mode_predefined.js"
Task: "Integration test Collaborative Study Mode workflow in tests/integration/test_study_mode_collaborative.js"

# Phase 3.3: Implement UI components in parallel
Task: "StudyModeSelector component for approach selection in components/quick-tasting/StudyModeSelector.tsx"
Task: "ItemSuggestions component for collaborative interface in components/quick-tasting/ItemSuggestions.tsx"
Task: "RoleIndicator component for user status display in components/quick-tasting/RoleIndicator.tsx"

# Phase 3.3: Implement API endpoints in parallel
Task: "POST /api/tastings/{id}/suggestions endpoint implementation"
Task: "GET /api/tastings/{id}/suggestions endpoint implementation"
Task: "POST /api/tastings/{id}/suggestions/{id}/moderate endpoint implementation"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Real-time features require careful testing
- Role management affects security and UI throughout

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - study-mode-api.yaml → 3 contract test tasks [P] (one per endpoint)
   - Each endpoint → implementation task

2. **From Data Model**:
   - tasting_item_suggestions entity → service functions task [P]
   - tasting_participants role fields → role utilities task [P]

3. **From User Stories**:
   - 4 quickstart scenarios → 4 integration test tasks [P]
   - Edge cases → additional integration tasks

4. **Ordering**:
   - Setup → Tests → Models/Services → Endpoints → UI → Integration → Polish
   - Database changes first, real-time features last

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests (3/3)
- [x] All entities have model/service tasks (2/2)
- [x] All tests come before implementation (TDD compliant)
- [x] Parallel tasks truly independent (verified)
- [x] Each task specifies exact file path (all do)
- [x] No task modifies same file as another [P] task (verified)
