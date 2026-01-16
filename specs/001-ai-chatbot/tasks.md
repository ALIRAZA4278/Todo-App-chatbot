# Tasks: Phase III AI Chatbot

**Input**: Design documents from `/specs/001-ai-chatbot/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Test tasks included per feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment setup and dependency verification

- [x] T001 Verify GEMINI_API_KEY is set in backend/.env
- [x] T002 [P] Install openai Python SDK in backend (pip install openai)
- [x] T003 [P] Verify existing MCP tools in backend/app/mcp_tools.py are functional
- [x] T004 Create backend/app/schemas.py for chat-related Pydantic models

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Layer

- [x] T005 Add Conversation model to backend/app/models.py (id, user_id, created_at, updated_at)
- [x] T006 Add Message model to backend/app/models.py (id, user_id, conversation_id, role, content, created_at)
- [x] T007 Run database migration to create conversations and messages tables

### Agent Core

- [x] T008 Create backend/app/agent.py with TodoOrchestratorAgent class
- [x] T009 Configure OpenAI client with Gemini base_url in backend/app/agent.py
- [x] T010 Register all 6 MCP tools with agent in OpenAI function format
- [x] T011 Implement agent system prompt with bilingual support (English + Roman Urdu)
- [x] T012 Implement tool execution handler that calls MCP tool functions

### Chat Endpoint Core

- [x] T013 Create backend/app/routes/chat.py with router
- [x] T014 Implement POST /api/{user_id}/chat endpoint structure
- [x] T015 Add JWT authentication dependency to chat endpoint
- [x] T016 Implement user_id validation (JWT user_id must match URL user_id)
- [x] T017 Register chat router in backend/app/main.py

### Frontend Core

- [x] T018 Create frontend/lib/chat-api.ts with API client functions
- [x] T019 Create frontend/hooks/useChat.ts custom hook for chat state management
- [x] T020 [P] Create frontend/components/chat/ChatWidget.tsx (main container)
- [x] T021 [P] Create frontend/components/chat/ChatIcon.tsx (floating button)
- [x] T022 [P] Create frontend/components/chat/ChatPanel.tsx (overlay panel)
- [x] T023 [P] Create frontend/components/chat/ChatHeader.tsx (title + close button)
- [x] T024 [P] Create frontend/components/chat/MessageList.tsx (scrollable container)
- [x] T025 [P] Create frontend/components/chat/MessageBubble.tsx (single message)
- [x] T026 [P] Create frontend/components/chat/ChatInput.tsx (input + send button)
- [x] T027 [P] Create frontend/components/chat/TypingIndicator.tsx (loading animation)
- [x] T028 Create frontend/components/chat/index.ts (exports)
- [x] T029 Add ChatWidget to frontend/app/(app)/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add Task via Chat (Priority: P1) 🎯 MVP

**Goal**: User can add tasks through natural language chat

**Acceptance Criteria**:
- User types "add task buy groceries" and task is created
- AI confirms with task details in response
- Task appears in main todo list after refresh

**Independent Test**: Open chat, type "add task test from chat", verify task appears in todo list

### Implementation for User Story 1

- [x] T030 [US1] Ensure add_task MCP tool accepts title and optional description parameters
- [x] T031 [US1] Implement conversation creation flow in chat endpoint (new conversation if no conversation_id)
- [x] T032 [US1] Implement message persistence (save user message to DB)
- [x] T033 [US1] Wire agent to receive user message and context (user_id, conversation history)
- [x] T034 [US1] Implement agent tool call resolution loop (handle add_task tool calls)
- [x] T035 [US1] Persist assistant response to DB and return to frontend
- [x] T036 [US1] Connect frontend ChatInput to sendMessage API call
- [x] T037 [US1] Display assistant response in MessageList
- [ ] T038 [US1] Test: Send "add task groceries" and verify task created via /api/{user_id}/todos

**Checkpoint**: User Story 1 complete - users can add tasks via chat

---

## Phase 4: User Story 2 - View Tasks via Chat (Priority: P1)

**Goal**: User can view their tasks through chat

**Acceptance Criteria**:
- User asks "show my tasks" and sees task list in chat
- Tasks display with ID, title, and completion status
- Supports filtering by status ("show completed tasks")

**Independent Test**: Add 3 tasks manually, open chat, type "show my tasks", verify all 3 appear

### Implementation for User Story 2

- [x] T039 [US2] Verify list_tasks MCP tool returns proper format with task IDs
- [x] T040 [US2] Ensure agent correctly selects list_tasks for "show", "list", "view" intents
- [x] T041 [US2] Implement status filter support in agent (pending/completed/all)
- [x] T042 [US2] Format task list response for readability (numbered list with status icons)
- [ ] T043 [US2] Test: Request "show my pending tasks" and verify filtered results

**Checkpoint**: User Stories 1 AND 2 complete - users can add and view tasks via chat

---

## Phase 5: User Story 3 - Complete Task via Chat (Priority: P2)

**Goal**: User can mark tasks complete/incomplete through chat

**Acceptance Criteria**:
- User says "complete task 5" and task is marked done
- AI confirms the action with task title
- User can also reopen tasks ("reopen task 5")

**Independent Test**: Create task, note ID, type "complete task {ID}", verify status changed

### Implementation for User Story 3

- [x] T044 [US3] Verify toggle_task_completion MCP tool works with task_id
- [x] T045 [US3] Ensure agent handles "complete", "done", "finish", "reopen" intents
- [x] T046 [US3] Agent must list tasks first to help user identify task ID if not provided
- [x] T047 [US3] Implement confirmation message with task title (not just ID)
- [ ] T048 [US3] Test: Create task, complete via chat, verify todo list shows completion

**Checkpoint**: User Story 3 complete - users can complete tasks via chat

---

## Phase 6: User Story 4 - Delete Task via Chat (Priority: P2)

**Goal**: User can delete tasks through chat with confirmation

**Acceptance Criteria**:
- User says "delete task 5" and is asked for confirmation
- AI asks "Are you sure you want to delete 'Buy groceries'?" before deleting
- Confirmation required before destructive action

**Independent Test**: Create task, note ID, type "delete task {ID}", confirm, verify task removed

### Implementation for User Story 4

- [x] T049 [US4] Verify delete_task MCP tool works with task_id
- [x] T050 [US4] Implement confirmation flow in agent system prompt
- [x] T051 [US4] Agent must fetch task title before asking confirmation
- [x] T052 [US4] Handle user confirmation ("yes", "confirm", "no", "cancel")
- [ ] T053 [US4] Test: Delete task flow with confirmation, verify task removed

**Checkpoint**: User Story 4 complete - users can delete tasks via chat with safety confirmation

---

## Phase 7: User Story 5 - Search Tasks via Chat (Priority: P3)

**Goal**: User can search tasks by keyword

**Acceptance Criteria**:
- User says "find tasks about groceries" and matching tasks appear
- Search matches both title and description
- Returns message if no matches found

**Independent Test**: Create tasks with "meeting" in title, type "search meeting", verify results

### Implementation for User Story 5

- [x] T054 [US5] Verify search_tasks MCP tool searches title and description
- [x] T055 [US5] Ensure agent handles "find", "search", "look for" intents
- [x] T056 [US5] Implement "no results found" response
- [ ] T057 [US5] Test: Search for non-existent keyword, verify appropriate message

**Checkpoint**: User Story 5 complete - users can search tasks via chat

---

## Phase 8: User Story 6 - Ask About Account via Chat (Priority: P3)

**Goal**: User can ask about their account info

**Acceptance Criteria**:
- User asks "who am I" or "what's my email" and sees account info
- Displays user email and name from JWT context

**Independent Test**: Open chat, type "what's my email", verify correct email shown

### Implementation for User Story 6

- [x] T058 [US6] Implement get_my_user_info MCP tool to extract info from user context
- [x] T059 [US6] Pass user email/name from JWT to agent context
- [x] T060 [US6] Agent handles "who am I", "my email", "my account" intents
- [ ] T061 [US6] Test: Ask "who am I" and verify email matches logged-in user

**Checkpoint**: User Story 6 complete - users can inquire about their account

---

## Phase 9: User Story 7 - Continue Conversation After Refresh (Priority: P2)

**Goal**: Chat history persists across page refreshes

**Acceptance Criteria**:
- User refreshes page and previous chat messages remain
- conversation_id is stored in localStorage or URL state
- Messages load on chat panel open

**Independent Test**: Send messages, refresh page, open chat, verify messages visible

### Implementation for User Story 7

- [x] T062 [US7] Implement GET /api/{user_id}/conversations endpoint in backend/app/routes/chat.py
- [x] T063 [US7] Implement GET /api/{user_id}/conversations/{id}/messages endpoint
- [x] T064 [US7] Store conversation_id in localStorage after first message
- [x] T065 [US7] Load conversation history on chat panel mount
- [x] T066 [US7] Add conversation list API call to chat-api.ts
- [x] T067 [US7] Update useChat hook to load history on init
- [ ] T068 [US7] Test: Send message, refresh, verify history loads

**Checkpoint**: User Story 7 complete - conversation persistence working

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Hardening and UX improvements

### Error Handling

- [ ] T069 [P] Add error boundary around ChatWidget component
- [ ] T070 [P] Implement retry button for failed messages
- [ ] T071 [P] Add toast notifications for errors in frontend
- [ ] T072 Implement graceful AI service unavailable handling (503 response)

### Rate Limiting

- [ ] T073 Implement per-user rate limiting (30 req/min) in chat endpoint
- [ ] T074 Return user-friendly 429 message when rate limited
- [ ] T075 Display rate limit message in chat UI

### UX Polish

- [x] T076 [P] Add message loading state (typing indicator)
- [x] T077 [P] Auto-scroll to latest message on new message
- [x] T078 [P] Add keyboard shortcut (Enter to send, Shift+Enter for newline)
- [x] T079 [P] Mobile-responsive chat panel styling
- [x] T080 [P] Add animation for chat panel open/close

### Validation

- [ ] T081 Run quickstart.md verification checklist
- [ ] T082 Test all 7 user stories end-to-end
- [ ] T083 Verify JWT authentication on all endpoints
- [ ] T084 Security review: ensure user_id isolation in all queries

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup → No dependencies
     ↓
Phase 2: Foundational → BLOCKS all user stories
     ↓
Phases 3-9: User Stories → All depend on Phase 2
     ↓
Phase 10: Polish → After desired user stories complete
```

