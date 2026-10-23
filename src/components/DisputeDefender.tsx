import React, { useState } from 'react';
import { DisputeAnalysis } from '../types';
import { PRESET_DISPUTE_SCENARIOS } from '../data/mockData';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, 
  FileText, Copy, Check, Send, Scale, ArrowRight, CornerDownRight 
} from 'lucide-react';

export const DisputeDefender: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [reason, setReason] = useState(PRESET_DISPUTE_SCENARIOS[0].reason);
  const [amount, setAmount] = useState(PRESET_DISPUTE_SCENARIOS[0].amount);
  const [buyerClaim, setBuyerClaim] = useState(PRESET_DISPUTE_SCENARIOS[0].claim);
  const [evidenceNotes, setEvidenceNotes] = useState(PRESET_DISPUTE_SCENARIOS[0].evidence);

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DisputeAnalysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [resolvedStatus, setResolvedStatus] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setResolvedStatus(null);
    try {
      const res = await fetch('/api/ai/analyze-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeReason: reason,
          transactionAmount: amount,
          buyerClaim,
          evidenceNotes,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Failed to analyze dispute:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (index: number) => {
    setSelectedScenarioIndex(index);
    const scenario = PRESET_DISPUTE_SCENARIOS[index];
    setReason(scenario.reason);
    setAmount(scenario.amount);
    setBuyerClaim(scenario.claim);
    setEvidenceNotes(scenario.evidence);
    setAnalysis(null);
    setResolvedStatus(null);
  };

  const copyRebuttal = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.resolutionCenterDraftResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = async (actionType: 'CONTEST' | 'PARTIAL_REFUND' | 'FULL_REFUND') => {
    setLoading(true);
    try {
      await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'CUSTOMER.DISPUTE.CREATED',
          amount,
          currency: 'USD',
        }),
      });
      if (actionType === 'CONTEST') {
        setResolvedStatus('Rebuttal and documentary evidence dispatched to PayPal Resolution Center. Case under seller protection review.');
      } else if (actionType === 'PARTIAL_REFUND') {
        setResolvedStatus(`Authorized 50% settlement refund of $${(amount / 2).toFixed(2)} via PayPal Sandbox.`);
      } else {
        setResolvedStatus(`Authorized full refund of $${amount.toFixed(2)} via PayPal Sandbox. Dispute closed.`);
      }
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="mb-8 bg-gradient-to-r from-rose-950/40 via-red-900/30 to-slate-900 border border-rose-500/30 rounded-2xl p-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 mb-2">
            <span>PayPal Resolution Center &amp; Disputes API</span>
            <span>·</span>
            <span>Gemini Fraud Defense Agent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Dispute &amp; Chargeback Defense System
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Protect merchant revenue with autonomous dispute risk scoring, policy-grounded PayPal Seller Protection rebuttals, and automated settlement decisioning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dispute Claim Editor & Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preset Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Select Sandbox Dispute Scenario
            </h2>
            <div className="space-y-2">
              {PRESET_DISPUTE_SCENARIOS.map((scenario, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectPreset(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedScenarioIndex === idx
                      ? 'bg-rose-950/40 border-rose-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="font-semibold flex items-center justify-between">
                    <span>{scenario.title.split(':')[0]}</span>
                    <span className="font-mono text-rose-400">${scenario.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {scenario.claim}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Claim Parameters Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>PayPal Claim Details</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Reason Code</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-rose-500"
                >
                  <option value="UNAUTHORIZED_TRANSACTION">Unauthorized Transaction</option>
                  <option value="MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED">Item Not As Described</option>
                  <option value="MERCHANDISE_OR_SERVICE_NOT_RECEIVED">Item Not Received (INR)</option>
                  <option value="CREDIT_NOT_PROCESSED">Credit Not Processed</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Disputed Amount (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block text-xs mb-1">Buyer Claim Statement</label>
              <textarea
                rows={2}
                value={buyerClaim}
                onChange={(e) => setBuyerClaim(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 font-sans"
              />
            </div>

            <div>
              <label className="text-slate-400 block text-xs mb-1">Merchant Audit Evidence</label>
              <textarea
                rows={3}
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 font-sans"
              />
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing PayPal Dispute Policies...</span>
                </>
              ) : (
                <>
                  <Scale className="w-3.5 h-3.5" />
                  <span>Run AI Dispute Defense Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Risk Scoring & Resolution Strategy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!analysis && !loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <Scale className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Dispute Defender Ready</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                Click &ldquo;Run AI Dispute Defense Assessment&rdquo; to analyze the claim against PayPal Seller Protection guidelines and formulate an airtight defense strategy.
              </p>
              <button
                onClick={handleAnalyze}
                className="mt-5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Analyze Scenario #1 ($349 Unauthorized)
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
              <RefreshCw className="w-8 h-8 text-rose-400 animate-spin mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">Gemini is Evaluating Dispute Parameters...</h4>
              <p className="text-xs text-slate-400 mt-1">
                Comparing evidence logs against PayPal Seller Protection rules and drafting rebuttal.
              </p>
            </div>
          )}

          {analysis && !loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Header Scoring Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Risk Score */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Dispute Risk Score</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-2xl font-black ${analysis.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {analysis.riskScore}
                    </span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {analysis.riskScore < 40 ? 'Low Chargeback Risk' : 'High Financial Exposure'}
                  </div>
                </div>

                {/* Win Probability */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Est. Merchant Win Rate</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-blue-400">
                      {analysis.likelihoodOfMerchantWinPercent}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Based on PayPal policy terms
                  </div>
                </div>

                {/* Seller Protection */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Seller Protection</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {analysis.paypalSellerProtectionEligible ? (
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" /> ELIGIBLE
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> REVIEW REQ
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Orders v2 Verified Token
                  </div>
                </div>
              </div>

              {/* Dispute Archetype & Tactical Recommendation */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">Dispute Archetype: </span>
                  <span className="font-semibold text-white">{analysis.archetype}</span>
                </div>
                <div>
                  <span className="text-slate-400">Strategic Recommendation: </span>
                  <span className="font-bold text-rose-300">{analysis.recommendedAction}</span>
                </div>
              </div>

              {/* Documentary Evidence Checklist */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Required Documentary Evidence for PayPal</span>
                </h4>
                <div className="space-y-1.5">
                  {analysis.requiredEvidenceChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80"
                    >
                      <CornerDownRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Draft Resolution Center Response Narrative */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PayPal Resolution Center Draft Rebuttal</span>
                  </h4>
                  <button
                    onClick={copyRebuttal}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 font-mono"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Rebuttal'}</span>
                  </button>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {analysis.resolutionCenterDraftResponse}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-400">
                  Execute Sandbox Decision:
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleAction('CONTEST')}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Evidence to Resolution Center</span>
                  </button>

                  <button
                    onClick={() => handleAction('PARTIAL_REFUND')}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors"
                  >
                    <span>Offer 50% Sandbox Settlement (${(amount / 2).toFixed(2)})</span>
                  </button>

                  <button
                    onClick={() => handleAction('FULL_REFUND')}
                    disabled={loading}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    <span>Accept Full Refund (${amount.toFixed(2)})</span>
                  </button>
                </div>

                {resolvedStatus && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{resolvedStatus}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
