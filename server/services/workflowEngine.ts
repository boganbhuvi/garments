import { UserRole } from '../models/User';

export const VALID_PRODUCTION_TRANSITIONS: Record<string, string[]> = {
  AWAITING_CUTTING: ['CUTTING'],
  CUTTING: ['AWAITING_STITCHING'],
  AWAITING_STITCHING: ['STITCHING'],
  STITCHING: ['AWAITING_QC'],
  AWAITING_QC: ['QC_APPROVED', 'REWORK'],
  REWORK: ['CUTTING', 'STITCHING', 'AWAITING_CUTTING', 'AWAITING_STITCHING'],
  QC_APPROVED: [],
};

export const VALID_FULFILLMENT_TRANSITIONS: Record<string, string[]> = {
  NOT_READY: ['READY_FOR_PICKUP', 'READY_FOR_DISPATCH'],
  READY_FOR_PICKUP: ['DISPATCHED', 'DELIVERED'],
  READY_FOR_DISPATCH: ['DISPATCHED'],
  DISPATCHED: ['DELIVERED'],
  DELIVERED: [],
};

export function isRoleAuthorizedForTransition(
  role: UserRole,
  stage: 'ORDER' | 'PRODUCTION' | 'FULFILLMENT',
  targetStatus: string
): boolean {
  if (role === 'SUPER_ADMIN' || role === 'OWNER' || role === 'BRANCH_MANAGER') {
    return true;
  }
  if (stage === 'ORDER') {
    return role === 'FRONT_DESK';
  }
  if (stage === 'PRODUCTION') {
    if (['CUTTING', 'AWAITING_STITCHING'].includes(targetStatus)) return role === 'CUTTING';
    if (['STITCHING', 'AWAITING_QC'].includes(targetStatus)) return role === 'STITCHING';
    if (['QC_APPROVED', 'REWORK'].includes(targetStatus)) return role === 'QC';
  }
  if (stage === 'FULFILLMENT') {
    if (role === 'DISPATCH') return true;
    if (role === 'FRONT_DESK' && ['READY_FOR_PICKUP', 'DELIVERED'].includes(targetStatus)) return true;
  }
  return false;
}

export function validateProductionTransition(
  currentStatus: string,
  targetStatus: string,
  defectNote?: string
): { valid: boolean; error?: string } {
  const allowed = VALID_PRODUCTION_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Invalid production transition from '${currentStatus}' to '${targetStatus}'`,
    };
  }
  if (targetStatus === 'REWORK' && (!defectNote || !defectNote.trim())) {
    return {
      valid: false,
      error: 'A defect note is required when sending an item to REWORK',
    };
  }
  return { valid: true };
}

export function validateFulfillmentTransition(
  currentFulfillment: string,
  targetFulfillment: string,
  currentProduction: string
): { valid: boolean; error?: string } {
  if (currentProduction !== 'QC_APPROVED') {
    return {
      valid: false,
      error: 'Cannot dispatch or mark ready before QC_APPROVED',
    };
  }
  const allowed = VALID_FULFILLMENT_TRANSITIONS[currentFulfillment] || [];
  if (!allowed.includes(targetFulfillment)) {
    return {
      valid: false,
      error: `Invalid fulfillment transition from '${currentFulfillment}' to '${targetFulfillment}'`,
    };
  }
  return { valid: true };
}
