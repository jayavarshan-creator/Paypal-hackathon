import React, { useState } from 'react';
import { 
  Award, CheckCircle2, Code, ShieldCheck, Terminal, 
  ExternalLink, Sparkles, BookOpen, Layers, Copy, Check 
} from 'lucide-react';

interface JudgeGuideProps {
  onRunTestScenario: (scenarioType: 'STORE' | 'INVOICE' | 'DISPUTE' | 'WEBHOOK') => void;
}

export const JudgeGuide: React.FC<JudgeGuideProps> = ({ onRunTestScenario }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-yellow-900/30 to-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2">
              <Award className="w-4 h-4" />
              <span>PayPal AI Hackathon Submission Dossier</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              PayIntellect AI Evaluation Hub
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
              This guide provides judges and evaluators with a 3-minute guided walkthrough, architectural breakdown of the PayPal Developer Platform + Gemini AI integrations, and complete API specifications.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs font-mono shrink-0">
            <div className="text-slate-400">Environment:</div>
            <div className="text-emerald-400 font-bold">PayPal Sandbox (Active)</div>
            <div className="text-slate-400 mt-1">AI Model:</div>
            <div className="text-blue-400 font-bold">Google Gemini 3.8 Flash</div>
          </div>
        </div>
      </div>

      {/* 3-Minute Interactive Judge Walkthrough Cards */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <span>Interactive 3-Minute Judge Walkthrough</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Step 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-blue-500/40 transition-all">
            <div>
              <div className="text-xs font-mono font-bold text-blue-400 mb-1">STEP 01</div>
              <h3 className="font-bold text-white text-sm mb-2">AI Price Bargaining &amp; Orders v2</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add an item to the cart, pitch DealBot for a 15% discount. DealBot reasons about margins, awards a discount code, and updates the PayPal Orders v2 payload.
              </p>
            </div>
            <button
              onClick={() => onRunTestScenario('STORE')}
              className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Test Store &amp; DealBot
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
            <div>
              <div className="text-xs font-mono font-bold text-indigo-400 mb-1">STEP 02</div>
              <h3 className="font-bold text-white text-sm mb-2">Natural Language Invoicing v2</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Type or pick a preset prompt. Gemini outputs a structured PayPal Invoicing document with line items, tax rates, and a simulated recipient payment action.
              </p>
            </div>
            <button
              onClick={() => onRunTestScenario('INVOICE')}
              className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Test Smart Invoicing
            </button>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-rose-500/40 transition-all">
            <div>
              <div className="text-xs font-mono font-bold text-rose-400 mb-1">STEP 03</div>
              <h3 className="font-bold text-white text-sm mb-2">Dispute Risk &amp; Seller Protection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review a PayPal unauthorized transaction dispute. Gemini calculates a Risk Score, drafts an official Resolution Center rebuttal, and executes sandbox refund actions.
              </p>
            </div>
            <button
              onClick={() => onRunTestScenario('DISPUTE')}
              className="mt-4 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Test Dispute Defender
            </button>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-sky-500/40 transition-all">
            <div>
              <div className="text-xs font-mono font-bold text-sky-400 mb-1">STEP 04</div>
              <h3 className="font-bold text-white text-sm mb-2">Webhook Stream &amp; AI Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate PayPal webhook notifications. Inspect the cryptographic signature verification and Gemini AI summary of financial and ledger impact.
              </p>
            </div>
            <button
              onClick={() => onRunTestScenario('WEBHOOK')}
              className="mt-4 w-full py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Test Webhook Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* Technical Architecture & Requirements Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requirement 1: PayPal Technologies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0070BA]/20 text-[#0070BA] font-black flex items-center justify-center">
              P
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                PayPal Developer Capabilities Integrated
              </h3>
              <p className="text-xs text-slate-400">Sandbox Environment Active</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">1. PayPal Orders v2 API:</span>
              <span>Backend server routes (`/api/paypal/create-order` &amp; `/api/paypal/capture-order`) implementing purchase unit breakdown, itemization, dynamic discounts, tax calculations, and status transitions.</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">2. PayPal Invoicing API v2:</span>
              <span>Synthesis of invoice drafts, due dates, billing info, item breakdown, and direct recipient payment URL generation.</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">3. PayPal Resolution Center &amp; Disputes:</span>
              <span>Handling `CUSTOMER.DISPUTE.CREATED` events, Seller Protection qualification checks, and automated partial/full refund workflows.</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">4. PayPal Webhooks Telemetry:</span>
              <span>Asynchronous event processing for `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.APPROVED`, and `INVOICING.INVOICE.PAID` with cryptographic verification simulation.</span>
            </div>
          </div>
        </div>

        {/* Requirement 2: AI Technologies */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                AI Models &amp; Service Implementation
              </h3>
              <p className="text-xs text-slate-400">Google Gemini 3.8 Flash via @google/genai</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">1. Autonomous DealBot (Price Negotiator):</span>
              <span>Evaluates buyer claims, cart profit margins, and volume rules to formulate dynamic discount codes and bundle perks with structured JSON schema.</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">2. Natural Language Invoice Parser:</span>
              <span>Converts unstructured conversational billing text into strict, mathematically verified PayPal Invoicing JSON payloads.</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">3. Dispute Defense &amp; Chargeback Risk Scorer:</span>
              <span>Computes a 0-100 risk score, identifies dispute archetypes (friendly fraud, SNAD, INR), and drafts formal evidence responses under PayPal Seller Protection policy.</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block">4. Webhook Incident Telemetry Analyzer:</span>
              <span>Translates dense webhook event payloads into actionable operational insights for merchant financial ledger automation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsor Tools Compatibility & PayPal Sandbox Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Sponsor Ecosystem &amp; Developer Tooling Compatibility</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="font-bold text-white mb-1">Postman Collections</div>
            <p className="text-slate-400 leading-relaxed">
              All backend endpoints (`/api/paypal/*`, `/api/ai/*`) follow standard REST JSON conventions with idempotency headers ready for direct export into Postman workspace collections.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="font-bold text-white mb-1">APIMatic API Specs</div>
            <p className="text-slate-400 leading-relaxed">
              Payload schemas strictly conform to OpenAPI 3.0 standards, making SDK generation seamless across TypeScript, Python, and Go via APIMatic portals.
            </p>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="font-bold text-white mb-1">Zapier Webhooks</div>
            <p className="text-slate-400 leading-relaxed">
              Generated PayPal Webhook payloads can be forwarded directly to Zapier Webhook Catch Triggers to automate Slack notifications, QuickBooks, or CRM logging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
