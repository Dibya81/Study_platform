# Technical Architecture: Consensus Engine

## System Overview
Consensus Engine is a decentralized intelligence platform designed to route user queries through multiple Large Language Models simultaneously, before passing the outputs through a strict 'Judge' model for final verification.

## 1. Frontend Architecture
**Stack:** HTML5, Vanilla CSS3, Vanilla JavaScript.

- **Routing / State:** Utilizes an `iframe` driven layout (`index.html` orchestrating `dashboard.html`, `aihub.html`, etc.) for seamless page transitions without full reloads.
- **Persistence:** Relies on `localStorage` for cross-page state management (e.g., the `spatialTheme` toggling).
- **Styling Methodology:** 
  - Comprehensive custom CSS Variables (`theme.css`) instead of utility frameworks.
  - Native CSS Grid for modular component layouts (Bento Grid).
  - Heavy use of CSS 3D Transforms and Hardware Acceleration (`translateZ`, `will-change`).

## 2. Backend Orchestrator
**Stack:** Node.js, Express.

- **API Layer:** RESTful endpoints that manage user sessions, model proxying, and history.
- **Model Orchestration (AWS Bedrock):**
  - **Generators:** Meta Llama 4 and Ministral 8B handle the initial parallel request generation.
  - **Verifier/Judge:** Amazon Nova Pro evaluates the outputs from the generators to synthesize a verified, hallucination-free response.
- **Data Layer:** Edged cached database system handling long-term progression embeddings and user history.

## 3. The Consensus Pipeline Flow
1. **Client Request:** User submits a prompt via the Code Hub or AI Mentor interface.
2. **Parallel Generation (Fan-out):** The Node.js backend simultaneously queries Llama and Mistral.
3. **Synthesis (Fan-in):** Both responses are packaged and sent to Amazon Nova Pro with a strict system prompt to evaluate accuracy, logic, and safety.
4. **Delivery:** The verified output is streamed back to the frontend environment.
