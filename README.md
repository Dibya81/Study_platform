# Consensus Engine

> A multi-model verification engine featuring a premium SaaS 2.0 interface.

Consensus Engine is a powerful AI platform that leverages parallel model generation (Meta Llama & Ministral) and strict judge verification (Amazon Nova Pro) to deliver hallucination-free output. 

## 🚀 Features

- **Consensus Architecture**: User Request → Parallel Generation → Nova Verification.
- **SaaS 2.0 Interface**: Bento Grid layout, structural glassmorphism, fluid responsive design.
- **Code Hub Environment**: Execute, analyze, and explain code in a secure sandboxed environment.
- **AI Mentor**: Context-aware coding assistance with hallucination-free learning.
- **Community**: Linked interactive solvers sharing embeddings.

## 🛠️ Project Structure

The project is split into two main monoliths:
- `/frontend`: Pure HTML, Vanilla CSS, and Vanilla JavaScript (Zero build-step needed for static deployment).
- `/backend`: Node.js Express server acting as the intelligence orchestrator (interfaces with AWS Bedrock).

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- AWS Credentials configured (for Bedrock access)

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend
Since the frontend uses pure HTML/JS/CSS, you can launch it using any static server:
```bash
cd frontend
npx serve . 
# Or just open index.html in a browser!
```

## 🌐 Deployment & Hosting

### Deploying the Frontend (Netlify / Vercel / GitHub Pages)
Because the frontend is entirely static, deployment is instantaneous.
1. Connect your repository to Vercel/Netlify.
2. Set the root directory to `frontend/`.
3. No build command is required. Set the publish directory to `/`.

### Deploying the Backend (Render / Heroku / AWS)
1. Deploy the `backend/` directory as a Node.js web service.
2. Provide your `.env` variables (e.g., `PORT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
3. Set the start command to `node server.js` or `npm start`.

---
*Built for the future of verified AI intelligence.*
