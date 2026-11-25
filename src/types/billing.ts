export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: number;
  description: string;
  active: boolean;
}

export interface InvoiceItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia';
export type InvoiceStatus = 'paid' | 'refunded';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  dateKey: string; // YYYY-MM-DD
  createdAt: string; // ISO
  tableNumber: string;
  serverName: string;
  customerName: string;
  customerTaxId: string;
  paymentMethod: PaymentMethod;
  items: InvoiceItem[];
  subtotal: number;
  couponCode: string | null;
  couponDiscount: number;
  manualDiscount: number;
  discountTotal: number;
  total: number;
  status: InvoiceStatus;
  refundReason?: string;
  refundedAt?: string;
}

export interface DailySummary {
  dateKey: string;
  invoiceCount: number;
  paidCount: number;
  refundCount: number;
  grossSales: number;
  totalDiscounts: number;
  totalRefunds: number;
  netSales: number;
}
