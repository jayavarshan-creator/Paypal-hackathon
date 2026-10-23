export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  badge?: string;
  rating: number;
  features: string[];
  iconName: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface NegotiationTurn {
  id: string;
  role: 'buyer' | 'dealbot';
  text: string;
  timestamp: string;
  discountPercent?: number;
  discountAmount?: number;
  finalPrice?: number;
  dealCode?: string;
  perks?: string[];
  readyForCheckout?: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  merchant: {
    businessName: string;
    email: string;
    address: string;
  };
  customer: {
    name: string;
    company: string;
    email: string;
    address?: string;
  };
  items: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  currency: string;
  subtotal: number;
  taxRatePercent?: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paymentTerms: string;
  notesToCustomer?: string;
  paypalPaymentLink?: string;
}

export interface DisputeAnalysis {
  riskScore: number;
  archetype: string;
  likelihoodOfMerchantWinPercent: number;
  recommendedAction: string;
  settlementOfferAmount?: number;
  resolutionCenterDraftResponse: string;
  requiredEvidenceChecklist: string[];
  paypalSellerProtectionEligible: boolean;
  mitigationStepsForFuture: string[];
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  create_time: string;
  resource_type: string;
  summary: string;
  resource: Record<string, any>;
  aiAnalysis?: string;
}

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
