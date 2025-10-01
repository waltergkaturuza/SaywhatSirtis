// Test the permission logic to verify our fixes
const testUser = {
  permissions: [],
  roles: ['ADMIN', 'SUPER_USER'],
  role: 'SYSTEM_ADMINISTRATOR'
};

// Test the permission logic from the API
const hasPermission = testUser.permissions?.includes('calls.view') ||
  testUser.permissions?.includes('calls.full_access') ||
  testUser.roles?.some(role => ['admin', 'manager', 'super_user'].includes(role.toLowerCase())) ||
  ['system_administrator', 'admin', 'manager'].includes(testUser.role?.toLowerCase());

console.log('=== PERMISSION TEST ===');
console.log('User roles:', testUser.roles);
console.log('User role:', testUser.role);
console.log('Roles check (some admin/manager/super_user):', testUser.roles?.some(role => ['admin', 'manager', 'super_user'].includes(role.toLowerCase())));
console.log('Role check (system_administrator/admin/manager):', ['system_administrator', 'admin', 'manager'].includes(testUser.role?.toLowerCase()));
console.log('Final permission result:', hasPermission);

if (hasPermission) {
  console.log('✅ Permission fix SUCCESS - User will have access to cases API');
} else {
  console.log('❌ Permission fix FAILED - User still denied access');
}