# Tasks: Enhanced Tasting Summary Display

**Input**: Design documents from `/specs/001-on-the-summary/`
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
- **Web app**: `components/`, `lib/`, `tests/` at repository root
- Paths shown below assume web application structure

## Phase 3.1: Setup
- [ ] T001 Create database migration to add aroma and flavor fields to quick_tasting_items table
- [ ] T002 Update Supabase TypeScript types to include aroma and flavor fields
- [ ] T003 [P] Configure linting and formatting tools for new code

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T004 [P] Component test for aroma field display in tests/components/QuickTastingSummary.test.tsx
- [ ] T005 [P] Component test for flavor field display in tests/components/QuickTastingSummary.test.tsx
- [ ] T006 [P] Component test for conditional field rendering in tests/components/QuickTastingSummary.test.tsx
- [ ] T007 [P] Integration test for complete tasting session with all fields in tests/integration/tasting-summary-display.test.tsx
- [ ] T008 [P] Integration test for partial data display in tests/integration/tasting-summary-display.test.tsx
- [ ] T009 [P] E2E test for enhanced summary display workflow in tests/e2e/enhanced-summary.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T010 [P] Update TastingItemData interface in components/quick-tasting/QuickTastingSummary.tsx
- [ ] T011 [P] Update TastingItemData interface in components/quick-tasting/TastingItem.tsx
- [ ] T012 [P] Update TastingItemData interface in components/quick-tasting/QuickTastingSession.tsx
- [ ] T013 Update QuickTastingSummary component to display aroma field
- [ ] T014 Update QuickTastingSummary component to display flavor field
- [ ] T015 Implement conditional rendering logic for aroma/flavor/notes fields
- [ ] T016 Update field display order (Aroma → Flavor → Notes)
- [ ] T017 Add proper styling and spacing for new fields

## Phase 3.4: Integration
- [ ] T018 Update database query to include aroma and flavor fields
- [ ] T019 Test database migration with existing data
- [ ] T020 Verify backward compatibility with existing sessions
- [ ] T021 Update TypeScript interfaces to match database schema

## Phase 3.5: Polish
- [ ] T022 [P] Unit tests for conditional field rendering logic in tests/unit/field-display.test.tsx
- [ ] T023 [P] Mobile responsiveness tests in tests/unit/mobile-display.test.tsx
- [ ] T024 Performance validation for enhanced display
- [ ] T025 [P] Update component documentation
- [ ] T026 Remove any unused code or interfaces
- [ ] T027 Run quickstart.md validation scenarios

## Dependencies
- Tests (T004-T009) before implementation (T010-T017)
- T001 (database migration) before T018 (database query)
- T002 (TypeScript types) before T010-T012 (interface updates)
- T010-T012 (interface updates) before T013-T017 (component updates)
- Implementation before polish (T022-T027)

## Parallel Example
```
# Launch T004-T009 together:
Task: "Component test for aroma field display in tests/components/QuickTastingSummary.test.tsx"
Task: "Component test for flavor field display in tests/components/QuickTastingSummary.test.tsx"
Task: "Component test for conditional field rendering in tests/components/QuickTastingSummary.test.tsx"
Task: "Integration test for complete tasting session with all fields in tests/integration/tasting-summary-display.test.tsx"
Task: "Integration test for partial data display in tests/integration/tasting-summary-display.test.tsx"
Task: "E2E test for enhanced summary display workflow in tests/e2e/enhanced-summary.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Database query contract → database migration task
   - Component interface contract → interface update tasks
   
2. **From Data Model**:
   - TastingItemData entity → interface update tasks
   - Database schema changes → migration task
   
3. **From User Stories**:
   - Complete tasting session story → integration test
   - Partial data story → integration test
   - Mobile responsiveness → mobile test

4. **Ordering**:
   - Setup → Tests → Models → Services → Endpoints → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
