import React, { useState } from 'react';
import { InvoiceData } from '../types';
import { PRESET_INVOICE_PROMPTS } from '../data/mockData';
import { 
  FileText, Sparkles, Send, Download, Printer, CheckCircle, 
  ExternalLink, Copy, Check, Code, RefreshCw, ArrowRight 
} from 'lucide-react';

export const InvoiceStudio: React.FC = () => {
  const [promptText, setPromptText] = useState(
    'Invoice Quantum Leap Labs for 30 hours of AI payment orchestration at $125/hour, plus $450 server setup fee. Add 8.25% California sales tax and give a 5% early payment discount. Terms: Net 14 days payable via PayPal Sandbox.'
  );
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [showJsonView, setShowJsonView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invoicePaid, setInvoicePaid] = useState(false);

  const handleGenerateInvoice = async (customPrompt?: string) => {
    const textToUse = customPrompt || promptText;
    if (!textToUse.trim() || loading) return;

    setLoading(true);
    setInvoicePaid(false);
    try {
      const res = await fetch('/api/ai/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: textToUse }),
      });
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      console.error('Invoice generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyJson = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(JSON.stringify(invoice, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateInvoicePayment = async () => {
    if (!invoice) return;
    setLoading(true);
    try {
      await fetch('/api/webhooks/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'INVOICING.INVOICE.PAID',
          amount: invoice.totalAmount,
          currency: invoice.currency,
        }),
      });
      setInvoicePaid(true);
    } catch (err) {
      console.error('Failed to simulate invoice payment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner */}
      <div className="mb-8 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-2">
            <span>PayPal Invoicing API v2</span>
            <span>·</span>
            <span>Gemini Structured Parser</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Smart Invoicing Engine
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Turn unstructured project descriptions, hours, rates, and tax terms into fully compliant PayPal Invoicing V2 documents in seconds with automatic line-item math and sandbox payment links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Natural Language Prompt Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Natural Language Prompt</span>
            </h2>

            <textarea
              rows={5}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe your invoice (client name, hourly rate, hours, expenses, taxes, terms)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans leading-relaxed"
            />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Processed via Gemini 3.8 Flash
              </span>
              <button
                type="button"
                onClick={() => handleGenerateInvoice()}
                disabled={loading || !promptText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Structuring Invoice...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate PayPal Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets for Judges */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              One-Click Presets for Evaluators
            </h3>
            <div className="space-y-2">
              {PRESET_INVOICE_PROMPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(preset.prompt);
                    handleGenerateInvoice(preset.prompt);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all text-xs group"
                >
                  <div className="font-semibold text-white group-hover:text-indigo-300">
                    {preset.title}
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {preset.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Generated Invoice Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!invoice && !loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">No Invoice Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                Click &ldquo;Generate PayPal Invoice&rdquo; or pick one of the presets on the left to synthesize a live document with PayPal line-item breakdown.
              </p>
              <button
                onClick={() => handleGenerateInvoice()}
                className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Generate Sample Invoice
              </button>
            </div>
          )}

          {loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
              <h4 className="text-sm font-bold text-white">Gemini is Generating Structured Invoice...</h4>
              <p className="text-xs text-slate-400 mt-1">
                Calculating tax rates, discounts, item lines, and PayPal Invoicing V2 schema.
              </p>
            </div>
          )}

          {invoice && !loading && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Document Header Controls */}
              <div className="bg-slate-800/80 px-6 py-3 border-b border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {invoice.invoiceNumber}
                  </span>
                  <span>·</span>
                  <span className="text-xs text-slate-400 font-sans">PayPal Sandbox Invoicing</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowJsonView(!showJsonView)}
                    className="px-2.5 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex items-center gap-1 font-mono"
                  >
                    <Code className="w-3 h-3" />
                    <span>{showJsonView ? 'Document' : 'JSON Schema'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    title="Print Invoice"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {showJsonView ? (
                <div className="p-6 bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px] relative">
                  <button
                    onClick={copyJson}
                    className="absolute top-4 right-4 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <pre>{JSON.stringify(invoice, null, 2)}</pre>
                </div>
              ) : (
                <div className="p-6 sm:p-8 space-y-6 text-slate-200 bg-slate-900">
                  {/* Brand & Invoice Meta */}
                  <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-800 pb-6">
                    <div>
                      <div className="text-xl font-extrabold text-white">
                        {invoice.merchant.businessName}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{invoice.merchant.email}</div>
                      <div className="text-xs text-slate-400">{invoice.merchant.address}</div>
                    </div>

                    <div className="sm:text-right">
                      <div className="text-2xl font-black text-[#0070BA] italic tracking-tighter">
                        PayPal <span className="text-white font-normal text-lg not-italic font-sans">INVOICE</span>
                      </div>
                      <div className="text-xs font-mono text-slate-300 mt-1 font-bold">
                        #{invoice.invoiceNumber}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Invoice Date: <span className="text-white">{invoice.invoiceDate}</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Due Date: <span className="text-white">{invoice.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Billed To */}
                  <div className="border-b border-slate-800 pb-6">
                    <div className="text-xs font-bold uppercase text-slate-500 mb-1">Billed To</div>
                    <div className="font-bold text-white text-sm">{invoice.customer.name}</div>
                    <div className="text-xs text-slate-300">{invoice.customer.company}</div>
                    <div className="text-xs text-slate-400">{invoice.customer.email}</div>
                    {invoice.customer.address && (
                      <div className="text-xs text-slate-400">{invoice.customer.address}</div>
                    )}
                  </div>

                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-left">
                          <th className="py-2.5 font-semibold">Description</th>
                          <th className="py-2.5 font-semibold text-right">Qty</th>
                          <th className="py-2.5 font-semibold text-right">Unit Price</th>
                          <th className="py-2.5 font-semibold text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {invoice.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-3 pr-4">
                              <div className="font-semibold text-white">{item.name}</div>
                              <div className="text-[11px] text-slate-400">{item.description}</div>
                            </td>
                            <td className="py-3 text-right text-slate-300">{item.quantity}</td>
                            <td className="py-3 text-right text-slate-300">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="py-3 text-right font-semibold text-white">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Totals Breakdown */}
                  <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row justify-between gap-6">
                    <div className="text-xs space-y-2 max-w-sm">
                      <div className="text-slate-400">
                        <span className="font-semibold text-slate-300">Payment Terms: </span>
                        {invoice.paymentTerms}
                      </div>
                      {invoice.notesToCustomer && (
                        <div className="text-slate-400">
                          <span className="font-semibold text-slate-300">Memo: </span>
                          {invoice.notesToCustomer}
                        </div>
                      )}
                    </div>

                    <div className="w-full sm:w-64 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Subtotal</span>
                        <span className="text-white">${invoice.subtotal.toFixed(2)}</span>
                      </div>
                      {Boolean(invoice.discountAmount) && (
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Discount</span>
                          <span>-${(invoice.discountAmount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-400">
                        <span>Estimated Tax</span>
                        <span className="text-white">${invoice.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                        <span>Total Due</span>
                        <span className="text-indigo-400 font-black text-base">
                          ${invoice.totalAmount.toFixed(2)} {invoice.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Action for Sandbox */}
                  <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2">
                      {invoicePaid ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                          <CheckCircle className="w-4 h-4" />
                          <span>PAID VIA PAYPAL SANDBOX</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">
                          Recipients can remit instantly via PayPal Sandbox
                        </div>
                      )}
                    </div>

                    {!invoicePaid ? (
                      <button
                        onClick={simulateInvoicePayment}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span className="italic font-extrabold text-sm">PayPal</span>
                        <span>Pay Invoice (${invoice.totalAmount.toFixed(2)})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono">
                        Webhook broadcast: INVOICING.INVOICE.PAID
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
