/**
 * FoodOps API Client & Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
  async updateTicketStatus(id: number, status: 'progress' | 'done') {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado del ticket');
    return res.json();
  },
};
