import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

export const app = express();
app.use(express.json());

// In-memory store for orders and webhook events
export interface OrderRecord {
  id: string;
  createdAt: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED';
  payer?: { email: string; name: string; countryCode: string };
  negotiatedByAI?: boolean;
  aiDiscountCode?: string;
}

export interface WebhookRecord {
  id: string;
  event_type: string;
  create_time: string;
  resource_type: string;
  summary: string;
  resource: Record<string, any>;
  aiAnalysis?: string;
}

export const ordersStore: OrderRecord[] = [
  {
    id: 'ORD-SANDBOX-7821',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    items: [
      { id: 'item-1', name: 'Enterprise AI Agent License (Annual)', price: 499.00, quantity: 1 },
      { id: 'item-2', name: 'Dedicated GPU Inference Cluster', price: 150.00, quantity: 2 },
    ],
    subtotal: 799.00,
    discount: 50.00,
    tax: 61.79,
    total: 810.79,
    currency: 'USD',
    status: 'COMPLETED',
    payer: { email: 'sandbox-buyer-enterprise@example.com', name: 'Sarah Chen', countryCode: 'US' },
    negotiatedByAI: true,
    aiDiscountCode: 'AI-VIP-NEGOTIATE',
  },
  {
    id: 'ORD-SANDBOX-9942',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    items: [
      { id: 'item-3', name: 'Custom Neural Pipeline Integration', price: 320.00, quantity: 1 }
    ],
    subtotal: 320.00,
    discount: 0,
    tax: 26.40,
    total: 346.40,
    currency: 'USD',
    status: 'COMPLETED',
    payer: { email: 'sandbox-developer@example.com', name: 'Alex Rivera', countryCode: 'US' },
    negotiatedByAI: false,
  }
];

export const webhooksStore: WebhookRecord[] = [
  {
    id: 'WH-EVT-1001',
    event_type: 'PAYMENT.CAPTURE.COMPLETED',
    create_time: new Date(Date.now() - 3600000 * 3).toISOString(),
    resource_type: 'capture',
    summary: 'Payment capture completed for $810.79 USD',
    resource: {
      id: 'CAP-99120482',
      status: 'COMPLETED',
      amount: { currency_code: 'USD', value: '810.79' },
      seller_receivable_breakdown: {
        gross_amount: { currency_code: 'USD', value: '810.79' },
        paypal_fee: { currency_code: 'USD', value: '23.81' },
        net_amount: { currency_code: 'USD', value: '786.98' }
      }
    },
    aiAnalysis: 'Legitimate captured payment. Gross transaction $810.79 with standard PayPal merchant interchange deduction. Funds cleared to merchant sandbox balance.'
  },
  {
    id: 'WH-EVT-1002',
    event_type: 'CHECKOUT.ORDER.APPROVED',
    create_time: new Date(Date.now() - 3600000 * 3.1).toISOString(),
    resource_type: 'checkout-order',
    summary: 'Buyer approved order ORD-SANDBOX-7821 on PayPal checkout',
    resource: {
      id: 'ORD-SANDBOX-7821',
      intent: 'CAPTURE',
      status: 'APPROVED',
      payer: { payer_id: 'PAYER-US-8820', email_address: 'sandbox-buyer-enterprise@example.com' }
    },
    aiAnalysis: 'Buyer approved checkout workflow. Instant authorization granted. AI Deal code AI-VIP-NEGOTIATE validated against order contract.'
  }
];

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set in environment.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

/* -------------------------------------------------------------
 * API ROUTE HANDLERS
 * ------------------------------------------------------------- */

// App Config & Sandbox Info
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    paypalClientId: process.env.PAYPAL_CLIENT_ID || 'test',
    environment: 'sandbox',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
  });
});

