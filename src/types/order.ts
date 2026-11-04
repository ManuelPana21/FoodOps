export type TicketStatus = 'pending' | 'progress' | 'done';

export interface KitchenTicket {
  id: number;
  table: string;
  server: string;
  age: string;
  status: TicketStatus;
  items: string[];
  note: string;
}

export type CartState = Record<number, number>;

export interface OrderSubmissionPayload {
  tableNumber: string;
  serverId: number;
  items: Array<{ productId: number; quantity: number }>;
  note?: string;
}

