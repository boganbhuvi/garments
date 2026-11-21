import { describe, it, expect } from 'vitest';
import { mapLegacyOrderStatus } from '../server/migrateLegacyOrders';

describe('Legacy Order Status Migration Mapping Tests', () => {
  it('maps NEW and READY_FOR_CUTTING to CONFIRMED + AWAITING_CUTTING', () => {
    expect(mapLegacyOrderStatus('NEW')).toEqual({
      orderStatus: 'CONFIRMED',
      productionStatus: 'AWAITING_CUTTING',
      fulfillmentStatus: 'NOT_READY',
      ambiguous: false,
    });
    expect(mapLegacyOrderStatus('READY_FOR_CUTTING').ambiguous).toBe(false);
  });

  it('maps production stages accurately', () => {
    expect(mapLegacyOrderStatus('IN_CUTTING').productionStatus).toBe('CUTTING');
    expect(mapLegacyOrderStatus('CUTTING_COMPLETED').productionStatus).toBe('AWAITING_STITCHING');
    expect(mapLegacyOrderStatus('IN_STITCHING').productionStatus).toBe('STITCHING');
    expect(mapLegacyOrderStatus('READY_FOR_QC').productionStatus).toBe('AWAITING_QC');
    expect(mapLegacyOrderStatus('READY_FOR_DISPATCH').fulfillmentStatus).toBe('READY_FOR_DISPATCH');
    expect(mapLegacyOrderStatus('DELIVERED')).toEqual({
      orderStatus: 'COMPLETED',
      productionStatus: 'QC_APPROVED',
      fulfillmentStatus: 'DELIVERED',
      ambiguous: false,
    });
  });

  it('flags ambiguous or unknown statuses rather than guessing', () => {
    expect(mapLegacyOrderStatus('ON_HOLD').ambiguous).toBe(true);
    expect(mapLegacyOrderStatus('SOME_UNKNOWN').ambiguous).toBe(true);
  });
});