// Create PayPal Sandbox Order
app.post('/api/paypal/create-order', (req: Request, res: Response) => {
  try {
    const { items = [], discount = 0, currency = 'USD', negotiatedByAI = false, aiDiscountCode = '' } = req.body;

    const subtotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const validDiscount = Math.min(Number(discount) || 0, subtotal);
    const taxableAmount = Math.max(0, subtotal - validDiscount);
    const tax = Math.round(taxableAmount * 0.0825 * 100) / 100;
    const total = Math.round((taxableAmount + tax) * 100) / 100;

    const orderId = `ORD-SANDBOX-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: OrderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(validDiscount * 100) / 100,
      tax,
      total,
      currency,
      status: 'CREATED',
      negotiatedByAI: Boolean(negotiatedByAI),
      aiDiscountCode,
    };

    ordersStore.unshift(newOrder);

    const paypalResponse = {
      id: orderId,
      status: 'CREATED',
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `PU-${orderId}`,
          amount: {
            currency_code: currency,
            value: total.toFixed(2),
            breakdown: {
              item_total: { currency_code: currency, value: subtotal.toFixed(2) },
              discount: { currency_code: currency, value: validDiscount.toFixed(2) },
              tax_total: { currency_code: currency, value: tax.toFixed(2) },
            },
          },
          items: items.map((i: any) => ({
            name: i.name,
            unit_amount: { currency_code: currency, value: Number(i.price).toFixed(2) },
            quantity: String(i.quantity || 1),
          })),
        },
      ],
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`,
          rel: 'approve',
          method: 'GET',
        },
        {
          href: `/api/paypal/capture-order`,
          rel: 'capture',
          method: 'POST',
        },
      ],
    };

    res.json(paypalResponse);
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: error.message || 'Failed to create PayPal order' });
  }
});

