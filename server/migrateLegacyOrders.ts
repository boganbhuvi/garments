import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { OrderModel } from './models/Order';
import { uri } from './db';

dotenv.config();

export interface MappedLifecycles {
  orderStatus: 'DRAFT' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  productionStatus: 'AWAITING_CUTTING' | 'CUTTING' | 'AWAITING_STITCHING' | 'STITCHING' | 'AWAITING_QC' | 'REWORK' | 'QC_APPROVED';
  fulfillmentStatus: 'NOT_READY' | 'READY_FOR_PICKUP' | 'READY_FOR_DISPATCH' | 'DISPATCHED' | 'DELIVERED';
  ambiguous: boolean;
}

export function mapLegacyOrderStatus(legacyStatus?: string): MappedLifecycles {
  switch (legacyStatus) {
    case 'NEW':
    case 'READY_FOR_CUTTING':
      return { orderStatus: 'CONFIRMED', productionStatus: 'AWAITING_CUTTING', fulfillmentStatus: 'NOT_READY', ambiguous: false };
    case 'IN_CUTTING':
      return { orderStatus: 'IN_PROGRESS', productionStatus: 'CUTTING', fulfillmentStatus: 'NOT_READY', ambiguous: false };
    case 'CUTTING_COMPLETED':
      return { orderStatus: 'IN_PROGRESS', productionStatus: 'AWAITING_STITCHING', fulfillmentStatus: 'NOT_READY', ambiguous: false };
    case 'IN_STITCHING':
      return { orderStatus: 'IN_PROGRESS', productionStatus: 'STITCHING', fulfillmentStatus: 'NOT_READY', ambiguous: false };
    case 'READY_FOR_QC':
    case 'IN_QC':
      return { orderStatus: 'IN_PROGRESS', productionStatus: 'AWAITING_QC', fulfillmentStatus: 'NOT_READY', ambiguous: false };
    case 'READY_FOR_TRIAL':
      return { orderStatus: 'IN_PROGRESS', productionStatus: 'QC_APPROVED', fulfillmentStatus: 'READY_FOR_PICKUP', ambiguous: false };
    case 'READY_FOR_DISPATCH':
      return { orderStatus: 'IN_PROGRESS', productionStatus: 'QC_APPROVED', fulfillmentStatus: 'READY_FOR_DISPATCH', ambiguous: false };
    case 'COMPLETED':
    case 'DELIVERED':
      return { orderStatus: 'COMPLETED', productionStatus: 'QC_APPROVED', fulfillmentStatus: 'DELIVERED', ambiguous: false };
    default:
      // ON_HOLD or unknown status — flag as ambiguous rather than guessing
      return { orderStatus: 'IN_PROGRESS', productionStatus: 'AWAITING_CUTTING', fulfillmentStatus: 'NOT_READY', ambiguous: true };
  }
}

async function runMigration() {
  const isDryRun = !process.argv.includes('--execute');
  console.log(`=== LEGACY ORDER STATUS MIGRATION (${isDryRun ? 'DRY RUN' : 'EXECUTE'}) ===`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const orders = await OrderModel.find().lean();
  console.log(`Total orders inspected: ${orders.length}`);

  const summary: Record<string, number> = {};
  const ambiguousIds: string[] = [];
  let updatedCount = 0;

  for (const ord of orders as any[]) {
    const mapped = mapLegacyOrderStatus(ord.status);
    summary[ord.status || 'EMPTY'] = (summary[ord.status || 'EMPTY'] || 0) + 1;
    if (mapped.ambiguous) {
      ambiguousIds.push(`${ord.id} (${ord.status})`);
      continue;
    }
    if (!ord.orderStatus || !ord.productionStatus || !ord.fulfillmentStatus) {
      if (!isDryRun) {
        await OrderModel.updateOne(
          { id: ord.id },
          {
            $set: {
              orderStatus: ord.orderStatus || mapped.orderStatus,
              productionStatus: ord.productionStatus || mapped.productionStatus,
              fulfillmentStatus: ord.fulfillmentStatus || mapped.fulfillmentStatus,
            },
          }
        );
      }
      updatedCount++;
    }
  }

  console.log('Status Breakdown:', summary);
  console.log(`Eligible for migration: ${updatedCount}`);
  if (ambiguousIds.length > 0) {
    console.warn('Ambiguous/Skipped Orders:', ambiguousIds);
  }
  await mongoose.disconnect();
}

if (process.argv[1]?.includes('migrateLegacyOrders')) {
  runMigration().catch((err) => {
    console.error('Migration error:', err);
    process.exit(1);
  });
}
