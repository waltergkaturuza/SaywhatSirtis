// Quick test for new Risk Management enhancements
console.log('🧪 Testing Risk Management Enhancements...\n');

async function testEndpoints() {
  const baseUrl = 'http://localhost:3002';
  
  try {
    // Test 1: Department List API
    console.log('1️⃣ Testing Department List API');
    const deptResponse = await fetch(`${baseUrl}/api/hr/department/list`);
    if (deptResponse.ok) {
      const deptData = await deptResponse.json();
      console.log('✅ Departments loaded:', deptData.data?.length || 0, 'departments');
      if (deptData.data?.length > 0) {
        console.log('   Sample:', deptData.data[0].name, `(${deptData.data[0].code})`);
      }
    } else {
      console.log('❌ Department API failed:', deptResponse.status);
    }

    // Test 2: Employees by Department API
    console.log('\n2️⃣ Testing Employees by Department API');
    const empResponse = await fetch(`${baseUrl}/api/hr/employees/by-department?department=IT`);
    if (empResponse.ok) {
      const empData = await empResponse.json();
      console.log('✅ Employees loaded:', empData.employees?.length || 0, 'employees in IT');
      if (empData.employees?.length > 0) {
        console.log('   Sample:', empData.employees[0].name, `(${empData.employees[0].position})`);
      }
    } else {
      console.log('❌ Employees API failed:', empResponse.status);
    }

  } catch (error) {
    console.log('❌ API test failed:', error.message);
  }
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  testEndpoints();
} else {
  console.log('Run this in browser console at http://localhost:3002');
}

console.log('\n📋 New Features Implemented:');
console.log('   ✅ Dynamic department fetching from backend');
console.log('   ✅ Backdrop blur for select dropdowns');
console.log('   ✅ Employee selection by department for Risk Owner');
console.log('   ✅ Enhanced UI with loading states');
console.log('   ✅ Professional styling with hover effects');
