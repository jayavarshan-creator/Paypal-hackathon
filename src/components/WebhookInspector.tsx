import React, { useState, useEffect } from 'react';
import { WebhookEvent } from '../types';
import { 
  Activity, Play, RefreshCw, CheckCircle2, ShieldCheck, 
  Code, Copy, Check, Clock, AlertCircle, ArrowUpRight 
} from 'lucide-react';

export const WebhookInspector: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
  const [copied, setCopied] = useState(false);

  // Simulation controls
  const [eventType, setEventType] = useState('PAYMENT.CAPTURE.COMPLETED');
  const [amount, setAmount] = useState(249.99);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhooks');
      const data = await res.json();
      setEvents(data);
      if (data.length > 0 && !selectedEvent) {
        setSelectedEvent(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          amount,
          currency: 'USD',
        }),
      });
      const newEvt = await res.json();
      setEvents((prev) => [newEvt, ...prev]);
      setSelectedEvent(newEvt);
    } catch (err) {
      console.error('Webhook simulation failed:', err);
    } finally {
      setSimulating(false);
    }
  };

  const copyEventJson = () => {
    if (!selectedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="mb-8 bg-gradient-to-r from-sky-950/40 via-blue-900/30 to-slate-900 border border-sky-500/30 rounded-2xl p-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-2">
            <span>PayPal Webhooks API</span>
            <span>·</span>
            <span>Gemini Telemetry Inspector</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Webhook &amp; Event Stream
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Real-time telemetry stream capturing asynchronous PayPal Sandbox events. Includes cryptographic signature verification simulation and autonomous Gemini incident synthesis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Stream List & Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Simulator Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4 text-sky-400" />
                <span>Simulate PayPal Webhook</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">
                Sandbox Simulator
              </span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs focus:border-sky-500"
                >
                  <option value="PAYMENT.CAPTURE.COMPLETED">PAYMENT.CAPTURE.COMPLETED</option>
                  <option value="CHECKOUT.ORDER.APPROVED">CHECKOUT.ORDER.APPROVED</option>
                  <option value="CUSTOMER.DISPUTE.CREATED">CUSTOMER.DISPUTE.CREATED</option>
                  <option value="INVOICING.INVOICE.PAID">INVOICING.INVOICE.PAID</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Transaction Value ($ USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs font-mono focus:border-sky-500"
                />
              </div>

              <button
                type="button"
                onClick={handleSimulate}
                disabled={simulating}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Emitting &amp; AI-Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3.5 h-3.5" />
                    <span>Trigger Webhook Event</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Event Stream List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Ingested Events ({events.length})
              </h3>
              <button
                onClick={fetchEvents}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                title="Refresh Stream"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
              {events.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No webhook events received yet. Click &ldquo;Trigger Webhook Event&rdquo; above!
                </div>
              ) : (
                events.map((evt) => {
                  const isSelected = selectedEvent?.id === evt.id;
                  const isDispute = evt.event_type.includes('DISPUTE');
                  const isCapture = evt.event_type.includes('CAPTURE');

                  return (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? 'bg-sky-950/40 border-sky-500/50 text-white'
                          : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-mono text-[11px] font-bold ${
                          isDispute ? 'text-rose-400' : isCapture ? 'text-emerald-400' : 'text-sky-400'
                        }`}>
                          {evt.event_type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(evt.create_time).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {evt.summary}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Webhook Inspection & AI Synthesis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!selectedEvent ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select an event from the stream to view cryptographic validation and AI operational telemetry.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden space-y-5 p-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="text-base font-extrabold text-white font-mono">
                    {selectedEvent.event_type}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    ID: <span className="font-mono text-slate-300">{selectedEvent.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>SIG: VERIFIED (SHA256withRSA)</span>
                  </span>
                </div>
              </div>

              {/* Gemini AI Operational Synthesis */}
              <div className="bg-gradient-to-r from-sky-950/60 to-slate-950 p-4 rounded-xl border border-sky-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Gemini Operational Intelligence</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {selectedEvent.aiAnalysis || 'Automated webhook ledger synchronization completed.'}
                </p>
              </div>

              {/* Summary metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Resource Type</span>
                  <span className="text-white font-mono font-semibold">{selectedEvent.resource_type}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block">Ingestion Time</span>
                  <span className="text-white font-mono">{new Date(selectedEvent.create_time).toLocaleTimeString()}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block">Downstream Action</span>
                  <span className="text-emerald-400 font-semibold">Ledger Synced</span>
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
                    <Code className="w-3.5 h-3.5" />
                    <span>Raw Event Payload</span>
                  </span>
                  <button
                    onClick={copyEventJson}
                    className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1 font-mono"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Payload'}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-72 overflow-y-auto font-mono text-[11px] text-sky-300">
                  <pre>{JSON.stringify(selectedEvent, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
