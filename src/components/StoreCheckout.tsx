import React, { useState } from 'react';
import { Product, CartItem, NegotiationTurn } from '../types';
import { SAMPLE_PRODUCTS } from '../data/mockData';
import { 
  ShoppingBag, Trash2, Plus, Minus, Sparkles, Send, Check, ShieldCheck, 
  ArrowRight, ExternalLink, RefreshCw, Cpu, Database, Code, AlertCircle
} from 'lucide-react';

interface StoreCheckoutProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onOrderCompleted: (order: any) => void;
  openNegotiatorSignal?: boolean;
}

export const StoreCheckout: React.FC<StoreCheckoutProps> = ({
  cart,
  setCart,
  onOrderCompleted,
}) => {
  // Negotiation State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [negotiating, setNegotiating] = useState(false);
  const [negotiationTurns, setNegotiationTurns] = useState<NegotiationTurn[]>([
    {
      id: 'turn-0',
      role: 'dealbot',
      text: "Hello! I am DealBot, your AI commercial pricing agent. Add items to your cart and pitch me why you deserve a discount or bundle perk (e.g. student budget, multi-item commitment, open-source project). I can authorize up to 25% off with instant PayPal Sandbox checkout!",
      timestamp: 'Just now',
    },
  ]);
  const [activeDeal, setActiveDeal] = useState<{
    discountPercent: number;
    discountAmount: number;
    dealCode: string;
    perks: string[];
  } | null>(null);

  // Checkout State
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [simulatedBuyer, setSimulatedBuyer] = useState({
    name: 'Sarah Connor',
    email: 'sb-buyer89@personal.example.com',
    balance: '$5,000.00 USD (Sandbox)',
  });

  // Cart Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = activeDeal ? (subtotal * activeDeal.discountPercent) / 100 : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = taxableSubtotal > 0 ? Math.round(taxableSubtotal * 0.0825 * 100) / 100 : 0;
  const total = Math.round((taxableSubtotal + tax) * 100) / 100;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  // AI Deal Negotiation Handler
  const handleNegotiate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || negotiating) return;

    if (cart.length === 0) {
      setNegotiationTurns((prev) => [
        ...prev,
        {
          id: `turn-${Date.now()}`,
          role: 'dealbot',
          text: 'Please add at least one product to your cart first so I can calculate your margin and package deal!',
          timestamp: 'Just now',
        },
      ]);
      return;
    }

    const userText = chatInput.trim();
    setChatInput('');
    const userTurn: NegotiationTurn = {
      id: `turn-user-${Date.now()}`,
      role: 'buyer',
      text: userText,
      timestamp: 'Just now',
    };

    setNegotiationTurns((prev) => [...prev, userTurn]);
    setNegotiating(true);

    try {
      const res = await fetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          cart,
          history: negotiationTurns.map((t) => ({ role: t.role, text: t.text })),
        }),
      });

      const data = await res.json();

      const botTurn: NegotiationTurn = {
        id: `turn-bot-${Date.now()}`,
        role: 'dealbot',
        text: data.reply,
        timestamp: 'Just now',
        discountPercent: data.discountPercent,
        discountAmount: data.discountAmount,
        finalPrice: data.finalPrice,
        dealCode: data.dealCode,
        perks: data.perks,
        readyForCheckout: data.readyForCheckout,
      };

      setNegotiationTurns((prev) => [...prev, botTurn]);

      if (data.discountPercent > 0 && data.dealCode) {
        setActiveDeal({
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
          dealCode: data.dealCode,
          perks: data.perks || [],
        });
      }
    } catch (err) {
      console.error('Failed to negotiate:', err);
    } finally {
      setNegotiating(false);
    }
  };

  // Execute PayPal Sandbox Order Creation & Capture Flow
  const initiatePayPalCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    setShowSandboxModal(true);
  };

  const confirmPayPalSandboxPayment = async () => {
    try {
      setCheckoutLoading(true);

      // Step 1: Create PayPal Sandbox Order
      const createRes = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          discount: discountAmount,
          currency: 'USD',
          negotiatedByAI: Boolean(activeDeal),
          aiDiscountCode: activeDeal?.dealCode || '',
        }),
      });

      const orderData = await createRes.json();

      // Step 2: Capture PayPal Sandbox Order
      const captureRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.id,
          payer: {
            email: simulatedBuyer.email,
            name: simulatedBuyer.name,
            countryCode: 'US',
          },
        }),
      });

      const captureData = await captureRes.json();

      const finalizedOrder = {
        orderId: orderData.id,
        captureId: captureData.id,
        items: [...cart],
        subtotal,
        discount: discountAmount,
        tax,
        total,
        deal: activeDeal,
        payer: captureData.payer,
        timestamp: new Date().toLocaleString(),
      };

      setCompletedOrder(finalizedOrder);
      setShowSandboxModal(false);
      onOrderCompleted(finalizedOrder);
      setCart([]);
      setActiveDeal(null);
    } catch (error) {
      console.error('PayPal checkout error:', error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-5 h-5 text-blue-500" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-emerald-500" />;
      case 'Database': return <Database className="w-5 h-5 text-purple-500" />;
      case 'Code': return <Code className="w-5 h-5 text-amber-500" />;
      default: return <ShoppingBag className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Introduction */}
      <div className="mb-8 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-2">
            <span>PayPal Sandbox Orders v2</span>
            <span>·</span>
            <span>Gemini Autonomous Dynamic Pricing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Intelligent AI Commerce &amp; Sandbox Checkout
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            Browse enterprise developer tools, negotiate customized dynamic discounts directly with our autonomous Gemini DealBot, and finalize verified transactions using the official PayPal Sandbox Orders v2 pipeline.
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Developer &amp; AI Product Catalog
            </h2>
            <span className="text-xs text-slate-400">4 Sandbox Demo SKUs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_PRODUCTS.map((product) => {
              const inCart = cart.find((i) => i.id === product.id);
              return (
                <div
                  key={product.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-blue-500/50 transition-all duration-200 group shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700/60 group-hover:scale-105 transition-transform">
                        {getProductIcon(product.iconName)}
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {product.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base leading-snug mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-1 mb-4">
                      {product.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Sandbox Price</div>
                      <div className="text-lg font-extrabold text-white">
                        ${product.price.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-slate-400">USD</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{inCart ? `Add More (${inCart.quantity})` : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI DealBot Drawer / Chat section */}
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    DealBot: Autonomous Pricing Negotiator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bargain with Gemini AI for dynamic cart discounts up to 25%
                  </p>
                </div>
              </div>

              {activeDeal && (
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    {activeDeal.discountPercent}% Off Authorized ({activeDeal.dealCode})
                  </span>
                </div>
              )}
            </div>

            {/* Conversation Log */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 max-h-64 overflow-y-auto space-y-3 scrollbar-thin">
              {negotiationTurns.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex flex-col ${turn.role === 'buyer' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      turn.role === 'buyer'
                        ? 'bg-blue-600 text-white font-medium rounded-br-none'
                        : 'bg-slate-800 border border-slate-700/60 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p>{turn.text}</p>
                    {turn.perks && turn.perks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] text-amber-300">
                        <span className="font-semibold">Special Perks Granted: </span>
                        {turn.perks.join(' · ')}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{turn.timestamp}</span>
                </div>
              ))}
              {negotiating && (
                <div className="flex items-center gap-2 text-xs text-amber-400 py-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>DealBot evaluating profit margins and buyer proposal...</span>
                </div>
              )}
            </div>

            {/* Quick Bargaining Prompt Chips */}
            <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 text-[11px] shrink-0">Try pitch:</span>
              <button
                type="button"
                onClick={() => setChatInput("I'm an indie hacker on a shoestring budget. Can you do 15% off and I'll tweet about the tool?")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
              >
                &ldquo;Indie hacker 15% off&rdquo;
              </button>
              <button
                type="button"
                onClick={() => setChatInput("Buying 2 licenses for my team today. What's the best bundle deal you can authorize right now?")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
              >
                &ldquo;Team bundle discount&rdquo;
              </button>
              <button
                type="button"
                onClick={() => setChatInput("I am evaluating PayPal sandbox integrations for an enterprise client. Can you do 20% off?")}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors"
              >
                &ldquo;Enterprise sandbox trial&rdquo;
              </button>
            </div>

            {/* Negotiation Input Form */}
            <form onSubmit={handleNegotiate} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pitch DealBot for a discount (e.g. 'Can I get 15% off for early adoption?')..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={negotiating || !chatInput.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>Pitch</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Cart & PayPal Sandbox Checkout (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-bold text-white">Cart &amp; Order Summary</h2>
              </div>
              <span className="text-xs text-slate-400">
                {cart.reduce((a, b) => a + b.quantity, 0)} items
              </span>
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="text-center py-10 px-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Your cart is empty</p>
                <p className="text-xs text-slate-500 mt-1">
                  Add developer items from the catalog on the left to start sandbox checkout.
                </p>
                <button
                  onClick={() => addToCart(SAMPLE_PRODUCTS[0])}
                  className="mt-4 px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors"
                >
                  + Add Gemini Agent OS ($349)
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-semibold text-xs text-white line-clamp-1">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        ${item.price.toFixed(2)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-white px-2">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">${subtotal.toFixed(2)} USD</span>
              </div>

              {activeDeal && (
                <div className="flex items-center justify-between text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Deal ({activeDeal.dealCode} - {activeDeal.discountPercent}%)</span>
                  </div>
                  <span>-${discountAmount.toFixed(2)} USD</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-400">
                <span>Estimated Sales Tax (8.25%)</span>
                <span>${tax.toFixed(2)} USD</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold text-white">
                <span>Total Amount Due</span>
                <span className="text-lg text-blue-400 font-black">${total.toFixed(2)} USD</span>
              </div>
            </div>

            {/* PayPal Sandbox Checkout Button Section */}
            <div className="mt-6 space-y-3">
              <button
                disabled={cart.length === 0 || checkoutLoading}
                onClick={initiatePayPalCheckout}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm bg-[#FFC439] hover:bg-[#F2BA36] active:bg-[#E5AF30] text-[#003087] shadow-lg shadow-yellow-500/10 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span className="italic font-extrabold tracking-tighter text-base">PayPal</span>
                <span className="font-bold text-slate-900">Sandbox Checkout</span>
                <ArrowRight className="w-4 h-4 ml-1 text-slate-900" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Orders v2 API · Sandbox Safe · Instant Capture</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive PayPal Sandbox Approval Modal */}
      {showSandboxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="text-lg font-black text-[#0070BA] italic">PayPal</div>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  SANDBOX
                </span>
              </div>
              <button
                onClick={() => setShowSandboxModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Simulated Sandbox Buyer</div>
                <div className="font-semibold text-white text-sm">{simulatedBuyer.name}</div>
                <div className="text-xs text-slate-300 font-mono">{simulatedBuyer.email}</div>
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                  <span>Balance: {simulatedBuyer.balance}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Merchant:</span>
                  <span className="text-white font-medium">PayIntellect Commerce</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Items:</span>
                  <span className="text-white">{cart.reduce((a, b) => a + b.quantity, 0)} item(s)</span>
                </div>
                {activeDeal && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>AI Negotiated Discount:</span>
                    <span>-${discountAmount.toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Tax:</span>
                  <span className="text-white">${tax.toFixed(2)} USD</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                  <span>Total to Pay:</span>
                  <span className="text-[#0070BA] font-extrabold text-base">${total.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                This executes a live Orders v2 transaction on PayPal Sandbox. Funds will be captured and an instant webhook event will be generated.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSandboxModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={confirmPayPalSandboxPayment}
                  className="flex-1 py-2.5 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Capturing...</span>
                    </>
                  ) : (
                    <span>Complete Purchase</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Completion Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center mb-5">
              <h3 className="text-lg font-bold text-white">PayPal Sandbox Payment Approved!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Order captured via PayPal Orders v2 API with status COMPLETED.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">PayPal Order ID:</span>
                <span className="text-blue-400 font-bold">{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Capture ID:</span>
                <span className="text-emerald-400 font-bold">{completedOrder.captureId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Captured:</span>
                <span className="text-white font-bold">${completedOrder.total.toFixed(2)} USD</span>
              </div>
              {completedOrder.deal && (
                <div className="flex justify-between text-amber-300">
                  <span>AI Deal Code:</span>
                  <span>{completedOrder.deal.dealCode} ({completedOrder.deal.discountPercent}% OFF)</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Payer:</span>
                <span className="text-slate-300">{completedOrder.payer?.email}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCompletedOrder(null)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done &amp; View Webhook Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
