import { describe, it, expect } from 'vitest';
import {
  isRoleAuthorizedForTransition,
  validateProductionTransition,
  validateFulfillmentTransition,
} from '../server/services/workflowEngine';

describe('Department Handoff & Workflow Engine Tests', () => {
  it('allows valid sequential production transitions', () => {
    expect(validateProductionTransition('AWAITING_CUTTING', 'CUTTING').valid).toBe(true);
    expect(validateProductionTransition('CUTTING', 'AWAITING_STITCHING').valid).toBe(true);
    expect(validateProductionTransition('AWAITING_STITCHING', 'STITCHING').valid).toBe(true);
    expect(validateProductionTransition('STITCHING', 'AWAITING_QC').valid).toBe(true);
    expect(validateProductionTransition('AWAITING_QC', 'QC_APPROVED').valid).toBe(true);
  });

  it('rejects skipping mandatory production stages', () => {
    const res = validateProductionTransition('AWAITING_CUTTING', 'QC_APPROVED');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid production transition');
  });

  it('requires defect note when sending to REWORK', () => {
    const missingNote = validateProductionTransition('AWAITING_QC', 'REWORK', '');
    expect(missingNote.valid).toBe(false);
    const withNote = validateProductionTransition('AWAITING_QC', 'REWORK', 'Sleeve length uneven');
    expect(withNote.valid).toBe(true);
  });

  it('prevents dispatch/fulfillment before QC_APPROVED', () => {
    const blocked = validateFulfillmentTransition('NOT_READY', 'READY_FOR_DISPATCH', 'STITCHING');
    expect(blocked.valid).toBe(false);
    const allowed = validateFulfillmentTransition('NOT_READY', 'READY_FOR_DISPATCH', 'QC_APPROVED');
    expect(allowed.valid).toBe(true);
  });

  it('enforces role authorization per transition stage', () => {
    expect(isRoleAuthorizedForTransition('CUTTING', 'PRODUCTION', 'CUTTING')).toBe(true);
    expect(isRoleAuthorizedForTransition('CUTTING', 'PRODUCTION', 'QC_APPROVED')).toBe(false);
    expect(isRoleAuthorizedForTransition('QC', 'PRODUCTION', 'QC_APPROVED')).toBe(true);
    expect(isRoleAuthorizedForTransition('QC', 'PRODUCTION', 'REWORK')).toBe(true);
    expect(isRoleAuthorizedForTransition('DISPATCH', 'FULFILLMENT', 'DISPATCHED')).toBe(true);
    expect(isRoleAuthorizedForTransition('DISPATCH', 'PRODUCTION', 'QC_APPROVED')).toBe(false);
  });
});
