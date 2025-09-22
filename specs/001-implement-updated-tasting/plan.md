
# Implementation Plan: Implement Updated Tasting Flow Specification

**Branch**: `001-implement-updated-tasting` | **Date**: September 22, 2025 | **Spec**: /specs/001-implement-updated-tasting/spec.md
**Input**: Feature specification from `/specs/001-implement-updated-tasting/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Implement a comprehensive tasting flow system supporting three distinct modes: Quick Tasting for personal sessions, Study Mode for learning-focused tastings with two approaches (Pre-defined Items and Collaborative), and Competition Mode for group evaluations with preloaded items and host controls. The system will include an enhanced category system with five parameter types, participant ranking capabilities, host/participant role management, and collaborative item suggestion workflows.

## Technical Context
**Language/Version**: TypeScript 5.x, JavaScript ES2020
**Primary Dependencies**: Next.js 14.x, React 18.x, Supabase client, Tailwind CSS
**Storage**: PostgreSQL via Supabase (managed database service)
**Testing**: Jest for unit tests, React Testing Library for component tests, Playwright for E2E
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge), Node.js runtime
**Project Type**: Web application (frontend + backend API routes in single Next.js app)
**Performance Goals**: <2 second page loads, <500ms API responses, support 100+ concurrent users
**Constraints**: Client-side rendering, responsive mobile-first design, offline photo upload capability
**Scale/Scope**: 5-10 main pages, 20+ components, 8 database tables, RESTful API endpoints

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Initial Status**: PASS - Constitution file contains template structure with no specific principles defined yet. No violations to check against.

**Post-Design Status**: PASS - Design follows established Next.js patterns, no architectural violations detected.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Current Next.js Web Application Structure (Option 2)
pages/                           # Next.js pages (frontend routes + API routes)
├── api/                        # API endpoints (backend)
├── _app.tsx                    # App wrapper
├── index.tsx                   # Home page
├── dashboard.tsx              # Dashboard page
├── create-tasting.tsx         # NEW: Create tasting page
├── quick-tasting.tsx          # Quick tasting flow
└── [other pages]

components/                     # React components
├── quick-tasting/             # Tasting-related components
│   ├── QuickTastingSession.tsx
│   ├── TastingItem.tsx
│   ├── FlavorWheel.tsx
│   ├── CompetitionRanking.tsx # NEW
│   └── [other components]
├── auth/                      # Authentication components
├── profile/                   # Profile components
└── [other component folders]

lib/                           # Utilities and services
├── supabase.ts               # Database client
├── profileService.ts         # Profile service
├── historyService.ts         # History service
├── toast.js                  # Toast notifications
└── validations.ts           # Validation utilities

styles/                        # Global styles
contexts/                      # React contexts
hooks/                         # Custom hooks
```

**Structure Decision**: Option 2 - Web application (frontend pages + backend API routes in single Next.js app)

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- **Database Tasks**: Migration script execution, schema validation
- **API Tasks**: Each endpoint contract → implementation task + test task
- **Component Tasks**: Each UI component from quickstart scenarios → implementation task
- **Integration Tasks**: Each user story scenario → E2E test task
- **Category System Tasks**: Parameter type implementations (5 types)
- **Competition Tasks**: Host controls, participant management, ranking logic

**Ordering Strategy**:
1. **Foundation**: Database migration and schema setup
2. **Core API**: Authentication and basic tasting operations
3. **Category System**: Parameter types and validation logic
4. **Competition Logic**: Participant management and scoring
5. **UI Components**: Core forms and displays
6. **Integration**: Blind tasting, host controls, real-time features
7. **Testing**: Contract tests, integration tests, E2E validation

**Parallel Execution Opportunities**:
- [P] Independent API endpoints (create, categories, participants)
- [P] Component implementations (forms, displays, controls)
- [P] Parameter type handlers (5 types can be developed in parallel)
- [P] Contract test implementations

**Dependency Management**:
- Database schema must complete before any API work
- Category system must complete before competition features
- Basic UI must complete before advanced features (blind tasting, host controls)

**Estimated Output**: 45-55 numbered, ordered tasks in tasks.md covering:
- 10 database/entity tasks (including Study Mode collaborative features)
- 16 API implementation tasks (including suggestion/moderation endpoints)
- 18 UI component tasks (including dual role management)
- 8 integration feature tasks (including collaborative workflows)
- 5 testing and validation tasks

**Risk Mitigation**:
- Complex category parameter system flagged for early implementation
- Study Mode collaborative workflows (suggestion/moderation) identified as high-risk
- Competition real-time features identified as high-risk
- Host/participant dual role management separated into manageable subtasks
- Item suggestion workflow tested incrementally

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


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
