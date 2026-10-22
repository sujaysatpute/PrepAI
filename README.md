# PrepAI - AI-Powered Technical Interview Preparation

PrepAI is a realistic mock interview platform that conducts interactive technical interviews, adapts follow-up questions to your responses, provides structured evaluations with objective scores, and tracks your progress across multiple engineering disciplines.

---

## ✨ Features

- **Tailored Role Tracks**: Frontend, Backend, Full Stack, Mobile, Cloud (AWS, Azure, GCP), Data Science, DevOps, Cybersecurity, and AI/ML.
- **Adaptive AI Interviewer**: Contextual follow-up questioning powered by Google Gemini via a secure serverless function proxy.
- **Transparent Evaluations**: In-depth scorecards evaluating technical knowledge, confidence, clarity, and communication structure.
- **Voice & Text Input**: Practice speaking with real-time speech-to-text input and audio replay for interviewer questions.
- **Privacy-First Local Storage**: Guest mode stores your practice sessions, streak, and metrics directly in your browser.
- **Fully Responsive**: Mobile-first design with drawer navigation and accessible controls.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, React Router v7
- **Backend / Serverless**: Vercel Serverless Functions (Node.js runtime)
- **AI Engine**: Google Gemini API (`@google/genai`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <YOUR_REPO_URL>
   cd prepAI_UI_final
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🚢 Production Deployment (Vercel)

1. Push this repository to your GitHub account.
2. In Vercel, click **Add New Project** and import your repository.
3. Keep default settings (Vite preset, build command `npm run build`, output directory `dist`).
4. Add the following Environment Variable in Vercel project settings:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `<YOUR_GEMINI_API_KEY>`
   *(Do NOT prefix with `VITE_` — API requests are proxied securely server-side through `/api/interview`).*
5. Click **Deploy**.

---

## 🔒 Security

- All AI API calls are routed through a server-side endpoint (`/api/interview`).
- API keys are never bundled into the client-side JavaScript.
- Security headers (CSP, Frame-Options, Content-Type-Options) are configured via `vercel.json`.

---

## 📄 License

MIT
