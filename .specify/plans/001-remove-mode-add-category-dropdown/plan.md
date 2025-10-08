# Implementation Plan: Remove Mode Display and Add Category Dropdown

**Branch**: `001-remove-mode-add-category-dropdown` | **Date**: 2024-12-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-remove-mode-add-category-dropdown/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → Feature spec loaded successfully
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Project Type: Web application (Next.js + Supabase)
   → Structure Decision: Option 2 (Web application)
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → No violations detected - approach is constitutional
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → NEEDS CLARIFICATION resolved through existing codebase analysis
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
7. Re-evaluate Constitution Check section
   → No new violations detected
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Remove redundant "Mode: Quick" display from quick tasting session headers and replace static category text with an editable dropdown selector. This improves user experience by eliminating unnecessary information and making category selection more functional and accessible.

## Technical Context
**Language/Version**: TypeScript 4.9+, Next.js 14.0.4  
**Primary Dependencies**: React, Supabase, Tailwind CSS  
**Storage**: Supabase PostgreSQL with existing session and category tables  
**Testing**: Jest, React Testing Library, Playwright for E2E  
**Target Platform**: Web application (mobile-first responsive design)  
**Project Type**: Web application (frontend + backend via Supabase)  
**Performance Goals**: < 100ms navigation response, optimized database queries  
**Constraints**: Mobile-first design (375x667px target), accessibility compliance (WCAG 2.1 AA)  
**Scale/Scope**: Single feature enhancement to existing tasting session interface  

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance
- ✅ **User Experience First**: Mobile-first design maintained, intuitive navigation improved
- ✅ **Code Quality Standards**: TypeScript, component-based architecture, consistent naming
- ✅ **Database Integrity**: No schema changes required, existing RLS policies maintained
- ✅ **Security Requirements**: Input validation for category changes, existing auth maintained
- ✅ **Testing Standards**: Unit tests for new components, integration tests for category changes
- ✅ **Documentation Requirements**: Component documentation for new dropdown component

### Technical Constraints Compliance
- ✅ **Frontend**: Next.js with TypeScript, Tailwind CSS styling, Supabase integration
- ✅ **Backend**: Supabase PostgreSQL, existing RLS policies, real-time subscriptions
- ✅ **Performance**: < 100ms response time, optimized queries, minimal bundle impact

### Quality Gates Compliance
- ✅ **Code Review**: All changes will require review, automated linting maintained
- ✅ **Deployment**: Staging testing, no database migrations required

**Result**: PASS - No constitutional violations detected

## Project Structure

### Documentation (this feature)
```
specs/001-remove-mode-add-category-dropdown/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application structure (Option 2)
components/
├── quick-tasting/
│   ├── QuickTastingSession.tsx  # Main component to modify
│   └── CategoryDropdown.tsx     # New component to create
└── ui/
    └── dropdown.tsx             # Reusable dropdown component

pages/
├── quick-tasting.tsx            # Page component
└── api/
    └── tastings/
        └── [id]/
            └── category.ts      # API endpoint for category updates

lib/
├── supabase.ts                  # Existing Supabase client
└── validations.ts               # Category validation logic

tests/
├── components/
│   └── quick-tasting/
│       ├── QuickTastingSession.test.tsx
│       └── CategoryDropdown.test.tsx
└── integration/
    └── category-change.test.ts
```

**Structure Decision**: Option 2 (Web application) - Frontend components + API endpoints

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Category change data preservation behavior
   - Multi-user session considerations
   - Existing category change functionality analysis

2. **Generate and dispatch research agents**:
   ```
   Task: "Research existing category change functionality in QuickTastingSession.tsx"
   Task: "Analyze data preservation requirements for category changes"
   Task: "Investigate multi-user session handling for category updates"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Session entity: category field modification
   - Category entity: available options and validation
   - State transitions for category changes

2. **Generate API contracts** from functional requirements:
   - Category update endpoint: PUT /api/tastings/[id]/category
   - Category validation endpoint: GET /api/categories
   - Output OpenAPI schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - Category update test file
   - Category validation test file
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Mode removal validation
   - Category dropdown functionality
   - Category change persistence

5. **Update agent file incrementally** (O(1) operation):
   - Add new component patterns for dropdown UI
   - Update recent changes tracking
   - Maintain under 150 lines

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each component → component creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: API contracts before components before integration
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 15-20 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

No violations detected - approach is constitutional and follows existing patterns.

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
