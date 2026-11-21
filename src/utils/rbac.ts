import { AppModule } from '../context/OrderContext';

export const ROLE_ALLOWED_MODULES: Record<string, AppModule[]> = {
  SUPER_ADMIN: [
    'OVERVIEW', 'CUSTOMERS', 'ORDERS', 'FRONT_DESK',
    'CUTTING_DEPT', 'STITCHING_DEPT', 'QC_DEPT', 'DISPATCH_DEPT',
    'INVENTORY', 'TAILORS', 'BRANCHES', 'ACCOUNTS', 'REPORTS', 'ACTIVITY_LOGS', 'SETTINGS',
  ],
  OWNER: [
    'OVERVIEW', 'CUSTOMERS', 'ORDERS', 'FRONT_DESK',
    'CUTTING_DEPT', 'STITCHING_DEPT', 'QC_DEPT', 'DISPATCH_DEPT',
    'INVENTORY', 'TAILORS', 'BRANCHES', 'ACCOUNTS', 'REPORTS', 'ACTIVITY_LOGS', 'SETTINGS',
  ],
  BRANCH_MANAGER: [
    'OVERVIEW', 'CUSTOMERS', 'ORDERS', 'FRONT_DESK',
    'CUTTING_DEPT', 'STITCHING_DEPT', 'QC_DEPT', 'DISPATCH_DEPT',
    'INVENTORY', 'TAILORS', 'ACCOUNTS', 'REPORTS', 'ACTIVITY_LOGS',
  ],
  FRONT_DESK: ['CUSTOMERS', 'ORDERS', 'FRONT_DESK', 'DISPATCH_DEPT'],
  CUTTING: ['CUTTING_DEPT'],
  STITCHING: ['STITCHING_DEPT'],
  QC: ['QC_DEPT'],
  DISPATCH: ['DISPATCH_DEPT'],
  ACCOUNTS: ['ACCOUNTS', 'ORDERS', 'REPORTS'],
  INVENTORY: ['INVENTORY'],
};

export function getDefaultModuleForRole(role?: string): AppModule {
  switch (role) {
    case 'CUTTING': return 'CUTTING_DEPT';
    case 'STITCHING': return 'STITCHING_DEPT';
    case 'QC': return 'QC_DEPT';
    case 'DISPATCH': return 'DISPATCH_DEPT';
    case 'ACCOUNTS': return 'ACCOUNTS';
    case 'INVENTORY': return 'INVENTORY';
    case 'FRONT_DESK': return 'ORDERS';
    default: return 'OVERVIEW';
  }
}

export function isModuleAllowedForRole(role: string | undefined, mod: AppModule): boolean {
  if (!role) return false;
  const list = ROLE_ALLOWED_MODULES[role];
  if (!list) return false;
  return list.includes(mod);
}
