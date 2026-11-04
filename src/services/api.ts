import type { KitchenTicket, OrderSubmissionPayload, TicketStatus } from '../types/order';
import type { Product } from '../types/product';

/**
 * FoodOps API Client & Shared State Store
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TICKETS_STORAGE_KEY = 'foodops.kdsTickets';

export const foodPhotos = {
  burger:
    'https://images.unsplash.com/photo-1600688640154-9619e002df30?auto=format&fit=crop&w=800&q=85',
  tacos:
    'https://images.unsplash.com/photo-1651440204296-a79fa9988007?auto=format&fit=crop&w=800&q=85',
  pasta:
    'https://images.unsplash.com/photo-1576866206724-c696f4c9fa06?auto=format&fit=crop&w=800&q=85',
  wings:
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=85',
  brownie:
    'https://images.unsplash.com/photo-1768342068919-1ee67c1053ba?auto=format&fit=crop&w=800&q=85',
};

export const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Hamburguesa Clásica',
    description: 'Carne, queso, lechuga y salsa de la casa',
    price: 6.5,
    category: 'Platos Fuertes',
    image: foodPhotos.burger,
  },
  {
    id: 2,
    name: 'Tacos al Pastor',
    description: 'Tres tacos, piña, cilantro y cebolla',
    price: 5,
    category: 'Platos Fuertes',
    image: foodPhotos.tacos,
  },
  {
    id: 3,
    name: 'Pasta Cremosa',
    description: 'Pasta fresca, parmesano y hierbas',
    price: 7.5,
    category: 'Platos Fuertes',
    image: foodPhotos.pasta,
  },
  {
    id: 4,
    name: 'Alitas BBQ',
    description: 'Seis alitas con salsa BBQ ahumada',
    price: 5.75,
    category: 'Entradas',
    image: foodPhotos.wings,
  },
  {
    id: 5,
    name: 'Soda',
    description: 'Coca-Cola, Sprite o Fanta · 355 ml',
    price: 1.5,
    category: 'Bebidas',
    image: null,
  },
  {
    id: 6,
    name: 'Brownie Tibio',
    description: 'Chocolate oscuro y helado de vainilla',
    price: 3.5,
    category: 'Postres',
    image: foodPhotos.brownie,
  },
];

export const defaultTickets: KitchenTicket[] = [
  {
    id: 101,
    age: 'hace 2 min',
    table: 'Mesa 08',
    server: 'Manuel',
    status: 'pending',
    items: ['2× Hamburguesa Clásica', '1× Soda'],
    note: 'Sin cebolla',
  },
  {
    id: 102,
    age: 'hace 4 min',
    table: 'Mesa 03',
    server: 'Andrea',
    status: 'pending',
    items: ['1× Tacos al Pastor', '1× Alitas BBQ', '2× Soda'],
    note: 'Salsa aparte',
  },
  {
    id: 100,
    age: 'hace 8 min',
    table: 'Mesa 12',
    server: 'Carlos',
    status: 'progress',
    items: ['1× Pasta Cremosa', '1× Hamburguesa Clásica'],
    note: null,
  },
];

export function loadStoredTickets(): KitchenTicket[] {
  try {
    const raw = sessionStorage.getItem(TICKETS_STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(defaultTickets));
      return defaultTickets;
    }
    return JSON.parse(raw) as KitchenTicket[];
  } catch {
    return defaultTickets;
  }
}

export function saveStoredTickets(tickets: KitchenTicket[]): void {
  try {
    sessionStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
  } catch {
    // Ignore storage quota errors
  }
}

export function addTicketFromOrder(params: {
  table: string;
  server: string;
  items: string[];
  note?: string | null;
}): KitchenTicket {
  const current = loadStoredTickets();
  const maxId = current.reduce((max, t) => Math.max(max, t.id), 102);
  const newTicket: KitchenTicket = {
    id: maxId + 1,
    age: 'hace 1 min',
    table: params.table,
    server: params.server,
    status: 'pending',
    items: params.items,
    note: params.note ?? null,
  };
  const next = [newTicket, ...current];
  saveStoredTickets(next);
  return newTicket;
}

export const apiClient = {
  async getProducts() {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Error al cargar catálogo de productos');
    return res.json();
  },
  async getKitchenTickets() {
    const res = await fetch(`${API_BASE_URL}/orders/queue`);
    if (!res.ok) throw new Error('Error al cargar cola de cocina');
    return res.json();
  },
  async createOrder(payload: OrderSubmissionPayload) {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || 'Error al registrar pedido');
    }
    return res.json();
  },
  async updateTicketStatus(id: number, status: TicketStatus) {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado del ticket');
    return res.json();
  },
};
