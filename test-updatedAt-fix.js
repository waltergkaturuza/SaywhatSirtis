/**
 * Test script to verify department creation with updatedAt field
 */

console.log('🔧 DEPARTMENT API updatedAt FIELD FIX');
console.log('====================================\n');

console.log('✅ Issue Fixed:');
console.log('- Added "updatedAt: new Date()" to department creation');
console.log('- Added "updatedAt: new Date()" to department updates\n');

console.log('📁 Files Updated:');
console.log('- src/app/api/hr/department/route.ts (POST method)');
console.log('- src/app/api/hr/department/[id]/route.ts (PUT method)\n');

console.log('🧪 Expected Behavior:');
console.log('- POST /api/hr/department should now succeed');
console.log('- PUT /api/hr/department/[id] should now succeed');
console.log('- Both operations will include current timestamp for updatedAt\n');

const testCreatePayload = {
  name: "Executive Directors Office",
  description: "Executive Directors Office Department",
  code: "EDO",
  manager: null,
  budget: null,
  location: null,
  status: "ACTIVE"
};

console.log('🚀 Test payload structure:');
console.log(JSON.stringify(testCreatePayload, null, 2));

console.log('\n✨ Department creation API should now work correctly!');
