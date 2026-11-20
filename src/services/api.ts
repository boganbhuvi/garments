import { Order, CustomerRecord } from '../types/order';

const API_BASE = '/api';

export interface DatabaseStatus {
  connected: boolean;
  host: string;
  name: string;
  uriMasked?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  database: DatabaseStatus;
}

export const api = {
  // Check backend server and MongoDB connection
  async checkHealth(): Promise<HealthResponse | null> {
    try {
      const res = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Fetch all orders
  async getOrders(query?: string, status?: string): Promise<Order[] | null> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (status && status !== 'ALL') params.append('status', status);

      const url = `${API_BASE}/orders${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Fetch single order
  async getOrder(id: string): Promise<Order | null> {
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Save / Upsert order to MongoDB
  async saveOrder(order: Order): Promise<Order | null> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Delete order
  async deleteOrder(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(4000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Search customers in MongoDB
  async searchCustomers(query: string): Promise<Order[] | null> {
    try {
      const res = await fetch(`${API_BASE}/customers/search?q=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // Batch sync all local orders to MongoDB
  async syncOrders(orders: Order[]): Promise<{ count: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── DEDICATED CUSTOMER MASTER APIs ─────────────────────────────
  async getCustomers(query?: string, includeArchived = false): Promise<CustomerRecord[] | null> {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (includeArchived) params.append('includeArchived', 'true');
      const url = `${API_BASE}/customers${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getCustomerProfile(customerId: string): Promise<{ customer: CustomerRecord; orders: Order[] } | null> {
    try {
      const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(customerId)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createCustomer(
    data: Partial<CustomerRecord> & { forceCreate?: boolean }
  ): Promise<{ ok: boolean; customer?: CustomerRecord; error?: string; existingCustomer?: CustomerRecord }> {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Failed to register customer', existingCustomer: json.existingCustomer };
      }
      return { ok: true, customer: json };
    } catch {
      return { ok: false, error: 'Network error while registering customer' };
    }
  },

  async updateCustomer(
    customerId: string,
    data: Partial<CustomerRecord>
  ): Promise<{ ok: boolean; customer?: CustomerRecord; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(customerId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Failed to update customer' };
      }
      return { ok: true, customer: json };
    } catch {
      return { ok: false, error: 'Network error while updating customer' };
    }
  },

  async deleteOrArchiveCustomer(
    customerId: string
  ): Promise<{ ok: boolean; archived?: boolean; message?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(customerId)}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000),
      });
      const json = await res.json();
      if (!res.ok) {
        return { ok: false, error: json.error || 'Failed to delete/archive customer' };
      }
      return { ok: true, archived: json.archived, message: json.message };
    } catch {
      return { ok: false, error: 'Network error while deleting customer' };
    }
  },
};
