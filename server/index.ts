import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { OrderModel } from './models/Order';
import { CustomerModel } from './models/Customer';
import { UserModel } from './models/User';
import { BranchModel } from './models/Branch';
import { hashPassword, requireAuth, requireStaff, requirePermission } from './middleware/auth';
import { createErpRouter } from './routes/erpRoutes';
import { SAMPLE_ORDERS } from '../src/data/sampleData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { uri, connectToMongoDB, disconnectFromMongoDB } from './db';

export const app = express();
const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,http://localhost:5000,https://garments-u131.onrender.com'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '25mb' })); // Support base64 image uploads

let isDbConnected = false;
let dbHost = '';
let dbName = '';

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.use('/api', createErpRouter(() => isDbConnected));

// MongoDB Connection
async function initMongo() {
  if (uri.includes('<db_password>')) {
    console.warn('================================================================');
    console.warn('! NOTE: MongoDB Atlas URI contains placeholder <db_password>');
    console.warn('! Please add your password to .env: DB_PASSWORD=your_password');
    console.warn('! Until connected, Giriraj Garments ERP will run with LocalStorage');
    console.warn('================================================================');
    return;
  }

  try {
    const maskedUri = uri.replace(/:([^:@]{3,})@/, ':****@');
    console.log(`Connecting to MongoDB Atlas at: ${maskedUri}...`);
    
    // Also test native MongoClient
    await connectToMongoDB().catch(e => console.warn('MongoClient initial check warning:', e.message));

    // Connect Mongoose ODM
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    isDbConnected = true;
    dbHost = conn.connection.host;
    dbName = conn.connection.name || 'giriraj_garments';
    console.log(`✓ MongoDB Atlas Connected Successfully: Host [${dbHost}] | Database [${dbName}]`);

    // Auto-seed if collection is empty
    const count = await OrderModel.countDocuments();
    if (count === 0) {
      console.log('MongoDB collection empty. Seeding initial demonstration orders (Lakshmi & Meenakshi)...');
      await OrderModel.insertMany(SAMPLE_ORDERS);
      console.log('✓ Initial orders successfully seeded to MongoDB Atlas!');
    }

    // Backfill CustomerModel from existing orders if not already present (preserves all existing records)
    const custCount = await CustomerModel.countDocuments();
    if (custCount === 0) {
      const existingOrders = await OrderModel.find().lean();
      const seenIds = new Set<string>();
      const toInsert: any[] = [];
      for (const ord of existingOrders) {
        const c = (ord as any).customer;
        if (!c || !c.customerId) continue;
        if (seenIds.has(c.customerId)) continue;
        seenIds.add(c.customerId);
        toInsert.push({
          customerId: c.customerId,
          customerName: c.customerName || 'Unknown Customer',
          relationshipType: c.relationshipType || 'None',
          husbandName: c.husbandName || '',
          fatherName: c.fatherName || '',
          primaryPhone: c.primaryPhone || 'N/A',
          secondaryPhone: c.secondaryPhone || '',
          additionalPhones: Array.isArray(c.additionalPhones) ? c.additionalPhones : [],
          doorNo: c.doorNo || '',
          street: c.street || '',
          areaLocation: c.areaLocation || '',
          city: c.city || '',
          state: c.state || '',
          pinCode: c.pinCode || '',
          fullAddress: c.fullAddress || '',
          isArchived: false,
          history: [{ action: 'CREATED', timestamp: new Date(), note: 'Migrated from existing order records' }],
        });
      }
      if (toInsert.length > 0) {
        await CustomerModel.insertMany(toInsert, { ordered: false }).catch(() => {});
        console.log(`✓ Synced ${toInsert.length} unique customer profiles into Customer collection.`);
      }
    }

    // Seed default Main Studio Branch if empty
    const branchCount = await BranchModel.countDocuments();
    if (branchCount === 0) {
      await BranchModel.create({
        branchId: 'BR-001',
        name: 'Giriraj City Garments — Main Studio',
        address: 'Primary Workshop & Front Desk',
        managerName: 'Store Admin',
        status: 'ACTIVE',
      });
    }

    // Seed default Super Admin if no users exist
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const defaultPass = process.env.ADMIN_PASSWORD || 'Giriraj@Admin2025';
      const passwordHash = await hashPassword(defaultPass);
      await UserModel.create({
        userId: 'USR-ADMIN-01',
        username: 'admin',
        fullName: 'Giriraj Super Admin',
        passwordHash,
        role: 'SUPER_ADMIN',
        branchIds: ['BR-001'],
        isActive: true,
      });
      console.log('✓ Default Super Admin seeded (username: admin)');
    }
  } catch (error: any) {
    isDbConnected = false;
    console.warn(`! MongoDB Connection Warning: ${error.message}`);
    console.warn('! The server will continue running with LocalStorage fallback.');
  }
}

