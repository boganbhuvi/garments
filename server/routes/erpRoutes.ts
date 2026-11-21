import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { CustomerModel } from '../models/Customer';
import { OrderModel } from '../models/Order';
import { InventoryItemModel, StockMovementModel } from '../models/Inventory';
import { BranchModel } from '../models/Branch';
import { PaymentModel } from '../models/Payment';
import { EnquiryModel } from '../models/Enquiry';
import {
  isRoleAuthorizedForTransition,
  validateProductionTransition,
  validateFulfillmentTransition,
} from '../services/workflowEngine';
import {
  AuthenticatedRequest,
  SESSION_COOKIE_NAME,
  createRateLimiter,
  hashPassword,
  verifyPassword,
  signAuthToken,
  requireAuth,
  requireStaff,
  requirePermission,
  canAccessBranch,
} from '../middleware/auth';

export function createErpRouter(getDbConnected: () => boolean): Router {
  const router = Router();
  const loginLimiter = createRateLimiter(10, 15 * 60 * 1000);
  const enquiryLimiter = createRateLimiter(15, 10 * 60 * 1000);

  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 12 * 60 * 60 * 1000,
  };

  // ── 1. AUTHENTICATION & CUSTOMER PORTAL AUTH ───────────────────────────
  router.post('/auth/login', loginLimiter, async (req: Request, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      const user = await UserModel.findOne({ username: String(username).trim(), isActive: true });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const valid = await verifyPassword(String(password), user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      user.lastLoginAt = new Date();
      await user.save();

      const payload = {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        branchIds: user.branchIds,
        customerId: user.customerId,
        tokenVersion: user.tokenVersion,
      };
      const token = signAuthToken(payload);
      res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);
      res.json({ user: payload, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (getDbConnected() && req.user) {
        await UserModel.updateOne({ userId: req.user.userId }, { $inc: { tokenVersion: 1 } });
      }
      res.clearCookie(SESSION_COOKIE_NAME);
      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // Customer Portal Registration (Password-verified, links to CustomerModel without duplicates)
  router.post('/auth/customer/register', loginLimiter, async (req: Request, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { customerName, primaryPhone, password, fullAddress } = req.body;
      if (!customerName || !primaryPhone || !password || String(password).length < 6) {
        return res.status(400).json({ error: 'Name, mobile number, and password (min 6 chars) are required' });
      }
      const cleanPhone = String(primaryPhone).replace(/\D/g, '').slice(-10);
      const existingUser = await UserModel.findOne({ username: cleanPhone }).lean();
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this mobile number already exists. Please sign in.' });
      }

      let customer = await CustomerModel.findOne({
        isArchived: { $ne: true },
        primaryPhone: new RegExp(cleanPhone + '$'),
      });

      if (!customer) {
        const count = await CustomerModel.countDocuments();
        const customerId = `C${String(count + 101).padStart(4, '0')}`;
        customer = await CustomerModel.create({
          customerId,
          customerName: String(customerName).trim(),
          primaryPhone: String(primaryPhone).trim(),
          fullAddress: String(fullAddress || '').trim(),
          isArchived: false,
          history: [{ action: 'CREATED', timestamp: new Date(), note: 'Registered via Customer Portal' }],
        });
      }

      const passwordHash = await hashPassword(String(password));
      const newUser = await UserModel.create({
        userId: `USR-${Date.now().toString().slice(-6)}`,
        username: cleanPhone,
        fullName: customer.customerName,
        phone: customer.primaryPhone,
        passwordHash,
        role: 'CUSTOMER',
        branchIds: [],
        customerId: customer.customerId,
      });

      const payload = {
        userId: newUser.userId,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        branchIds: [],
        customerId: customer.customerId,
        tokenVersion: newUser.tokenVersion,
      };
      const token = signAuthToken(payload);
      res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);
      res.status(201).json({ user: payload, customer, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/auth/customer/login', loginLimiter, async (req: Request, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { phone, password } = req.body;
      if (!phone || !password) {
        return res.status(400).json({ error: 'Mobile number and password are required' });
      }
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      const user = await UserModel.findOne({ username: cleanPhone, role: 'CUSTOMER', isActive: true });
      if (!user || !(await verifyPassword(String(password), user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid mobile number or password' });
      }
      const customer = await CustomerModel.findOne({ customerId: user.customerId }).lean();
      const payload = {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        branchIds: [],
        customerId: user.customerId,
        tokenVersion: user.tokenVersion,
      };
      const token = signAuthToken(payload);
      res.cookie(SESSION_COOKIE_NAME, token, cookieOptions);
      res.json({ user: payload, customer, token });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── 2. INVENTORY & STOCK MOVEMENTS (MongoDB) ───────────────────────────
  router.get('/inventory', requireAuth, requireStaff, requirePermission('inventory'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
      const q = String(req.query.q || '').trim();
      const filter: any = { isArchived: { $ne: true } };
      if (q) {
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        filter.$or = [{ itemId: regex }, { name: regex }, { category: regex }];
      }
      const [data, total] = await Promise.all([
        InventoryItemModel.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        InventoryItemModel.countDocuments(filter),
      ]);
      res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/inventory', requireAuth, requireStaff, requirePermission('inventory'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { name, category, unit, quantity, minStock, branchId } = req.body;
      if (!name || !category || !unit) {
        return res.status(400).json({ error: 'name, category, and unit are required' });
      }
      const qty = Math.max(0, Number(quantity) || 0);
      const count = await InventoryItemModel.countDocuments();
      const itemId = `MAT-${String(count + 1).padStart(3, '0')}`;
      const item = await InventoryItemModel.create({
        itemId,
        name: String(name).trim(),
        category: String(category).trim(),
        unit: String(unit).trim(),
        quantity: qty,
        minStock: Math.max(0, Number(minStock) || 10),
        branchId: branchId || 'BR-001',
      });
      await StockMovementModel.create({
        movementId: `MOV-${Date.now()}`,
        itemId: item.itemId,
        itemName: item.name,
        type: 'RECEIVED',
        quantity: qty,
        previousQuantity: 0,
        newQuantity: qty,
        branchId: item.branchId,
        recordedBy: req.user?.username || 'STAFF',
        note: 'Initial stock registration',
      });
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/inventory/:itemId/movement', requireAuth, requireStaff, requirePermission('inventory'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { type, quantity, note } = req.body;
      const qty = Number(quantity);
      if (!['RECEIVED', 'ISSUED', 'ADJUSTMENT'].includes(type) || !Number.isFinite(qty) || qty <= 0) {
        return res.status(400).json({ error: 'Valid movement type and positive quantity are required' });
      }
      const item = await InventoryItemModel.findOne({ itemId: req.params.itemId, isArchived: { $ne: true } });
      if (!item) return res.status(404).json({ error: 'Inventory item not found' });

      const prevQty = item.quantity;
      const nextQty = type === 'RECEIVED' ? prevQty + qty : prevQty - qty;
      if (nextQty < 0) {
        return res.status(400).json({ error: `Insufficient stock (available: ${prevQty} ${item.unit})` });
      }
      item.quantity = nextQty;
      await item.save();

      const movement = await StockMovementModel.create({
        movementId: `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        itemId: item.itemId,
        itemName: item.name,
        type,
        quantity: qty,
        previousQuantity: prevQty,
        newQuantity: nextQty,
        branchId: item.branchId,
        recordedBy: req.user?.username || 'STAFF',
        note: String(note || ''),
      });
      res.json({ item, movement });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/inventory/migrate', requireAuth, requireStaff, requirePermission('inventory'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const items = Array.isArray(req.body.items) ? req.body.items : [];
      let imported = 0;
      let skipped = 0;
      for (const raw of items) {
        const itemId = String(raw.id || raw.itemId || '').trim();
        if (!itemId || !raw.name) { skipped++; continue; }
        const exists = await InventoryItemModel.exists({ itemId });
        if (exists) { skipped++; continue; }
        await InventoryItemModel.create({
          itemId,
          name: String(raw.name),
          category: String(raw.category || 'General'),
          unit: String(raw.unit || 'Units'),
          quantity: Math.max(0, Number(raw.quantity) || 0),
          minStock: Math.max(0, Number(raw.minStock) || 10),
          branchId: 'BR-001',
        });
        imported++;
      }
      res.json({ imported, skipped });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/inventory/:itemId', requireAuth, requireStaff, requirePermission('inventory'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { name, category, unit, minStock } = req.body;
      const updated = await InventoryItemModel.findOneAndUpdate(
        { itemId: req.params.itemId, isArchived: { $ne: true } },
        { $set: { ...(name && { name }), ...(category && { category }), ...(unit && { unit }), ...(minStock !== undefined && { minStock: Math.max(0, Number(minStock)) }) } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Inventory item not found' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/inventory/:itemId', requireAuth, requireStaff, requirePermission('inventory'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const archived = await InventoryItemModel.findOneAndUpdate(
        { itemId: req.params.itemId },
        { $set: { isArchived: true } },
        { new: true }
      );
      if (!archived) return res.status(404).json({ error: 'Inventory item not found' });
      res.json({ archived: true, itemId: archived.itemId });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── 3. BRANCH MANAGEMENT (MongoDB) ─────────────────────────────────────
  router.get('/branches', requireAuth, requireStaff, async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const branches = await BranchModel.find().sort({ createdAt: 1 }).lean();
      res.json(branches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/branches', requireAuth, requireStaff, requirePermission('admin'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { name, address, phone, managerName } = req.body;
      if (!name) return res.status(400).json({ error: 'Branch name is required' });
      const count = await BranchModel.countDocuments();
      const branchId = `BR-${String(count + 1).padStart(3, '0')}`;
      const branch = await BranchModel.create({
        branchId,
        name: String(name).trim(),
        address: String(address || ''),
        phone: String(phone || ''),
        managerName: String(managerName || ''),
        status: 'ACTIVE',
      });
      res.status(201).json(branch);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put('/branches/:branchId', requireAuth, requireStaff, requirePermission('admin'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { name, address, phone, managerName, status } = req.body;
      const updated = await BranchModel.findOneAndUpdate(
        { branchId: req.params.branchId },
        {
          $set: {
            ...(name && { name: String(name).trim() }),
            ...(address !== undefined && { address: String(address) }),
            ...(phone !== undefined && { phone: String(phone) }),
            ...(managerName !== undefined && { managerName: String(managerName) }),
            ...(status && ['ACTIVE', 'INACTIVE', 'PLANNED'].includes(status) && { status }),
          },
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Branch not found' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── 4. PAYMENT TRANSACTIONS (MongoDB) ──────────────────────────────────
  router.get('/payments', requireAuth, requireStaff, requirePermission('financial'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const filter: any = {};
      if (req.query.orderId) filter.orderId = String(req.query.orderId);
      if (req.query.customerId) filter.customerId = String(req.query.customerId);
      const payments = await PaymentModel.find(filter).sort({ paymentDate: -1 }).lean();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/payments', requireAuth, requireStaff, requirePermission('financial'), async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { orderId, amount, paymentType, paymentMethod, transactionReference, notes } = req.body;
      const numericAmount = Number(amount);
      if (!orderId || !Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: 'Valid orderId and positive payment amount are required' });
      }
      const order = await OrderModel.findOne({ id: orderId });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const payment = await PaymentModel.create({
        paymentId: `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: order.id,
        customerId: (order as any).customer?.customerId || 'UNKNOWN',
        amount: numericAmount,
        paymentType: paymentType || 'PARTIAL',
        paymentMethod: paymentMethod || 'CASH',
        transactionReference: String(transactionReference || ''),
        paymentStatus: 'VERIFIED',
        receivedBy: req.user?.username || 'STAFF',
        branchId: (order as any).branchId || 'BR-001',
        notes: String(notes || ''),
      });

      // Derive total paid from all verified PaymentModel records
      const allPayments = await PaymentModel.find({ orderId: order.id, paymentStatus: 'VERIFIED' }).lean();
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
      const grandTotal = (order as any).billing?.grandTotal || 0;
      const balance = Math.max(0, grandTotal - totalPaid);

      await OrderModel.updateOne(
        { id: order.id },
        {
          $set: {
            'billing.amountPaid': totalPaid,
            'billing.balanceAmount': balance,
            'billing.paymentStatus': balance === 0 && grandTotal > 0 ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID',
          },
        }
      );

      res.status(201).json({ payment, totalPaid, balance });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── 5. BUSINESS ENQUIRIES (Public Submit, Protected Admin Read) ────────
  router.post('/enquiries', enquiryLimiter, async (req: Request, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { type, name, organization, phone, email, estimatedQuantity, message } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone number are required' });
      }
      const enquiry = await EnquiryModel.create({
        enquiryId: `ENQ-${Date.now().toString().slice(-6)}`,
        type: ['BULK', 'CONTACT', 'TAILORING'].includes(type) ? type : 'CONTACT',
        name: String(name).trim(),
        organization: String(organization || '').trim(),
        phone: String(phone).trim(),
        email: String(email || '').trim(),
        estimatedQuantity: String(estimatedQuantity || '').trim(),
        message: String(message || '').trim(),
        status: 'NEW',
      });
      res.status(201).json({ enquiryId: enquiry.enquiryId, status: enquiry.status });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/enquiries', requireAuth, requireStaff, async (_req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const list = await EnquiryModel.find().sort({ createdAt: -1 }).lean();
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.patch('/enquiries/:enquiryId', requireAuth, requireStaff, async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { status } = req.body;
      if (!['NEW', 'IN_REVIEW', 'RESPONDED', 'CLOSED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      const updated = await EnquiryModel.findOneAndUpdate(
        { enquiryId: req.params.enquiryId },
        { $set: { status } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Enquiry not found' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── 6. DEPARTMENT HANDOFF & WORKFLOW TRANSITIONS ───────────────────────
  router.post('/orders/:id/transition', requireAuth, requireStaff, async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const { stage, targetStatus, note, reworkTarget } = req.body;
      if (!['ORDER', 'PRODUCTION', 'FULFILLMENT'].includes(stage) || !targetStatus) {
        return res.status(400).json({ error: 'stage (ORDER|PRODUCTION|FULFILLMENT) and targetStatus are required' });
      }
      if (!req.user || !isRoleAuthorizedForTransition(req.user.role, stage, targetStatus)) {
        return res.status(403).json({ error: `Role ${req.user?.role} is not authorized for ${stage} -> ${targetStatus}` });
      }

      const order = await OrderModel.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const ordAny = order as any;
      if (!canAccessBranch(req.user, ordAny.branchId)) {
        return res.status(403).json({ error: 'Forbidden: Order belongs to another branch' });
      }

      const currentOrderStatus = ordAny.orderStatus || 'CONFIRMED';
      const currentProdStatus = ordAny.productionStatus || 'AWAITING_CUTTING';
      const currentFulfillStatus = ordAny.fulfillmentStatus || 'NOT_READY';

      if (stage === 'PRODUCTION') {
        const check = validateProductionTransition(currentProdStatus, targetStatus, note);
        if (!check.valid) return res.status(400).json({ error: check.error });
        ordAny.productionStatus = targetStatus;
        if (targetStatus === 'AWAITING_STITCHING') ordAny.status = 'IN_STITCHING';
        else if (targetStatus === 'AWAITING_QC') ordAny.status = 'READY_FOR_QC';
        else if (targetStatus === 'QC_APPROVED') ordAny.status = 'READY_FOR_DISPATCH';
        else if (targetStatus === 'CUTTING') ordAny.status = 'IN_CUTTING';
        else if (targetStatus === 'REWORK') ordAny.status = reworkTarget === 'CUTTING' ? 'IN_CUTTING' : 'IN_STITCHING';
      } else if (stage === 'FULFILLMENT') {
        const check = validateFulfillmentTransition(currentFulfillStatus, targetStatus, currentProdStatus);
        if (!check.valid) return res.status(400).json({ error: check.error });
        ordAny.fulfillmentStatus = targetStatus;
        if (targetStatus === 'DELIVERED') {
          ordAny.orderStatus = 'COMPLETED';
          ordAny.status = 'DELIVERED';
        }
      } else if (stage === 'ORDER') {
        ordAny.orderStatus = targetStatus;
      }

      const fromStatus =
        stage === 'ORDER' ? currentOrderStatus : stage === 'PRODUCTION' ? currentProdStatus : currentFulfillStatus;

      const entry = {
        fromStatus,
        toStatus: targetStatus,
        stage,
        changedBy: req.user.username,
        role: req.user.role,
        timestamp: new Date().toISOString(),
        note: String(note || ''),
      };

      const updated = await OrderModel.findOneAndUpdate(
        { id: order.id },
        {
          $set: {
            status: ordAny.status,
            orderStatus: ordAny.orderStatus,
            productionStatus: ordAny.productionStatus,
            fulfillmentStatus: ordAny.fulfillmentStatus,
            updatedAt: new Date(),
          },
          $push: { workflowHistory: entry },
        },
        { new: true }
      );

      res.json({ order: updated, transition: entry });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // PUBLIC ORDER TRACKING (NO PII)
  // ==========================================
  router.get('/public/track', enquiryLimiter, async (req: Request, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    try {
      const q = String(req.query.q || '').trim();
      if (!q || q.length < 3) {
        return res.status(400).json({ error: 'Please provide a valid Order ID or Bill Number.' });
      }
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${escaped}$`, 'i');
      const order: any = await OrderModel.findOne({
        $or: [{ id: regex }, { billNumber: regex }],
      })
        .select('id billNumber status productionStatus fulfillmentStatus orderDate dueDate items.length')
        .lean();

      if (!order) {
        return res.status(404).json({ error: 'No order found matching that Order ID or Bill Number.' });
      }

      res.json({
        orderId: order.id,
        billNumber: order.billNumber || order.id,
        status: order.status || 'Confirmed',
        productionStatus: order.productionStatus || null,
        fulfillmentStatus: order.fulfillmentStatus || null,
        orderDate: order.orderDate || null,
        dueDate: order.dueDate || null,
        itemCount: Array.isArray(order.items) ? order.items.length : 0,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // CUSTOMER SELF-SERVICE (STRICTLY SCOPED)
  // ==========================================
  router.get('/customer/me/orders', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    if (!req.user || req.user.role !== 'CUSTOMER' || !req.user.customerId) {
      return res.status(403).json({ error: 'Customer portal access only.' });
    }
    try {
      const orders = await OrderModel.find({ customerId: req.user.customerId })
        .sort({ createdAt: -1 })
        .lean();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/customer/me/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    if (!req.user || req.user.role !== 'CUSTOMER' || !req.user.customerId) {
      return res.status(403).json({ error: 'Customer portal access only.' });
    }
    try {
      const { name, email, address, city, pincode, savedAddresses } = req.body || {};
      const update: Record<string, any> = { updatedAt: new Date() };
      if (typeof name === 'string' && name.trim()) update.name = name.trim();
      if (typeof email === 'string') update.email = email.trim();
      if (typeof address === 'string') update.address = address.trim();
      if (typeof city === 'string') update.city = city.trim();
      if (typeof pincode === 'string') update.pincode = pincode.trim();
      if (Array.isArray(savedAddresses)) update.savedAddresses = savedAddresses;

      const customer = await CustomerModel.findOneAndUpdate(
        { customerId: req.user.customerId },
        { $set: update },
        { new: true }
      ).lean();

      if (!customer) return res.status(404).json({ error: 'Customer profile not found' });
      res.json({ customer });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/customer/me/orders', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    if (!getDbConnected()) return res.status(503).json({ error: 'Database disconnected' });
    if (!req.user || req.user.role !== 'CUSTOMER' || !req.user.customerId) {
      return res.status(403).json({ error: 'Customer portal access only.' });
    }
    try {
      const customer: any = await CustomerModel.findOne({ customerId: req.user.customerId }).lean();
      if (!customer) return res.status(404).json({ error: 'Customer record not found' });

      const body = req.body || {};
      const orderId = body.id || `WEB-${Date.now()}`;
      const newOrder = await OrderModel.create({
        ...body,
        id: orderId,
        customerId: customer.customerId,
        customerName: customer.name,
        customerMobile: customer.phone,
        status: 'Confirmed',
        orderStatus: 'CONFIRMED',
        productionStatus: 'AWAITING_CUTTING',
        fulfillmentStatus: 'NOT_READY',
        createdBy: req.user.username,
      });
      res.status(201).json(newOrder);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
