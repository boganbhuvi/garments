/**
 * importCustomersFromExcel.ts
 *
 * Reads dataset/customers_from_excel.json (generated from customer-register.xlsx),
 * deletes all existing orders from MongoDB, then inserts the 191 customer records.
 *
 * Run:
 *   npx tsx server/importCustomersFromExcel.ts
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { OrderModel } from './models/Order';
import { uri } from './db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

async function run() {
  console.log('='.repeat(60));
  console.log('GIRIRAJ GARMENTS — Customer Register Import');
  console.log('='.repeat(60));

  // 1. Load JSON
  const jsonPath = path.join(__dirname, '..', 'dataset', 'customers_from_excel.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('ERROR: JSON file not found at', jsonPath);
    console.error('Run:  python dataset/convert_excel_customers.py  first.');
    process.exit(1);
  }
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${rawData.length} customer records from JSON.`);

  // 2. Connect to MongoDB
  console.log('\nConnecting to MongoDB Atlas...');
  await mongoose.connect(uri as string);
  console.log('Connected.');

  // 3. Delete ALL existing orders
  const beforeCount = await OrderModel.countDocuments();
  console.log(`\nExisting orders in DB: ${beforeCount}`);
  console.log('Deleting all existing orders...');
  await OrderModel.deleteMany({});
  console.log('Cleared.');

  // 4. Insert new customer records
  console.log(`\nInserting ${rawData.length} customer records...`);
  const result = await OrderModel.insertMany(rawData, { ordered: false });
  console.log(`Inserted: ${result.length} records`);

  // 5. Verify
  const afterCount = await OrderModel.countDocuments();
  console.log(`\nFinal DB count: ${afterCount} orders`);

  // 6. Show sample
  const samples = await OrderModel.find({}, { 'customer.customerId': 1, 'customer.customerName': 1, 'customer.primaryPhone': 1, _id: 0 }).limit(5);
  console.log('\nSample records:');
  samples.forEach((s: any) => {
    const c = s.customer;
    console.log(`  ${c.customerId} — ${c.customerName} — ${c.primaryPhone}`);
  });

  const lastSamples = await OrderModel.find({}, { 'customer.customerId': 1, 'customer.customerName': 1, _id: 0 }).sort({ 'customer.customerId': -1 }).limit(3);
  console.log('\nLast 3 records:');
  lastSamples.forEach((s: any) => {
    console.log(`  ${s.customer.customerId} — ${s.customer.customerName}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(60));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error('IMPORT FAILED:', err.message);
  process.exit(1);
});
