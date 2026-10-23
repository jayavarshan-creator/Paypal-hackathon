import React from 'react';
import { ShoppingBag, FileText, ShieldAlert, Activity, Award, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onQuickJudgeDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onQuickJudgeDemo,
}) => {
  const tabs = [
    { id: 'store', label: 'AI Store & Dynamic Checkout', icon: ShoppingBag, badge: cartCount > 0 ? cartCount : undefined },
    { id: 'invoicing', label: 'Smart Invoicing Studio', icon: FileText },
    { id: 'disputes', label: 'Dispute & Fraud Defender', icon: ShieldAlert },
    { id: 'webhooks', label: 'Webhook Telemetry', icon: Activity },
    { id: 'judge', label: 'Judge & Dev Hub', icon: Award },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center font-black text-white text-xl shadow-inner shadow-blue-400/30">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">PayIntellect</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  AI + PayPal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> Sandbox v2
                </span>
                <span>·</span>
                <span>Gemini 3.8 Intelligence</span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="w-4 h-4 text-[10px] bg-sky-400 text-slate-900 font-bold rounded-full flex items-center justify-center ml-0.5">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Judge Action & Sandbox Indicator */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onQuickJudgeDemo}
              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-lg hover:from-amber-400 hover:to-yellow-500 shadow-sm transition-all duration-150 flex items-center gap-1.5 font-semibold"
              title="Click to run a 1-click test walkthrough with pre-filled AI deal negotiation and checkout"
            >
              <Award className="w-3.5 h-3.5" />
              <span>1-Click Judge Demo</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs whitespace-nowrap rounded-lg ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="w-3.5 h-3.5 text-[9px] bg-sky-400 text-slate-900 font-bold rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
