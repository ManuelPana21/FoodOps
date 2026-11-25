import type {
  Coupon,
  DailySummary,
  Invoice,
  InvoiceItem,
  PaymentMethod,
} from '../types/billing';

const INVOICES_STORAGE_KEY = 'foodops.invoices';
const COUPONS_STORAGE_KEY = 'foodops.coupons';

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const defaultCoupons: Coupon[] = [
  {
    id: 1,
    code: 'FOOD10',
    type: 'percent',
    value: 10,
    description: '10% de descuento general',
    active: true,
  },
  {
    id: 2,
    code: 'PROMO5',
    type: 'fixed',
    value: 5,
    description: '$5.00 de descuento directo',
    active: true,
  },
  {
    id: 3,
    code: 'VIP20',
    type: 'percent',
    value: 20,
    description: '20% cliente frecuente',
    active: true,
  },
];

function buildInitialInvoices(): Invoice[] {
  const todayKey = getLocalDateKey();
  const compactDate = todayKey.replace(/-/g, '');
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const twoHoursAgo = new Date(now.getTime() - 120 * 60 * 1000).toISOString();

  return [
    {
      id: 1,
      invoiceNumber: `FAC-${compactDate}-0001`,
      dateKey: todayKey,
      createdAt: twoHoursAgo,
      tableNumber: 'Mesa 04',
      serverName: 'Manuel Panameño',
      customerName: 'Consumidor Final',
      customerTaxId: 'CF',
      paymentMethod: 'Efectivo',
      items: [
        {
          productId: 1,
          name: 'Hamburguesa Clásica',
          quantity: 2,
          unitPrice: 6.5,
          subtotal: 13.0,
        },
        {
          productId: 5,
          name: 'Soda',
          quantity: 2,
          unitPrice: 1.5,
          subtotal: 3.0,
        },
      ],
      subtotal: 16.0,
      couponCode: 'FOOD10',
      couponDiscount: 1.6,
      manualDiscount: 0,
      discountTotal: 1.6,
      total: 14.4,
      status: 'paid',
    },
    {
      id: 2,
      invoiceNumber: `FAC-${compactDate}-0002`,
      dateKey: todayKey,
      createdAt: oneHourAgo,
      tableNumber: 'Mesa 02',
      serverName: 'Manuel Panameño',
      customerName: 'Sofía Martínez',
      customerTaxId: '0614-180992-104-3',
      paymentMethod: 'Tarjeta',
      items: [
        {
          productId: 3,
          name: 'Pasta Cremosa',
          quantity: 1,
          unitPrice: 7.5,
          subtotal: 7.5,
        },
        {
          productId: 6,
          name: 'Brownie Tibio',
          quantity: 1,
          unitPrice: 3.5,
          subtotal: 3.5,
        },
      ],
      subtotal: 11.0,
      couponCode: null,
      couponDiscount: 0,
      manualDiscount: 0,
      discountTotal: 0,
      total: 11.0,
      status: 'paid',
    },
  ];
}

// ============================================================================
// Gestión de Cupones (localStorage)
// ============================================================================

export function loadCoupons(): Coupon[] {
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(defaultCoupons));
      return defaultCoupons;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Coupon[]) : defaultCoupons;
  } catch {
    return defaultCoupons;
  }
}

export function saveCoupons(coupons: Coupon[]): void {
  try {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
  } catch {
    // Ignore storage quota errors
  }
}

export function addCoupon(data: Omit<Coupon, 'id'>): Coupon[] {
  const current = loadCoupons();
  const normalizedCode = data.code.trim().toUpperCase();
  if (current.some((c) => c.code === normalizedCode)) {
    throw new Error(`El cupón "${normalizedCode}" ya existe.`);
  }
  const maxId = current.reduce((max, c) => Math.max(max, c.id), 0);
  const next = [
    ...current,
    {
      ...data,
      id: maxId + 1,
      code: normalizedCode,
    },
  ];
  saveCoupons(next);
  return next;
}

export function toggleCoupon(id: number): Coupon[] {
  const current = loadCoupons();
  const next = current.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
  saveCoupons(next);
  return next;
}

export function deleteCoupon(id: number): Coupon[] {
  const current = loadCoupons();
  const next = current.filter((c) => c.id !== id);
  saveCoupons(next);
  return next;
}

export function calculateCouponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon || !coupon.active || subtotal <= 0) return 0;
  const rawDiscount =
    coupon.type === 'percent' ? subtotal * (coupon.value / 100) : coupon.value;
  return Math.min(subtotal, Math.round(rawDiscount * 100) / 100);
}

