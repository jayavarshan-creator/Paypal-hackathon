# PayIntellect AI 💳🤖
### Autonomous AI Commerce, Dynamic Pricing & PayPal Sandbox Intelligence Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/payintellect-ai&env=GEMINI_API_KEY,PAYPAL_CLIENT_ID&envDescription=Enter%20your%20Gemini%20API%20key%20and%20PayPal%20Sandbox%20Client%20ID)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![PayPal Developer](https://img.shields.io/badge/PayPal-Sandbox%20Orders%20v2-0070BA)
![Google Gemini](https://img.shields.io/badge/Gemini-3.8%20Flash-orange)
![Vercel Ready](https://img.shields.io/badge/Vercel-Deployable-black)

---

## 🌟 Overview

**PayIntellect AI** is an enterprise-grade payment and commerce intelligence platform integrating the **PayPal Developer Platform (Sandbox)** with **Google Gemini 3.8 Flash** (`@google/genai`).

Built for modern digital commerce, PayIntellect AI replaces rigid, static checkouts and manual disputes with autonomous neural agents:
1. **AI Dynamic Deal Negotiator (DealBot)**: Evaluates buyer proposals in real time, granting margin-aware dynamic discounts (up to 25%) and custom perks with instant **PayPal Orders v2** authorization.
2. **AI Smart Invoicing Engine**: Transforms unstructured natural-language billing prompts into fully formatted **PayPal Invoicing V2** documents with exact mathematical line items, tax breakdowns, and recipient sandbox payment actions.
3. **Dispute & Fraud Defender**: Analyzes incoming PayPal Resolution Center dispute claims, computes a **Dispute Risk Score (0–100)**, verifies **PayPal Seller Protection** eligibility, and drafts policy-compliant formal rebuttal packets.
4. **Live Webhook Telemetry Stream**: Ingests and simulates real-time PayPal webhook events (`PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.APPROVED`, `CUSTOMER.DISPUTE.CREATED`, `INVOICING.INVOICE.PAID`), verifies SHA256 cryptographic signatures, and provides AI-driven financial ledger operational insights.
5. **Judge & Developer Hub**: Interactive 3-minute guided walkthrough, API documentation, and Postman / APIMatic / Zapier compatibility.

---

## 🚀 Quick Deploy to Vercel

### Method 1: Deploy from GitHub (Recommended)

1. **Push this repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of PayIntellect AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/payintellect-ai.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Select your GitHub repository `payintellect-ai`.
   - Vercel automatically detects the Vite framework and uses `vercel.json`.

3. **Configure Environment Variables** in Vercel:
   | Variable Name | Required | Description | Default / Example |
   |---|---|---|---|
   | `GEMINI_API_KEY` | **Yes** | Google Gemini API Key | `AIzaSy...` ([Get key here](https://aistudio.google.com/app/apikey)) |
   | `PAYPAL_CLIENT_ID` | Optional | PayPal Sandbox Client ID | `test` (defaults to PayPal Sandbox demo) |
   | `APP_URL` | Optional | Your deployed domain URL | `https://your-project.vercel.app` |

4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend assets into `dist/` and mount the serverless API routes under `/api/*`.

---

### Method 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```
When prompted:
- Link to existing project? **No**
- Project name: **payintellect-ai**
- Directory: **./**
- Override build settings: **No** (managed by `vercel.json`)

Set your environment variables:
```bash
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v9.x` or higher
- **Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 2. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/payintellect-ai.git
cd payintellect-ai
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` and paste your Gemini API key:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PAYPAL_CLIENT_ID="test"
APP_URL="http://localhost:3000"
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🏗️ Project Architecture

```
payintellect-ai/
├── api/                       # Vercel Serverless Function entry point
│   └── index.ts               # Wraps Express app for Vercel Serverless
├── server/                    # Shared Backend Logic
│   └── app.ts                 # Express routes, PayPal API handlers & Gemini AI models
├── src/                       # React 19 Frontend
│   ├── components/            # UI Components
│   │   ├── Navbar.tsx         # Navigation header & 1-Click Judge Demo trigger
│   │   ├── StoreCheckout.tsx  # Catalog, DealBot negotiator & PayPal Sandbox checkout
│   │   ├── InvoiceStudio.tsx  # Natural-language to PayPal Invoicing V2 generator
│   │   ├── DisputeDefender.tsx# PayPal Resolution Center AI defense & risk scorer
│   │   ├── WebhookInspector.tsx# Real-time webhook stream & cryptographic inspector
│   │   └── JudgeGuide.tsx     # 3-minute evaluator walkthrough & technical docs
│   ├── data/
│   │   └── mockData.ts        # Developer catalog SKUs & preset evaluation scenarios
│   ├── types.ts               # TypeScript data contracts & PayPal schemas
│   ├── App.tsx                # Top-level state & tab router
│   ├── main.tsx               # React DOM entry
│   └── index.css              # Tailwind CSS imports
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI (Typecheck & Build verification)
├── server.ts                  # Local development & full-stack container server
├── vercel.json                # Vercel deployment & routing configuration
├── package.json
└── tsconfig.json
```

---

## 🛡️ PayPal Technologies & APIs Integrated

- **PayPal Orders v2 API**:
  - `POST /api/paypal/create-order`: Calculates subtotal, AI negotiated discount, and sales tax to construct valid PayPal Orders v2 purchase units.
  - `POST /api/paypal/capture-order`: Captures payment and updates order ledger.
- **PayPal Invoicing API v2**:
  - `POST /api/ai/generate-invoice`: Generates itemized invoices with line items, tax rate, payment terms, and direct recipient checkout links.
- **PayPal Disputes & Resolution Center**:
  - `POST /api/ai/analyze-dispute`: Analyzes chargebacks under PayPal Seller Protection terms, computes risk scores, and generates formal rebuttals.
- **PayPal Webhooks API**:
  - `POST /api/webhooks/simulate`: Emits `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.APPROVED`, `CUSTOMER.DISPUTE.CREATED`, and `INVOICING.INVOICE.PAID` events.

---

## 🤖 AI Platform & Models Used

- **Model**: `gemini-3.8-flash` via `@google/genai` TypeScript SDK.
- **Telemetry**: User-Agent `aistudio-build` header configured on all server-side requests.
- **Structured Outputs**: Uses `responseMimeType: "application/json"` and strict `responseSchema` (`Type.OBJECT`, `Type.ARRAY`) for predictable, deterministic integration with PayPal APIs.

---

## 🧪 Testing the App (For Judges)

1. **AI Price Bargaining**: Add any item to your cart in the AI Store tab. Type a proposal in DealBot (e.g. *"I am an indie developer, can I get 15% off?"*) or click a preset pitch. DealBot will approve a discount code and adjust the PayPal Orders v2 payload.
2. **Instant Sandbox Checkout**: Click the yellow **PayPal Sandbox Checkout** button to execute a live Orders v2 capture.
3. **Smart Invoicing**: Click the **Smart Invoicing Studio** tab, select the *"AI Consulting Contract"* preset, and generate a PayPal invoice. Click **"Pay Invoice"** to simulate recipient payment.
4. **Dispute Defense**: Click the **Dispute & Fraud Defender** tab, choose *"Scenario #1 ($349 Unauthorized)"*, and run the assessment to view the Risk Score and copy the generated rebuttal.
5. **Webhook Telemetry**: Click the **Webhook Telemetry** tab and click **"Trigger Webhook Event"** to see live signature verification and Gemini financial insights.

---

## 📜 License
Apache-2.0 License. Built for the PayPal Developer & AI Hackathon.
