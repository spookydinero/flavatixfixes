# Tasks: Remove Mode Display and Add Category Dropdown

**Input**: Design documents from `/specs/001-remove-mode-add-category-dropdown/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Implementation plan loaded successfully
2. Load optional design documents:
   → data-model.md: Session and Category entities identified
   → contracts/: API contracts for category updates
   → research.md: Technical decisions and existing functionality
3. Generate tasks by category:
   → Setup: No new dependencies needed
   → Tests: Component tests, integration tests
   → Core: UI modifications, component updates
   → Integration: Existing functionality reuse
   → Polish: Testing and validation
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
- **Web app**: `components/`, `pages/`, `tests/` at repository root
- Paths based on existing Next.js structure

## Phase 3.1: Setup
- [ ] T001 Verify existing dependencies and project structure
- [ ] T002 [P] Configure testing environment for new components

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T003 [P] Component test for CategoryDropdown in tests/components/CategoryDropdown.test.tsx
- [ ] T004 [P] Integration test for mode display removal in tests/integration/mode-display-removal.test.tsx
- [ ] T005 [P] Integration test for category change functionality in tests/integration/category-change.test.tsx
- [ ] T006 [P] E2E test for complete user workflow in tests/e2e/category-dropdown.spec.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T007 [P] Create CategoryDropdown component in components/quick-tasting/CategoryDropdown.tsx
- [ ] T008 Remove mode display from QuickTastingSession in components/quick-tasting/QuickTastingSession.tsx
- [ ] T009 Add category dropdown to session header in components/quick-tasting/QuickTastingSession.tsx
- [ ] T010 Update session header layout and styling
- [ ] T011 Integrate CategoryDropdown with existing handleCategoryChange function
- [ ] T012 Add loading states and error handling for category changes
- [ ] T013 Ensure mobile responsiveness and accessibility compliance

## Phase 3.4: Integration
- [ ] T014 Connect CategoryDropdown to existing session state management
- [ ] T015 Verify real-time updates work correctly
- [ ] T016 Test category change persistence across page refreshes
- [ ] T017 Ensure compatibility with existing item management

## Phase 3.5: Polish
- [ ] T018 [P] Unit tests for CategoryDropdown component logic in tests/unit/CategoryDropdown.test.tsx
- [ ] T019 [P] Unit tests for session header modifications in tests/unit/QuickTastingSession.test.tsx
- [ ] T020 Performance validation (< 100ms response time)
- [ ] T021 [P] Update component documentation
- [ ] T022 Remove any code duplication
- [ ] T023 Run manual testing following quickstart.md workflow

## Dependencies
- Tests (T003-T006) before implementation (T007-T013)
- T007 blocks T009, T011
- T008 blocks T009, T010
- T009 blocks T011, T012
- Implementation before integration (T014-T017)
- Integration before polish (T018-T023)

## Parallel Example
```
# Launch T003-T006 together:
Task: "Component test for CategoryDropdown in tests/components/CategoryDropdown.test.tsx"
Task: "Integration test for mode display removal in tests/integration/mode-display-removal.test.tsx"
Task: "Integration test for category change functionality in tests/integration/category-change.test.tsx"
Task: "E2E test for complete user workflow in tests/e2e/category-dropdown.spec.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task
- Avoid: vague tasks, same file conflicts
- Reuse existing handleCategoryChange function (no new API needed)

## Task Generation Rules
*Applied during main() execution*

1. **From Contracts**:
   - Existing API functionality → integration test tasks [P]
   - No new endpoints needed → focus on UI integration
   
2. **From Data Model**:
   - Session entity → UI modification tasks
   - Category entity → dropdown component tasks [P]
   
3. **From User Stories**:
   - Mode removal → UI modification task
   - Category dropdown → component creation and integration tasks
   - Data preservation → integration test tasks [P]

4. **Ordering**:
   - Setup → Tests → Components → Integration → Polish
   - Dependencies block parallel execution

## Validation Checklist
*GATE: Checked by main() before returning*

- [x] All contracts have corresponding tests
- [x] All entities have model tasks
- [x] All tests come before implementation
- [x] Parallel tasks truly independent
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task

## Implementation Notes

### Key Technical Decisions
- **Reuse existing functionality**: No new API endpoints needed
- **Minimal changes**: Focus on UI modifications only
- **Existing patterns**: Use same dropdown pattern as setup phase
- **Data preservation**: Category changes don't affect existing items

### File Modifications
- **Primary file**: `components/quick-tasting/QuickTastingSession.tsx`
- **New component**: `components/quick-tasting/CategoryDropdown.tsx`
- **Test files**: Various test files for comprehensive coverage

### Success Criteria
- Mode display completely removed
- Category dropdown functional and accessible
- Category changes save successfully
- No data loss during changes
- Mobile responsiveness maintained
- Accessibility compliance preserved