### User Story Dependencies

| Story | Priority | Can Start After | Independent? |
|-------|----------|-----------------|--------------|
| US1 - Add Task | P1 | Phase 2 | Yes |
| US2 - View Tasks | P1 | Phase 2 | Yes |
| US3 - Complete Task | P2 | Phase 2 | Yes |
| US4 - Delete Task | P2 | Phase 2 | Yes |
| US5 - Search Tasks | P3 | Phase 2 | Yes |
| US6 - Account Info | P3 | Phase 2 | Yes (requires T058) |
| US7 - Persistence | P2 | Phase 2 | Yes |

### Parallel Opportunities

- **Phase 1**: T002, T003 can run in parallel
- **Phase 2**: T020-T027 (frontend components) can run in parallel
- **User Stories**: Can be worked on in parallel after Phase 2
- **Phase 10**: T069-T071, T076-T080 can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (4 tasks)
2. Complete Phase 2: Foundational (25 tasks)
3. Complete Phase 3: User Story 1 - Add Task (9 tasks)
4. **STOP and VALIDATE**: Test adding tasks via chat
5. Demo/deploy if ready

### Recommended Sequence

1. **Sprint 1 (MVP)**: Phase 1 + Phase 2 + US1 + US2
2. **Sprint 2**: US3 + US4 + US7 (core task management)
3. **Sprint 3**: US5 + US6 + Phase 10 (polish)

### Task Count Summary

| Phase | Tasks | Cumulative |
|-------|-------|------------|
| Setup | 4 | 4 |
| Foundational | 25 | 29 |
| US1 - Add Task | 9 | 38 |
| US2 - View Tasks | 5 | 43 |
| US3 - Complete Task | 5 | 48 |
| US4 - Delete Task | 5 | 53 |
| US5 - Search Tasks | 4 | 57 |
| US6 - Account Info | 4 | 61 |
| US7 - Persistence | 7 | 68 |
| Polish | 16 | 84 |

**Total: 84 tasks**

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MCP tools already exist in backend/app/mcp_tools.py - verify, don't recreate