export function findActiveCoupon(code: string): Coupon | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  const coupons = loadCoupons();
  return coupons.find((c) => c.code === normalized && c.active) ?? null;
}

// ============================================================================
// Gestión de Facturas y Corte Diario (localStorage)
// ============================================================================

export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) {
      const seeded = buildInitialInvoices();
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Invoice[]) : [];
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  } catch {
    // Ignore storage quota errors
  }
}

export interface EmitInvoiceParams {
  tableNumber: string;
  serverName: string;
  customerName?: string;
  customerTaxId?: string;
  paymentMethod?: PaymentMethod;
  items: InvoiceItem[];
  couponCode?: string | null;
  couponDiscount?: number;
  manualDiscount?: number;
}

export function emitInvoice(params: EmitInvoiceParams): Invoice {
  const current = loadInvoices();
  const now = new Date();
  const dateKey = getLocalDateKey(now);
  const compactDate = dateKey.replace(/-/g, '');

  const maxId = current.reduce((max, inv) => Math.max(max, inv.id), 0);
  const todaySeq = current.filter((inv) => inv.dateKey === dateKey).length + 1;
  const invoiceNumber = `FAC-${compactDate}-${String(todaySeq).padStart(4, '0')}`;

  const subtotal = Math.round(
    params.items.reduce((sum, item) => sum + item.subtotal, 0) * 100,
  ) / 100;
  const couponDiscount = Math.max(0, Math.round((params.couponDiscount ?? 0) * 100) / 100);
  const manualDiscount = Math.max(0, Math.round((params.manualDiscount ?? 0) * 100) / 100);
  const discountTotal = Math.min(
    subtotal,
    Math.round((couponDiscount + manualDiscount) * 100) / 100,
  );
  const total = Math.max(0, Math.round((subtotal - discountTotal) * 100) / 100);

  const invoice: Invoice = {
    id: maxId + 1,
    invoiceNumber,
    dateKey,
    createdAt: now.toISOString(),
    tableNumber: params.tableNumber,
    serverName: params.serverName,
    customerName: params.customerName?.trim() || 'Consumidor Final',
    customerTaxId: params.customerTaxId?.trim() || 'CF',
    paymentMethod: params.paymentMethod ?? 'Efectivo',
    items: params.items,
    subtotal,
    couponCode: params.couponCode ?? null,
    couponDiscount,
    manualDiscount,
    discountTotal,
    total,
    status: 'paid',
  };

  const next = [invoice, ...current];
  saveInvoices(next);
  return invoice;
}

export function refundInvoice(id: number, reason: string): Invoice[] {
  const current = loadInvoices();
  const next = current.map((inv) =>
    inv.id === id && inv.status !== 'refunded'
      ? {
          ...inv,
          status: 'refunded' as const,
          refundReason: reason.trim() || 'Devolución solicitada en caja',
          refundedAt: new Date().toISOString(),
        }
      : inv,
  );
  saveInvoices(next);
  return next;
}

export function computeDailySummary(invoices: Invoice[], dateKey: string): DailySummary {
  const dayInvoices = invoices.filter((inv) => inv.dateKey === dateKey);
  const paid = dayInvoices.filter((inv) => inv.status === 'paid');
  const refunded = dayInvoices.filter((inv) => inv.status === 'refunded');

  const grossSales = Math.round(
    dayInvoices.reduce((sum, inv) => sum + inv.subtotal, 0) * 100,
  ) / 100;
  const totalDiscounts = Math.round(
    dayInvoices.reduce((sum, inv) => sum + inv.discountTotal, 0) * 100,
  ) / 100;
  const totalRefunds = Math.round(
    refunded.reduce((sum, inv) => sum + inv.total, 0) * 100,
  ) / 100;
  const netSales = Math.round(
    paid.reduce((sum, inv) => sum + inv.total, 0) * 100,
  ) / 100;

  return {
    dateKey,
    invoiceCount: dayInvoices.length,
    paidCount: paid.length,
    refundCount: refunded.length,
    grossSales,
    totalDiscounts,
    totalRefunds,
    netSales,
  };
}

export function getAllDailySummaries(invoices: Invoice[]): DailySummary[] {
  const uniqueDays = Array.from(new Set(invoices.map((inv) => inv.dateKey))).sort((a, b) =>
    b.localeCompare(a),
  );
  return uniqueDays.map((day) => computeDailySummary(invoices, day));
}
