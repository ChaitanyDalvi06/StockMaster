// Role-based permissions utility

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
};

// Check if user has any of the required roles
export const hasRole = (user, roles) => {
  if (!user || !user.role) return false;
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  return user.role === roles;
};

// Specific permission checks
export const canCreateProduct = (user) => {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
};

export const canEditProduct = (user) => {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
};

export const canDeleteProduct = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

export const canCreateReceipt = (user) => {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
};

export const canCreateDelivery = (user) => {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
};

export const canCreateTransfer = (user) => {
  return true; // All authenticated users
};

export const canCreateAdjustment = (user) => {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
};

export const canValidateOperations = (user) => {
  return hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);
};

export const canManageUsers = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

export const canViewDashboard = (user) => {
  return true; // All authenticated users
};

export const canViewProducts = (user) => {
  return true; // All authenticated users
};

export const canViewOperations = (user) => {
  return true; // All authenticated users
};

// Get role display information
export const getRoleInfo = (role) => {
  const roleInfo = {
    admin: {
      label: 'Admin',
      color: 'error',
      description: 'Full system access',
      icon: '👑',
    },
    manager: {
      label: 'Manager',
      color: 'primary',
      description: 'Manage inventory operations',
      icon: '👔',
    },
    staff: {
      label: 'Staff',
      color: 'success',
      description: 'Warehouse operations',
      icon: '👷',
    },
  };
  return roleInfo[role] || roleInfo.staff;
};

// Get permissions summary for a role
export const getRolePermissions = (role) => {
  const permissions = {
    admin: [
      'Create, edit, and delete products',
      'Create and validate all operations',
      'Manage users and roles',
      'View all reports and dashboards',
      'System settings access',
    ],
    manager: [
      'Create and edit products',
      'Create receipts and deliveries',
      'Validate operations',
      'Create stock adjustments',
      'View all reports and dashboards',
    ],
    staff: [
      'View products and stock levels',
      'Create internal transfers',
      'Perform picking and shelving',
      'View move history',
      'Assist with physical counts',
    ],
  };
  return permissions[role] || permissions.staff;
};