if (process.env.NODE_ENV !== 'test') {
  initMongo();
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health & Database status check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      connected: isDbConnected && mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      host: dbHost || 'Disconnected',
      name: dbName || 'giriraj_garments',
      uriMasked: uri.replace(/:([^:@]{3,})@/, ':****@'),
    },
  });
});

// GET all orders
app.get('/api/orders', requireAuth, requireStaff, requirePermission('read'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected. Using client fallback.' });
  }

  try {
    const { q, status } = req.query;
    const filter: any = {};

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (q && typeof q === 'string' && q.trim()) {
      const regex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { id: regex },
        { serialNumber: regex },
        { 'customer.customerName': regex },
        { 'customer.primaryPhone': regex },
        { 'customer.customerId': regex },
      ];
    }

    if (req.query.page) {
      const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '25'), 10) || 25));
      const [data, total] = await Promise.all([
        OrderModel.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        OrderModel.countDocuments(filter),
      ]);
      return res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
    }

    const orders = await OrderModel.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single order by ID
app.get('/api/orders/:id', requireAuth, requireStaff, requirePermission('read'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }

  try {
    const order = await OrderModel.findOne({ id: req.params.id }).lean();
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create or upsert order (for Drafts and Confirmations)
app.post('/api/orders', requireAuth, requireStaff, requirePermission('create'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }

  try {
    const orderData = req.body;
    if (!orderData || !orderData.id) {
      return res.status(400).json({ error: 'Order ID is mandatory' });
    }

    const updated = await OrderModel.findOneAndUpdate(
      { id: orderData.id },
      { ...orderData, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(updated);
  } catch (error: any) {
    console.error('Error saving order:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT update order
app.put('/api/orders/:id', requireAuth, requireStaff, requirePermission('update'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }

  try {
    const updated = await OrderModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE order
app.delete('/api/orders/:id', requireAuth, requireStaff, requirePermission('deleteArchive'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }

  try {
    const deleted = await OrderModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: `Order #${req.params.id} successfully deleted from MongoDB`, id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Customer search endpoint
app.get('/api/customers/search', requireAuth, requireStaff, requirePermission('read'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }

  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      const recent = await OrderModel.find().sort({ updatedAt: -1 }).limit(10).lean();
      return res.json(recent);
    }

    const regex = new RegExp(escapeRegex(query.trim()), 'i');
    const matches = await OrderModel.find({
      $or: [
        { 'customer.customerName': regex },
        { 'customer.primaryPhone': regex },
        { 'customer.secondaryPhone': regex },
        { 'customer.additionalPhones': regex },
        { 'customer.customerId': regex },
        { id: regex },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// DEDICATED CUSTOMER MASTER CRUD ENDPOINTS
// ==========================================

// GET all registered customers (with optional search ?q= and ?includeArchived=true)
app.get('/api/customers', requireAuth, requireStaff, requirePermission('read'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const q = (req.query.q as string || '').trim();
    const includeArchived = req.query.includeArchived === 'true';
    const filter: any = includeArchived ? {} : { isArchived: { $ne: true } };

    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [
        { customerName: regex },
        { primaryPhone: regex },
        { secondaryPhone: regex },
        { additionalPhones: regex },
        { customerId: regex },
        { fullAddress: regex },
      ];
    }

    if (req.query.page) {
      const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '25'), 10) || 25));
      const [data, total] = await Promise.all([
        CustomerModel.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        CustomerModel.countDocuments(filter),
      ]);
      return res.json({ data, page, limit, total, totalPages: Math.ceil(total / limit) });
    }

    const customers = await CustomerModel.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single customer profile + all associated orders
app.get('/api/customers/:customerId', requireAuth, requireStaff, requirePermission('read'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const customer = await CustomerModel.findOne({ customerId: req.params.customerId }).lean();
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const orders = await OrderModel.find({ 'customer.customerId': req.params.customerId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ customer, orders });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST register a new customer (with duplicate phone/ID validation)
app.post('/api/customers', requireAuth, requireStaff, requirePermission('create'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const data = req.body;
    if (!data.customerName || !data.primaryPhone) {
      return res.status(400).json({ error: 'Customer Name and Primary Mobile Number are required.' });
    }

    const cleanPhone = String(data.primaryPhone).replace(/\D/g, '');
    if (!data.forceCreate && cleanPhone.length >= 6) {
      const existingByPhone = await CustomerModel.findOne({
        isArchived: { $ne: true },
        $or: [
          { primaryPhone: data.primaryPhone.trim() },
          { primaryPhone: new RegExp(cleanPhone.slice(-10) + '$') },
        ],
      }).lean();
      if (existingByPhone) {
        return res.status(409).json({
          error: `A customer with mobile number ${data.primaryPhone} already exists (${existingByPhone.customerName} - ${existingByPhone.customerId}).`,
          existingCustomer: existingByPhone,
        });
      }
    }

    let customerId = (data.customerId || '').trim();
    if (!customerId) {
      const count = await CustomerModel.countDocuments();
      customerId = `C${String(count + 101).padStart(4, '0')}`;
      while (await CustomerModel.exists({ customerId })) {
        customerId = `C${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      const dupId = await CustomerModel.findOne({ customerId }).lean();
      if (dupId) {
        return res.status(409).json({
          error: `Customer ID ${customerId} is already assigned to ${dupId.customerName}.`,
          existingCustomer: dupId,
        });
      }
    }

    const newCustomer = new CustomerModel({
      ...data,
      customerId,
      isArchived: false,
      history: [{ action: 'CREATED', timestamp: new Date(), note: 'Registered in Customer Details' }],
    });
    const saved = await newCustomer.save();
    res.status(201).json(saved);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update an existing customer (strictly UPDATE, never CREATE, customerId immutable)
app.put('/api/customers/:customerId', requireAuth, requireStaff, requirePermission('update'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const targetId = req.params.customerId;
    const { customerId: _ignoredId, _id: _ignoredMongoId, history: _ignoredHistory, ...updateFields } = req.body;

    const updated = await CustomerModel.findOneAndUpdate(
      { customerId: targetId },
      {
        $set: { ...updateFields, updatedAt: new Date() },
        $push: {
          history: {
            action: 'UPDATED',
            timestamp: new Date(),
            note: 'Customer profile updated',
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: `Customer ${targetId} not found.` });
    }

    // Sync updated customer snapshot to existing orders linked by customerId without breaking relationships
    await OrderModel.updateMany(
      { 'customer.customerId': targetId },
      {
        $set: {
          'customer.customerName': updated.customerName,
          'customer.relationshipType': updated.relationshipType,
          'customer.husbandName': updated.husbandName,
          'customer.fatherName': updated.fatherName,
          'customer.primaryPhone': updated.primaryPhone,
          'customer.secondaryPhone': updated.secondaryPhone,
          'customer.additionalPhones': updated.additionalPhones,
          'customer.doorNo': updated.doorNo,
          'customer.street': updated.street,
          'customer.areaLocation': updated.areaLocation,
          'customer.city': updated.city,
          'customer.state': updated.state,
          'customer.pinCode': updated.pinCode,
          'customer.fullAddress': updated.fullAddress,
        },
      }
    );

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE or safely archive a customer
app.delete('/api/customers/:customerId', requireAuth, requireStaff, requirePermission('deleteArchive'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const targetId = req.params.customerId;
    const orderCount = await OrderModel.countDocuments({ 'customer.customerId': targetId });
    if (orderCount > 0) {
      const archived = await CustomerModel.findOneAndUpdate(
        { customerId: targetId },
        {
          $set: { isArchived: true, updatedAt: new Date() },
          $push: {
            history: {
              action: 'ARCHIVED',
              timestamp: new Date(),
              note: `Safely archived (${orderCount} linked orders preserved)`,
            },
          },
        },
        { new: true }
      );
      if (!archived) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      return res.json({
        archived: true,
        message: `Customer ${targetId} has ${orderCount} linked orders and was safely archived instead of deleted.`,
        customer: archived,
      });
    }

    const deleted = await CustomerModel.findOneAndDelete({ customerId: targetId });
    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ archived: false, message: `Customer ${targetId} deleted.`, customerId: targetId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Batch Sync endpoint (uploads LocalStorage orders to MongoDB)
app.post('/api/sync', requireAuth, requireStaff, requirePermission('create'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }

  try {
    const { orders } = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'No orders provided for sync' });
    }

    let upsertedCount = 0;
    for (const ord of orders) {
      if (ord.id) {
        await OrderModel.findOneAndUpdate(
          { id: ord.id },
          { ...ord, updatedAt: new Date() },
          { upsert: true }
        );
        upsertedCount++;
      }
    }

    res.json({ message: `Successfully synced ${upsertedCount} orders to MongoDB`, count: upsertedCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// TAILOR MANAGEMENT ENDPOINTS
// ==========================================
import { TailorModel } from './models/Tailor';

// GET all tailors
app.get('/api/tailors', requireAuth, requireStaff, requirePermission('read'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const tailors = await TailorModel.find().sort({ createdAt: 1 }).lean();
    res.json(tailors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create or upsert tailor
app.post('/api/tailors', requireAuth, requireStaff, requirePermission('production'), async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const tailor = req.body;
    const upserted = await TailorModel.findOneAndUpdate(
      { id: tailor.id },
      { ...tailor, updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(upserted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update tailor
app.put('/api/tailors/:id', async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    const updated = await TailorModel.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Tailor not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE tailor
app.delete('/api/tailors/:id', async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }
  try {
    await TailorModel.findOneAndDelete({ id: req.params.id });
    res.json({ message: `Tailor #${req.params.id} removed from MongoDB` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static frontend files from Vite build in production (e.g. Render)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA client-side routing (Express 5 compatible)
app.use((req: Request, res: Response, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`GIRIRAJ GARMENTS ERP BACKEND SERVER`);
    console.log(`Listening on http://localhost:${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}
