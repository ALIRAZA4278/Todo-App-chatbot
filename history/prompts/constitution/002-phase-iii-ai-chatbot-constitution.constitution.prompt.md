---
id: 002
title: Phase III AI Chatbot Constitution
stage: constitution
date: 2026-01-16
surface: agent
model: claude-opus-4-5-20250114
feature: none
branch: main
user: developer
command: /sp.constitution
labels: ["constitution", "phase-iii", "ai-chatbot", "mcp-tools", "agent-architecture"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document)
---

## Prompt

— TODO FULL-STACK AI CHATBOT SYSTEM
🎯 SYSTEM MISSION

Design and implement a production-grade, AI-powered Todo Management Platform that extends an existing Full-Stack Todo Application by integrating an intelligent, conversational AI chatbot.

The chatbot must allow users to manage todos entirely via natural language, using a stateless, scalable backend architecture, powered by OpenAI Agents SDK (using Gemini API key) and MCP (Model Context Protocol) tools.

This system must be built using the Agentic Dev Stack workflow with NO manual coding, relying strictly on Spec-Kit Plus and Claude Code.

🧩 CORE DESIGN PRINCIPLES (NON-NEGOTIABLE)

Agent-First Architecture
- All business logic is driven by AI agents
- No hard-coded intent routing
- AI decides tool usage

Stateless Server
- Backend holds zero in-memory state
- All context persists in the database
- Safe for horizontal scaling & restarts

Tool-Driven AI (MCP)
- AI can only modify system state via MCP tools
- MCP tools are deterministic, stateless, and auditable

Seamless Integration
- AI chatbot integrates into the existing backend
- No parallel systems or duplicated logic

Professional UX
- Chat UI must feel premium, modern, and reliable
- AI responses must be friendly, concise, and confident

🏗️ SYSTEM SCOPE
This constitution governs:
- Backend API (FastAPI)
- AI agent behavior (OpenAI Agents SDK)
- MCP server & tools
- Database models & persistence
- Conversation lifecycle
- Error handling
- UI/UX expectations for chatbot frontend
- Security & authentication alignment

🧱 EXISTING SYSTEM CONTEXT
The AI chatbot extends an existing Full-Stack Todo Application with:
- Frontend: Next.js (already implemented)
- Backend: Python FastAPI
- Database: Neon Serverless PostgreSQL
- ORM: SQLModel
- Authentication: Better Auth
- Users: Identified by email / user_id

The chatbot must NOT replace existing logic — it must reuse and integrate with it.

🤖 AI ARCHITECTURE OVERVIEW
AI Framework:
- OpenAI Agents SDK
- Uses Gemini API key via OpenAI-compatible interface
- Agent Runner handles execution

High-Level Flow:
1. User sends message from Chat UI
2. Backend receives stateless request
3. Conversation history loaded from DB
4. AI agent invoked with MCP tools
5. Agent calls tools as needed
6. Results persisted
7. Response returned to frontend

🧠 AGENT CONSTITUTION

Primary Agent: Todo Orchestrator Agent
The system SHALL define a single primary AI agent responsible for:
- Understanding user intent
- Selecting MCP tools
- Chaining multiple tools if needed
- Generating final responses

The agent MUST:
- Never hallucinate data
- Never bypass MCP tools
- Always confirm user-affecting actions

Logical Sub-Agents (Conceptual, Not Separate Processes):
1. Task Management Intelligence - Adds, lists, updates, completes, deletes todos
2. Conversation Context Intelligence - Restores chat context from database
3. User Context Awareness - Understands authenticated user
4. Confirmation & UX Intelligence - Produces friendly, professional responses
5. Error Recovery Intelligence - Graceful handling of missing tasks, invalid input

🧰 MCP TOOL GOVERNANCE

Required MCP Tools:
- add_task: Create todo
- list_tasks: Retrieve todos
- complete_task: Mark complete
- delete_task: Remove todo
- update_task: Modify todo

🗄️ DATA & MEMORY CONSTITUTION

Database Is The Only Memory. The system SHALL persist:
- Tasks
- Conversations
- Messages

Required Models:
- Task: user_id, id, title, description, completed, created_at, updated_at
- Conversation: user_id, id, created_at, updated_at
- Message: user_id, conversation_id, role, content, created_at

🔐 AUTHENTICATION & SECURITY
- Every chat request is scoped to authenticated user
- AI can ONLY access user's own tasks and conversations
- User identity is injected into agent context
- No cross-user data access allowed

🗣️ NATURAL LANGUAGE GUARANTEES
The agent MUST correctly interpret:
- Task creation intents
- Task listing (all / pending / completed)
- Task completion
- Task deletion (even by name)
- Task updates
- Ambiguous commands (with clarification)

💬 RESPONSE QUALITY STANDARDS
AI responses MUST be: Clear, Friendly, Professional, Action-confirming, UI-ready

🚨 ERROR HANDLING CONSTITUTION
The system MUST:
- Never crash on bad input
- Never expose stack traces
- Offer recovery suggestions

🖥️ FRONTEND UX CONSTITUTION
Chat UI MUST:
- Feel premium and modern
- Support long conversations
- Show loading states
- Clearly separate user vs AI messages
- Handle reconnects gracefully

📦 DELIVERABLES GOVERNED BY THIS CONSTITUTION
- AI-enabled FastAPI backend
- MCP server with defined tools
- ChatKit-based frontend
- Specs folder (agents + tools)
- Database migrations
- README documentation

🏁 FINAL CONSTITUTIONAL GUARANTEE
This system SHALL deliver:
✅ A fully integrated AI Todo Chatbot
✅ Stateless, scalable backend
✅ MCP-driven AI actions
✅ Professional UX
✅ Resume-safe conversations
✅ Agentic architecture aligned with Spec-Kit Plus

## Response snapshot

Updated constitution from v1.0.0 to v2.0.0 (MAJOR version bump) for Phase III AI Chatbot System.

Key additions:
- Core Design Principles: Agent-First, Stateless Server, Tool-Driven AI, Seamless Integration, Professional UX
- AI Architecture Overview with high-level flow diagram
- Agent Constitution: Primary Agent (Todo Orchestrator) + 5 Logical Sub-Agents
- MCP Tool Governance: 6 required tools (add_task, list_tasks, toggle_task_completion, delete_task, get_my_user_info, search_tasks)
- Data & Memory Constitution: New Conversation and Message models
- Natural Language Guarantees table
- Response Quality Standards with examples
- Error Handling Constitution
- Frontend UX Constitution for Chat UI
- Extended API Constitution with chat endpoints
- Extended Security Rules for AI access control
- Phase III Scope Boundaries

All templates verified compatible with new principles.

## Outcome

- ✅ Impact: Major constitution update establishing governance for Phase III AI Chatbot System
- 🧪 Tests: N/A (constitution document)
- 📁 Files: 1 file updated (.specify/memory/constitution.md)
- 🔁 Next prompts: /sp.specify for AI chatbot feature, /sp.plan for implementation planning
- 🧠 Reflection: Comprehensive constitution covering all aspects of AI chatbot integration while preserving Phase II principles

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (documentation)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