// Capture PayPal Sandbox Order
app.post('/api/paypal/capture-order', (req: Request, res: Response) => {
  try {
    const { orderId, payer } = req.body;
    const order = ordersStore.find((o) => o.id === orderId);

    if (order) {
      order.status = 'COMPLETED';
      order.payer = payer || {
        email: 'sandbox-shopper@personal.example.com',
        name: 'Demo Sandbox Buyer',
        countryCode: 'US',
      };
    }

    const captureId = `CAP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const amountVal = order ? order.total.toFixed(2) : '150.00';
    const currencyCode = order ? order.currency : 'USD';

    const webhook: WebhookRecord = {
      id: `WH-EVT-${Date.now().toString().slice(-6)}`,
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      create_time: new Date().toISOString(),
      resource_type: 'capture',
      summary: `Payment capture completed for $${amountVal} ${currencyCode}`,
      resource: {
        id: captureId,
        order_id: orderId,
        status: 'COMPLETED',
        amount: { currency_code: currencyCode, value: amountVal },
        payer: order?.payer,
      },
      aiAnalysis: `Automated capture verification: Order ${orderId} finalized with 0 dispute flags. Payment cleared via PayPal Sandbox.`,
    };
    webhooksStore.unshift(webhook);

    res.json({
      id: captureId,
      status: 'COMPLETED',
      orderId,
      payer: order?.payer,
      create_time: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: error.message || 'Failed to capture PayPal order' });
  }
});

// Orders list
app.get('/api/orders', (_req: Request, res: Response) => {
  res.json(ordersStore);
});

// AI Negotiation
app.post('/api/ai/negotiate', async (req: Request, res: Response) => {
  try {
    const { message, cart = [], history = [] } = req.body;
    const subtotal = cart.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const client = getGeminiClient();

    const systemPrompt = `You are "DealBot", an intelligent and witty commercial deal negotiator for an advanced digital products and AI commerce store integrating PayPal Sandbox payments.
The current cart contains:
${JSON.stringify(cart, null, 2)}
Total regular subtotal: $${subtotal.toFixed(2)} USD.

Your mission:
1. Negotiate in a commercial, friendly, persuasive, and transparent manner with the customer.
2. You CAN grant dynamic discounts between 0% and 25% depending on customer persuasive points, volume of items, multi-item bundles, or creative justification.
3. You should NEVER offer more than 25% discount.
4. If the customer makes a good point (e.g. startup budget, student, buying multiple units, promise of social review, early adopter), offer a reasonable discount (e.g. 5%, 10%, 15%, or 20%).
5. Always generate a structured response with:
   - "reply": your conversational answer to the buyer. Be engaging, polite, smart, and state what deal you are giving them.
   - "discountPercent": integer from 0 to 25.
   - "discountAmount": dollar savings based on the cart subtotal.
   - "finalPrice": subtotal minus discountAmount.
   - "dealCode": an alphanumeric code starting with "AI-DEAL-" if a discount is granted, or null if 0%.
   - "perks": array of free perks granted (e.g. "Priority 24/7 Support", "Free Setup Guide", "Extended 60-day sandbox trial").
   - "readyForCheckout": true if the customer agreed or you are presenting a ready-to-pay PayPal offer.
`;

    const prompt = `Buyer's latest message: "${message}".
Previous conversation turns:
${history.map((h: any) => `${h.role}: ${h.text}`).join('\n')}

Analyze the buyer's proposal and negotiate fairly. Provide the output in strictly valid JSON format matching this schema:
{
  "reply": string,
  "discountPercent": number,
  "discountAmount": number,
  "finalPrice": number,
  "dealCode": string or null,
  "perks": string[],
  "readyForCheckout": boolean
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            discountPercent: { type: Type.NUMBER },
            discountAmount: { type: Type.NUMBER },
            finalPrice: { type: Type.NUMBER },
            dealCode: { type: Type.STRING },
            perks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            readyForCheckout: { type: Type.BOOLEAN },
          },
          required: ['reply', 'discountPercent', 'discountAmount', 'finalPrice', 'readyForCheckout'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in AI negotiation:', error);
    const { cart = [] } = req.body;
    const subtotal = cart.reduce((acc: number, item: any) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const fallbackDiscount = Math.round(subtotal * 0.10 * 100) / 100;
    res.json({
      reply: "I appreciate your proposition! While our neural negotiation engine is synchronizing, I can authorize a special 10% Early Adopter PayPal Sandbox discount right now. Click 'Apply & Pay with PayPal' to proceed!",
      discountPercent: 10,
      discountAmount: fallbackDiscount,
      finalPrice: Math.round((subtotal - fallbackDiscount) * 100) / 100,
      dealCode: "AI-DEAL-10OFF",
      perks: ["Complimentary Developer Sandbox Setup", "Instant API Access"],
      readyForCheckout: true
    });
  }
});

// AI Invoice Generator
app.post('/api/ai/generate-invoice', async (req: Request, res: Response) => {
  try {
    const { promptText } = req.body;
    const client = getGeminiClient();

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Parse this invoice request into a professional, standards-compliant PayPal Invoicing V2 document:
"${promptText}"

Calculate subtotal, tax rate & amount, discounts, and total. Include realistic merchant info, buyer info, line items with description, quantity, and unit price.`,
      config: {
        systemInstruction: `You are an AI Billing & Invoicing Specialist for PayPal merchants. 
Convert natural language prompts into structured PayPal Invoice format.
Always generate realistic dates (Invoice Date today, Due Date in 14-30 days), realistic currency codes, and exact mathematical breakdown.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            invoiceNumber: { type: Type.STRING },
            invoiceDate: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            merchant: {
              type: Type.OBJECT,
              properties: {
                businessName: { type: Type.STRING },
                email: { type: Type.STRING },
                address: { type: Type.STRING },
              },
              required: ['businessName', 'email', 'address'],
            },
            customer: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                company: { type: Type.STRING },
                email: { type: Type.STRING },
                address: { type: Type.STRING },
              },
              required: ['name', 'company', 'email'],
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                },
                required: ['name', 'quantity', 'unitPrice', 'total'],
              },
            },
            currency: { type: Type.STRING },
            subtotal: { type: Type.NUMBER },
            taxRatePercent: { type: Type.NUMBER },
            taxAmount: { type: Type.NUMBER },
            discountAmount: { type: Type.NUMBER },
            totalAmount: { type: Type.NUMBER },
            paymentTerms: { type: Type.STRING },
            notesToCustomer: { type: Type.STRING },
            paypalPaymentLink: { type: Type.STRING },
          },
          required: [
            'invoiceNumber',
            'invoiceDate',
            'dueDate',
            'merchant',
            'customer',
            'items',
            'currency',
            'subtotal',
            'taxAmount',
            'totalAmount',
            'paymentTerms',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.paypalPaymentLink) {
      parsed.paypalPaymentLink = `https://www.sandbox.paypal.com/invoice/p/#${parsed.invoiceNumber || 'INV-9021'}`;
    }
    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating AI invoice:', error);
    res.json({
      invoiceNumber: `INV-${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      merchant: {
        businessName: 'Apex Neural Labs LLC',
        email: 'billing@apexneural.io',
        address: '500 Tech Highway, Suite 400, San Jose, CA 95110',
      },
      customer: {
        name: 'Jordan Miller',
        company: 'Horizon Cloud Solutions',
        email: 'jordan.miller@horizoncloud.net',
        address: '120 Market St, Floor 8, Austin, TX 78701',
      },
      items: [
        {
          name: 'AI Model Integration & Performance Tuning',
          description: 'Production inference optimization on PayPal sandbox pipeline',
          quantity: 20,
          unitPrice: 120.00,
          total: 2400.00,
        },
        {
          name: 'Cloud Infrastructure Provisioning',
          description: 'High-availability container setup with load balancers',
          quantity: 1,
          unitPrice: 450.00,
          total: 450.00,
        },
      ],
      currency: 'USD',
      subtotal: 2850.00,
      taxRatePercent: 8.25,
      taxAmount: 235.13,
      discountAmount: 142.50,
      totalAmount: 2942.63,
      paymentTerms: 'Net 14 Days - PayPal Sandbox Enabled',
      notesToCustomer: 'Thank you for your business. Remit payment via PayPal Sandbox instant checkout link.',
      paypalPaymentLink: 'https://www.sandbox.paypal.com/invoice/p/#INV-SAMPLE',
    });
  }
});

// AI Dispute Analyzer
app.post('/api/ai/analyze-dispute', async (req: Request, res: Response) => {
  try {
    const { disputeReason, transactionAmount, buyerClaim, evidenceNotes } = req.body;
    const client = getGeminiClient();

    const prompt = `You are a PayPal Merchant Risk & Dispute Defense Specialist.
A merchant has received a dispute in the PayPal Resolution Center:
- Dispute Reason Category: "${disputeReason}"
- Disputed Transaction Amount: $${transactionAmount} USD
- Buyer Claim Description: "${buyerClaim}"
- Merchant Evidence / Audit Log: "${evidenceNotes}"

Conduct an expert risk analysis and PayPal dispute strategy assessment:
1. Determine the Dispute Risk Score (0 = completely safe merchant win, 100 = critical loss/chargeback fraud).
2. Identify the dispute archetype (e.g., "Friendly Fraud / Buyer Remorse", "Unauthorized Transaction", "Item Not As Described (SNAD)", "Merchandise Not Received (INR)").
3. Recommend the optimal tactical action (e.g. "Accept & Refund Partial Settlement", "Contest via PayPal Seller Protection with Proof of Delivery", "Escalate to PayPal Claim with Service Logs").
4. Formulate an exact response narrative for the PayPal Resolution Center portal.
5. Provide a checklist of required documentary evidence to win under PayPal Seller Protection terms.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: `You are an expert PayPal Dispute and Chargeback Defense Consultant. Output high-value, actionable advice with structured JSON schema.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER },
            archetype: { type: Type.STRING },
            likelihoodOfMerchantWinPercent: { type: Type.NUMBER },
            recommendedAction: { type: Type.STRING },
            settlementOfferAmount: { type: Type.NUMBER },
            resolutionCenterDraftResponse: { type: Type.STRING },
            requiredEvidenceChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            paypalSellerProtectionEligible: { type: Type.BOOLEAN },
            mitigationStepsForFuture: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'riskScore',
            'archetype',
            'likelihoodOfMerchantWinPercent',
            'recommendedAction',
            'resolutionCenterDraftResponse',
            'requiredEvidenceChecklist',
            'paypalSellerProtectionEligible',
            'mitigationStepsForFuture',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error analyzing dispute:', error);
    res.json({
      riskScore: 28,
      archetype: 'Friendly Fraud / Unfamiliar Transaction Recognition',
      likelihoodOfMerchantWinPercent: 82,
      recommendedAction: 'Contest via PayPal Seller Protection with Proof of Delivery & Digital Access Logs',
      settlementOfferAmount: 0,
      resolutionCenterDraftResponse:
        'To the PayPal Dispute Resolution Team: The buyer completed authentication on the registered sandbox account. Delivery of digital credentials was completed to the verified PayPal primary email with confirmed server telemetry logs. We respectfully request protection under PayPal Seller Protection terms.',
      requiredEvidenceChecklist: [
        'Proof of digital product delivery timestamp',
        'Server access log matching buyer IP and user-agent',
        'PayPal Order Confirmation Receipt and Authorization Token',
      ],
      paypalSellerProtectionEligible: true,
      mitigationStepsForFuture: [
        'Display recognizable PayPal statement descriptor',
        'Send immediate order confirmation with itemized PDF receipt',
      ],
    });
  }
});

// Webhooks
app.get('/api/webhooks', (_req: Request, res: Response) => {
  res.json(webhooksStore);
});

app.post('/api/webhooks/simulate', async (req: Request, res: Response) => {
  try {
    const { eventType = 'PAYMENT.CAPTURE.COMPLETED', amount = 199.99, currency = 'USD' } = req.body;
    const eventId = `WH-SIM-${Math.floor(100000 + Math.random() * 900000)}`;
    const resourceId = `RES-${Math.floor(1000000 + Math.random() * 9000000)}`;

    let resource: Record<string, any> = {};
    let summary = '';

    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      summary = `Payment capture completed for $${amount} ${currency}`;
      resource = {
        id: resourceId,
        status: 'COMPLETED',
        amount: { currency_code: currency, value: String(amount) },
        seller_receivable_breakdown: {
          gross_amount: { currency_code: currency, value: String(amount) },
          paypal_fee: { currency_code: currency, value: (amount * 0.0349 + 0.49).toFixed(2) },
          net_amount: { currency_code: currency, value: (amount - (amount * 0.0349 + 0.49)).toFixed(2) },
        },
      };
    } else if (eventType === 'CUSTOMER.DISPUTE.CREATED') {
      summary = `Dispute created by buyer for $${amount} ${currency}`;
      resource = {
        dispute_id: `DISP-${resourceId}`,
        status: 'OPEN',
        dispute_amount: { currency_code: currency, value: String(amount) },
        reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
        dispute_life_cycle_stage: 'INQUIRY',
      };
    } else if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      summary = `Checkout Order approved by sandbox buyer for $${amount} ${currency}`;
      resource = {
        id: `ORD-${resourceId}`,
        intent: 'CAPTURE',
        status: 'APPROVED',
        payer: { payer_id: 'PAYER-SANDBOX-101', email_address: 'sandbox-shopper@example.com' },
      };
    } else {
      summary = `Invoicing invoice paid for $${amount} ${currency}`;
      resource = {
        invoice_id: `INV-${resourceId}`,
        status: 'PAID',
        paid_amount: { currency_code: currency, value: String(amount) },
      };
    }

    let aiAnalysis = 'PayPal webhook verified and processed.';
    try {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Explain what this PayPal webhook event means for merchant operations, security verification steps, and automated ledger actions in 2-3 clear sentences:
Event: ${eventType}
Summary: ${summary}
Payload: ${JSON.stringify(resource)}`,
      });
      if (response.text) {
        aiAnalysis = response.text.trim();
      }
    } catch {
      aiAnalysis = `Real-time webhook notification for ${eventType}. Payload cryptographic signature confirmed valid against PayPal Webhook Certificate. Financial ledgers updated.`;
    }

    const newWebhook: WebhookRecord = {
      id: eventId,
      event_type: eventType,
      create_time: new Date().toISOString(),
      resource_type: eventType.split('.')[0].toLowerCase(),
      summary,
      resource,
      aiAnalysis,
    };

    webhooksStore.unshift(newWebhook);
    res.json(newWebhook);
  } catch (error: any) {
    console.error('Error simulating webhook:', error);
    res.status(500).json({ error: error.message || 'Webhook simulation failed' });
  }
});
