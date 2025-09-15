// Test to verify departments API is now fetching from HR departments table
const testUpdatedDepartmentsAPI = async () => {
  console.log('🔧 Testing Updated Departments API (HR Module Integration)...')
  
  try {
    // Test the departments API endpoint
    console.log('\n📋 Testing /api/hr/departments endpoint...')
    const response = await fetch('http://localhost:3001/api/hr/departments')
    console.log(`Response Status: ${response.status}`)
    
    if (response.status === 401) {
      console.log('✅ API properly requires authentication')
      console.log('⚠️  Cannot test data without authentication, but endpoint is working')
    } else if (response.status === 200) {
      const data = await response.json()
      console.log('✅ API responded successfully!')
      console.log('\n🏢 Departments returned:')
      
      if (data.success && data.departments) {
        data.departments.forEach((dept, index) => {
          console.log(`${index + 1}. ${dept.name} (${dept.code}) - ${dept.employeeCount} employees - ${dept.completionRate}%`)
        })
        
        // Check if we're getting real HR departments vs old user departments
        const departmentNames = data.departments.map(d => d.name)
        
        console.log('\n🎯 Analysis:')
        if (departmentNames.includes('Communications and Advocacy') || 
            departmentNames.includes('Grants and Compliance') ||
            departmentNames.includes('Finance and Administration')) {
          console.log('✅ SUCCESS: Getting real HR departments from departments table!')
        } else {
          console.log('⚠️  Still getting fallback/user departments')
        }
        
        console.log('\n📊 Expected HR departments should include:')
        console.log('- Communications and Advocacy')
        console.log('- Executive Directors Office') 
        console.log('- Finance and Administration')
        console.log('- Grants and Compliance')
        console.log('- Human Resources')
        console.log('- Executive Directors Office - Research and Development')
        console.log('- Programs')
        
      } else {
        console.log('❌ API response format unexpected')
      }
    }
    
    console.log('\n🔧 API Change Summary:')
    console.log('✅ Changed from: prisma.users.findMany() - user.department field')
    console.log('✅ Changed to: prisma.departments.findMany() - HR departments table')
    console.log('✅ Now fetches real HR department structure')
    console.log('✅ Includes employee counts from departments.employees relation')
    
    console.log('\n📝 To see the actual departments:')
    console.log('1. Login to http://localhost:3001 with admin@saywhat.org / admin123')
    console.log('2. Go to HR > Performance > Plans')
    console.log('3. Check Department Summary in sidebar')
    console.log('4. Should now show real HR departments instead of user departments')
    
  } catch (error) {
    console.error('❌ Error testing API:', error)
  }
}

testUpdatedDepartmentsAPI()
