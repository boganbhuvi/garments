import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { OrderModel } from './models/Order';
import { SAMPLE_ORDERS } from '../src/data/sampleData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { uri, connectToMongoDB, disconnectFromMongoDB } from './db';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' })); // Support base64 image uploads

let isDbConnected = false;
let dbHost = '';
let dbName = '';

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
  } catch (error: any) {
    isDbConnected = false;
    console.warn(`! MongoDB Connection Warning: ${error.message}`);
    console.warn('! The server will continue running with LocalStorage fallback.');
  }
}

initMongo();

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
app.get('/api/orders', async (req: Request, res: Response) => {
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
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { id: regex },
        { serialNumber: regex },
        { 'customer.customerName': regex },
        { 'customer.primaryPhone': regex },
        { 'customer.customerId': regex },
      ];
    }

    const orders = await OrderModel.find(filter).sort({ updatedAt: -1 }).lean();
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single order by ID
app.get('/api/orders/:id', async (req: Request, res: Response) => {
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
app.post('/api/orders', async (req: Request, res: Response) => {
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
app.put('/api/orders/:id', async (req: Request, res: Response) => {
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
app.delete('/api/orders/:id', async (req: Request, res: Response) => {
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
app.get('/api/customers/search', async (req: Request, res: Response) => {
  if (!isDbConnected) {
    return res.status(503).json({ error: 'Database disconnected' });
  }

  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      const recent = await OrderModel.find().sort({ updatedAt: -1 }).limit(10).lean();
      return res.json(recent);
    }

    const regex = new RegExp(query.trim(), 'i');
    const matches = await OrderModel.find({
      $or: [
        { 'customer.customerName': regex },
        { 'customer.primaryPhone': regex },
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

// Batch Sync endpoint (uploads LocalStorage orders to MongoDB)
app.post('/api/sync', async (req: Request, res: Response) => {
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
app.get('/api/tailors', async (req: Request, res: Response) => {
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
app.post('/api/tailors', async (req: Request, res: Response) => {
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
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`GIRIRAJ GARMENTS ERP BACKEND SERVER`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
