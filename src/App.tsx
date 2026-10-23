import React, { useState } from 'react';
import { CartItem } from './types';
import { SAMPLE_PRODUCTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { StoreCheckout } from './components/StoreCheckout';
import { InvoiceStudio } from './components/InvoiceStudio';
import { DisputeDefender } from './components/DisputeDefender';
import { WebhookInspector } from './components/WebhookInspector';
import { JudgeGuide } from './components/JudgeGuide';
import { CheckCircle2, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('store');
  const [cart, setCart] = useState<CartItem[]>([
    { ...SAMPLE_PRODUCTS[0], quantity: 1 },
    { ...SAMPLE_PRODUCTS[1], quantity: 1 },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const handleOrderCompleted = (order: any) => {
    setRecentOrders((prev) => [order, ...prev]);
  };

  // 1-Click Judge Demo Walkthrough Trigger
  const handleQuickJudgeDemo = () => {
    // Fill cart with 2 products
    setCart([
      { ...SAMPLE_PRODUCTS[0], quantity: 1 },
      { ...SAMPLE_PRODUCTS[3], quantity: 1 },
    ]);
    setActiveTab('store');
  };

  const handleRunTestScenario = (scenarioType: 'STORE' | 'INVOICE' | 'DISPUTE' | 'WEBHOOK') => {
    switch (scenarioType) {
      case 'STORE':
        setActiveTab('store');
        break;
      case 'INVOICE':
        setActiveTab('invoicing');
        break;
      case 'DISPUTE':
        setActiveTab('disputes');
        break;
      case 'WEBHOOK':
        setActiveTab('webhooks');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onQuickJudgeDemo={handleQuickJudgeDemo}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'store' && (
          <StoreCheckout
            cart={cart}
            setCart={setCart}
            onOrderCompleted={handleOrderCompleted}
          />
        )}

        {activeTab === 'invoicing' && <InvoiceStudio />}

        {activeTab === 'disputes' && <DisputeDefender />}

        {activeTab === 'webhooks' && <WebhookInspector />}

        {activeTab === 'judge' && (
          <JudgeGuide onRunTestScenario={handleRunTestScenario} />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-tight">PayIntellect AI</span>
            <span>·</span>
            <span>PayPal Sandbox Orders v2 &amp; Invoicing Platform</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sandbox Verified
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('judge')}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
            >
              Evaluator Documentation
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
