import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-agent-os',
    name: 'Gemini Autonomous Agent OS',
    category: 'AI Software',
    description: 'Enterprise runtime for multi-modal autonomous agents with low-latency tool calling and state memory.',
    price: 349.00,
    rating: 4.9,
    features: ['Unlimited tool calls', 'Server-authoritative state', 'WebSocket streaming'],
    iconName: 'Cpu',
  },
  {
    id: 'prod-paypal-mesh',
    name: 'PayPal Sandbox Webhook Mesh',
    category: 'Developer Tools',
    description: 'High-throughput webhook ingester, signature validator, and automated transaction dispute router.',
    price: 189.00,
    rating: 4.8,
    features: ['Instant signature check', 'Replay protection', 'Zero packet loss telemetry'],
    iconName: 'ShieldCheck',
  },
  {
    id: 'prod-rag-vector',
    name: 'Neural RAG Financial Vector Core',
    category: 'Intelligence',
    description: 'Pre-indexed financial vector store for instant balance sheet audit, fraud pattern matching, and KYC checks.',
    price: 279.00,
    rating: 4.9,
    features: ['1M context retrieval', 'Sub-20ms vector indexing', 'PayPal ledger sync'],
    iconName: 'Database',
  },
  {
    id: 'prod-dev-bundle',
    name: 'PayPal Developer Sandbox Starter Kit',
    category: 'Developer Kit',
    description: 'End-to-end boilerplate with Orders v2, Subscriptions, Dispute webhooks, and AI negotiation plugins.',
    price: 99.00,
    rating: 5.0,
    features: ['Orders v2 & Subscriptions', 'Express & Next.js templates', 'Mock credit card generator'],
    iconName: 'Code',
  },
];

export const PRESET_INVOICE_PROMPTS = [
  {
    title: 'AI Consulting Contract',
    prompt: 'Invoice Acme Innovations for 35 hours of AI Agent Development at $110/hour, plus $250 server setup fee. Include 8.25% California state sales tax and payment terms Net 15 via PayPal.',
  },
  {
    title: 'Enterprise Software Subscription',
    prompt: 'Bill Horizon Logistics LLC for an Annual Enterprise License of Neural Payment Pipeline at $3,600. Apply a 10% early-bird partnership discount. Terms: Due upon receipt with PayPal Sandbox instant payment.',
  },
  {
    title: 'Security & Code Audit',
    prompt: 'Invoice FinTech Labs for Comprehensive Smart Contract & Payment Gateway Security Audit. 2 senior auditors, 40 hours total at $140/hour. No tax for digital export service. Net 30 days.',
  },
];

export const PRESET_DISPUTE_SCENARIOS = [
  {
    title: 'Dispute #DP-4401: Unauthorized Transaction Claim',
    reason: 'UNAUTHORIZED_TRANSACTION',
    amount: 349.00,
    claim: 'Cardholder states they did not make this purchase and suspect their PayPal account was accessed by an unknown party.',
    evidence: 'Buyer registered using verified corporate email. IP address matches 14 previous active sessions. Digital access token downloaded immediately after PayPal checkout approval.',
  },
  {
    title: 'Dispute #DP-8910: Service Not As Described (SNAD)',
    reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    amount: 189.00,
    claim: 'Buyer claims the PayPal Webhook Mesh tool does not support older PayPal REST v1 deprecated endpoints.',
    evidence: 'Product documentation and checkout listing explicitly stated "Supports PayPal REST v2 and Orders v2". Merchant offered free v2 upgrade migration guide within 2 hours of inquiry.',
  },
  {
    title: 'Dispute #DP-1024: Digital Goods Not Received (INR)',
    reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    amount: 99.00,
    claim: 'Buyer says the download link was not sent to their inbox after checkout.',
    evidence: 'Automated SMTP logs show delivery confirmation to buyer registered PayPal email at 14:02:11 UTC. 0 bounce errors. Download token was activated from buyer IP 4 minutes later.',
  },
];
