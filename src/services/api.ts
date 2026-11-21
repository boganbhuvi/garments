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
      const res = await fetch(url, { credentials: 'include', signal: AbortSignal.timeout(4000) });
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
      const res = await fetch(url, { credentials: 'include', signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async getCustomerProfile(customerId: string): Promise<{ customer: CustomerRecord; orders: Order[] } | null> {
    try {
      const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(customerId)}`, {
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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
        credentials: 'include',
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

  // ── STAFF AUTHENTICATION & SESSION APIs ─────────────────────────
  async loginStaff(
    username: string,
    password: string
  ): Promise<{ ok: boolean; user?: any; token?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Login failed' };
      return { ok: true, user: json.user, token: json.token };
    } catch {
      return { ok: false, error: 'Network error during login' };
    }
  },

  async logoutStaff(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        signal: AbortSignal.timeout(4000),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getMe(): Promise<any | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: 'include',
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.user || null;
    } catch {
      return null;
    }
  },

  // ── WORKFLOW TRANSITION ENGINE API ──────────────────────────────
  async transitionOrder(
    orderId: string,
    payload: {
      stage: 'ORDER' | 'PRODUCTION' | 'FULFILLMENT';
      targetStatus: string;
      note?: string;
      reworkTarget?: 'CUTTING' | 'STITCHING';
    }
  ): Promise<{ ok: boolean; order?: Order; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Transition failed' };
      return { ok: true, order: json.order };
    } catch {
      return { ok: false, error: 'Network error during status transition' };
    }
  },

  // ── INVENTORY MONGODB APIs ──────────────────────────────────────
  async getInventory(q = '', page = 1, limit = 50): Promise<any | null> {
    try {
      const params = new URLSearchParams({ q, page: String(page), limit: String(limit) });
      const res = await fetch(`${API_BASE}/inventory?${params.toString()}`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createInventoryItem(data: {
    name: string;
    category: string;
    unit: string;
    quantity: number;
    minStock: number;
    branchId?: string;
  }): Promise<{ ok: boolean; item?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Failed to add material' };
      return { ok: true, item: json };
    } catch {
      return { ok: false, error: 'Network error adding material' };
    }
  },

  async recordStockMovement(
    itemId: string,
    data: { type: 'RECEIVED' | 'ISSUED' | 'ADJUSTMENT'; quantity: number; note?: string }
  ): Promise<{ ok: boolean; item?: any; movement?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/inventory/${encodeURIComponent(itemId)}/movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Stock movement failed' };
      return { ok: true, item: json.item, movement: json.movement };
    } catch {
      return { ok: false, error: 'Network error recording stock movement' };
    }
  },

  async migrateInventory(items: any[]): Promise<{ imported: number; skipped: number } | null> {
    try {
      const res = await fetch(`${API_BASE}/inventory/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── BRANCH MONGODB APIs ─────────────────────────────────────────
  async getBranches(): Promise<any[] | null> {
    try {
      const res = await fetch(`${API_BASE}/branches`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async createBranch(data: {
    name: string;
    address: string;
    phone?: string;
    managerName: string;
  }): Promise<{ ok: boolean; branch?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Failed to create branch' };
      return { ok: true, branch: json };
    } catch {
      return { ok: false, error: 'Network error creating branch' };
    }
  },

  // ── PAYMENT TRANSACTION APIs ────────────────────────────────────
  async getPayments(orderId?: string, customerId?: string): Promise<any[] | null> {
    try {
      const params = new URLSearchParams();
      if (orderId) params.append('orderId', orderId);
      if (customerId) params.append('customerId', customerId);
      const res = await fetch(`${API_BASE}/payments?${params.toString()}`, {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async recordPayment(data: {
    orderId: string;
    amount: number;
    paymentType?: 'ADVANCE' | 'PARTIAL' | 'FINAL' | 'REFUND';
    paymentMethod?: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
    transactionReference?: string;
    notes?: string;
  }): Promise<{ ok: boolean; payment?: any; totalPaid?: number; balance?: number; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Payment failed' };
      return { ok: true, payment: json.payment, totalPaid: json.totalPaid, balance: json.balance };
    } catch {
      return { ok: false, error: 'Network error recording payment' };
    }
  },

  // ── CUSTOMER PORTAL AUTH & PUBLIC ENQUIRIES ─────────────────────
  async registerCustomerAccount(data: {
    customerName: string;
    primaryPhone: string;
    password: string;
    fullAddress?: string;
  }): Promise<{ ok: boolean; user?: any; customer?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Registration failed' };
      return { ok: true, user: json.user, customer: json.customer };
    } catch {
      return { ok: false, error: 'Network error during registration' };
    }
  },

  async loginCustomerAccount(
    phone: string,
    password: string
  ): Promise<{ ok: boolean; user?: any; customer?: any; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, password }),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Login failed' };
      return { ok: true, user: json.user, customer: json.customer };
    } catch {
      return { ok: false, error: 'Network error during sign in' };
    }
  },

  async submitEnquiry(data: {
    type: 'BULK' | 'CONTACT' | 'TAILORING';
    name: string;
    organization?: string;
    phone: string;
    email?: string;
    estimatedQuantity?: string;
    message?: string;
  }): Promise<{ ok: boolean; enquiryId?: string; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(6000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Enquiry submission failed' };
      return { ok: true, enquiryId: json.enquiryId };
    } catch {
      return { ok: false, error: 'Network error submitting enquiry' };
    }
  },

  async trackPublicOrder(query: string): Promise<{
    ok: boolean;
    order?: {
      orderId: string;
      billNumber?: string;
      status: string;
      productionStatus?: string;
      fulfillmentStatus?: string;
      orderDate?: string;
      dueDate?: string;
      itemCount?: number;
    };
    error?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/public/track?q=${encodeURIComponent(query.trim())}`, {
        signal: AbortSignal.timeout(5000),
      });
      const json = await res.json();
      if (!res.ok) return { ok: false, error: json.error || 'Order not found' };
      return { ok: true, order: json };
    } catch {
      return { ok: false, error: 'Network error while tracking order' };
    }
  },
};
