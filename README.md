# Idea-to-Invention Pipeline

A sophisticated multi-agent LLM pipeline that automates the transformation of raw invention concepts into structured, patent-ready technical blueprints. This project showcases advanced software engineering practices, Deno serverless architecture, and multi-agent AI orchestration.

---

## 🚀 Live Demo & Presentation
* **Deployed Application:** [idea-to-invention-ai.vercel.app](https://idea-to-invention-ai.vercel.app/)
* **Project Walkthrough:** [YouTube Demo Video](https://youtu.be/pOOXZ905tsE?si=q6ffEHR2DW2vvLcp)

---

## 💡 The Problem
Turning a raw invention idea into structured, professional patent documentation is a high-friction process. It typically requires:
* Deep domain expertise across specialized technical disciplines.
* Extensive manual prior-art search and literature review.
* Comprehensive technical feasibility and risk assessment.
* Precise patent-style drafting capabilities.

This barrier slows down individual innovators and creates high administrative overhead for organizations evaluating new ideas.

---

## 🛠️ The Solution: Multi-Agent Orchestration
The **Idea-to-Invention Pipeline** automates this workflow using a **modular, multi-agent pipeline** powered by Google Gemini. Instead of querying a single model with a monolithic prompt, the system routes the idea through six specialized agents. Each agent builds sequentially on the outputs of the previous stages, ensuring superior depth, technical accuracy, and structured outputs.

### Sequential Multi-Agent Flow
```
       [ Raw Invention Idea ]
                 │
                 ▼
      1. Idea Intake Agent        ──► Cleanses and titles the concept
                 │
                 ▼
      2. Problem Analysis Agent   ──► Articulates pain points & target audience
                 │
                 ▼
      3. Prior Art Research Agent ──► Analyzes similar ideas & limitations
                 │
                 ▼
      4. Feasibility Agent        ──► Evaluates engineering & resource requirements
                 │
                 ▼
      5. Innovation Agent         ──► Identifies unique differentiators
                 │
                 ▼
      6. Patent Writer Agent      ──► Compiles a structured, patent-ready blueprint
                 │
                 ▼
     [ Structured Blueprint Output ]
```

---

## 🖥️ Technology Stack

### Frontend
* **Core:** React 18 & TypeScript
* **Styling:** Tailwind CSS & Radix UI (shadcn/ui layout tokens)
* **Build Tool:** Vite
* **State & Querying:** TanStack React Query & browser local storage for history persistence
* **Design Theme:** Handcrafted dark slate dashboard featuring clean glassmorphism styling and custom tech badges

### Backend & AI
* **Serverless Backend:** Supabase Edge Functions (Deno Runtime)
* **LLM Engine:** Google Gemini 2.5 Flash / Gemini API Integration
* **API Routing:** Secure server-to-server connection via Supabase Edge Function to prevent exposing API keys to the client

---

## 📦 System Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (React)              │
│  ┌─────────────────────────────────┐   │
│  │  IdeaInput Component            │   │
│  │  AgentTimeline Component        │   │
│  │  BlueprintResults Component     │   │
│  │  HistorySidebar Component       │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ Secure HTTPS CORS
                  ▼
┌─────────────────────────────────────────┐
│   Backend (Supabase Edge Functions)     │
│  ┌─────────────────────────────────┐   │
│  │  invention-pipeline function    │   │
│  │    - Sequential orchestration   │   │
│  │    - Context memory management  │   │
│  │    - Structured JSON fallbacks  │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ Deno standard HTTPS
                  ▼
┌─────────────────────────────────────────┐
│        Google Gemini API Service        │
│  - Multi-agent prompt execution         │
│  - System-level instruction sets        │
└─────────────────────────────────────────┘
```

---

## 📂 Project Structure
```
├── src/
│   ├── components/       # Reusable UI dashboard elements
│   │   ├── ui/           # Headless shadcn base design tokens
│   │   ├── IdeaInput.tsx # Invention concept capture
│   │   ├── AgentTimeline.tsx # Visual execution timeline
│   │   └── BlueprintResults.tsx # Tabbed patent documentation details
│   ├── integrations/     # Supabase client declarations
│   ├── lib/              # Client state, types, and LocalStorage keys
│   └── pages/            # Core Index.tsx dashboard viewport
├── supabase/
│   └── functions/
│       └── invention-pipeline/ # Deno Edge Function script orchestrating Gemini Agents
├── tailwind.config.ts    # Extended style framework definitions
└── vite.config.ts        # Bundler optimization setups
```

---

## ⚙️ Local Development Setup

Follow these steps to run the pipeline dashboard and backend functions locally.

### Prerequisites
* **Node.js:** v18.x or later installed
* **Supabase CLI:** Installed (if deploying Edge Functions)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/JahnaviPolisetty/idea-to-invention-ai.git
cd idea-to-invention-ai
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and add your Supabase project parameters:
```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
```

### 3. Run the Frontend Dashboard
Start the local Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:8080` to interact with the dashboard.

### 4. Deploying Backend Edge Functions
If you want to run the serverless backend function on your own Supabase instance:
```bash
# Login to Supabase CLI
supabase login

# Deploy the pipeline edge function
supabase functions deploy invention-pipeline --project-ref your-project-id

# Set your Gemini API key in the deployed function env
supabase secrets set GEMINI_API_KEY="your-gemini-api-key" --project-ref your-project-id
```

---

## 👨‍💻 Author
* **Jahnavi Polisetty** - [GitHub](https://github.com/JahnaviPolisetty) | [Email](mailto:jahnavi2645@gmail.com)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
