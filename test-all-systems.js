console.log("=== COMPREHENSIVE USER/EMPLOYEE SYSTEM TEST ===\n")

// Test 1: Admin Users API (should return 5 users with mixed roles)
console.log("1. Testing /api/admin/users")
fetch("http://localhost:3000/api/admin/users")
  .then(res => res.json())
  .then(data => {
    console.log(`    Admin Users: ${data.data?.users?.length || 0} users found`)
    if (data.data?.users?.length > 0) {
      const roles = data.data.users.map(u => u.role).join(", ")
      console.log(`    Roles: ${roles}`)
    }
  })
  .catch(err => console.log(`    Admin Users API failed: ${err.message}`))

// Test 2: Admin Dashboard API (should return correct stats)
console.log("\n2. Testing /api/admin/dashboard")
fetch("http://localhost:3000/api/admin/dashboard")
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log(`    Dashboard: ${data.data.stats.totalUsers} total users, ${data.data.stats.activeUsers} active`)
      console.log(`    Employees: ${data.data.stats.totalEmployees} total, ${data.data.stats.activeEmployees} active`)
    }
  })
  .catch(err => console.log(`    Dashboard API failed: ${err.message}`))

// Test 3: HR Employees API (requires auth - will fail in node but should work in browser)
console.log("\n3. Testing /api/hr/employees (requires authentication)")
fetch("http://localhost:3000/api/hr/employees")
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log(`    HR Employees: ${data.employees?.length || 0} employees found`)
    } else {
      console.log(`     HR Employees: ${data.error} (expected without auth)`)
    }
  })
  .catch(err => console.log(`    HR Employees API failed: ${err.message}`))

console.log("\n=== TEST COMPLETE ===")
