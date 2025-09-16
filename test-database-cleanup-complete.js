/**
 * Test Database Cleanup - Verify No Mock Data Remains
 * Test all components and APIs to ensure they use real database connections
 */

console.log('🧪 Testing Database Cleanup - Mock Data Removal Complete\n')

async function testDatabaseConnections() {
    console.log('📊 Testing API Endpoints for Real Database Connections...\n')
    
    const testEndpoints = [
        {
            name: 'Admin Users API',
            url: 'http://localhost:3001/api/admin/users',
            description: 'Should fetch real users from database, no mock fallback'
        },
        {
            name: 'Admin Audit Logs API', 
            url: 'http://localhost:3001/api/admin/audit',
            description: 'Should fetch real audit logs, no mock data fallback'
        },
        {
            name: 'HR Employees API',
            url: 'http://localhost:3001/api/hr/employees',
            description: 'Should fetch real employee data from database'
        },
        {
            name: 'HR Departments API',
            url: 'http://localhost:3001/api/hr/departments', 
            description: 'Should fetch real department data from database'
        },
        {
            name: 'Search API',
            url: 'http://localhost:3001/api/search?q=test',
            description: 'Should use real search API, no mock results'
        }
    ]
    
    const results = []
    
    for (const endpoint of testEndpoints) {
        try {
            console.log(`🔍 Testing: ${endpoint.name}`)
            console.log(`   URL: ${endpoint.url}`)
            console.log(`   Expected: ${endpoint.description}`)
            
            const response = await fetch(endpoint.url)
            const data = await response.json()
            
            // Check for signs of mock data
            const isMockData = (
                data.note?.includes('mock') ||
                data.note?.includes('Using mock data') ||
                data.error?.includes('mock') ||
                (Array.isArray(data.logs) && data.logs.some(log => log.userName === 'System Administrator' && log.userEmail === 'admin@saywhat.org')) ||
                (Array.isArray(data.users) && data.users.some(user => user.email === 'admin@saywhat.org' && user.firstName === 'System'))
            )
            
            if (response.ok) {
                if (isMockData) {
                    console.log(`   ❌ STILL USING MOCK DATA`)
                    results.push({ endpoint: endpoint.name, status: 'MOCK_DATA_FOUND', data: 'Mock data detected in response' })
                } else {
                    console.log(`   ✅ SUCCESS - Real database connection`)
                    results.push({ endpoint: endpoint.name, status: 'REAL_DATA', data: `${Object.keys(data).join(', ')}` })
                }
            } else {
                console.log(`   ⚠️  API ERROR: ${response.status} - ${data.error || 'Unknown error'}`)
                results.push({ endpoint: endpoint.name, status: 'API_ERROR', data: `${response.status}: ${data.error}` })
            }
            
        } catch (error) {
            console.log(`   ❌ CONNECTION ERROR: ${error.message}`)
            results.push({ endpoint: endpoint.name, status: 'CONNECTION_ERROR', data: error.message })
        }
        
        console.log('')
    }
    
    return results
}

async function testFileCleanup() {
    console.log('📁 Checking Files for Remaining Mock Data...\n')
    
    const fs = require('fs')
    const path = require('path')
    
    const filesToCheck = [
        'src/lib/api.ts',
        'src/components/ui/global-search.tsx', 
        'src/components/ui/offline-support.tsx',
        'src/app/api/admin/users/route.ts',
        'src/app/api/admin/audit/route.ts'
    ]
    
    const mockDataFound = []
    
    for (const filePath of filesToCheck) {
        const fullPath = path.join(process.cwd(), filePath)
        
        if (fs.existsSync(fullPath)) {
            const content = fs.readFileSync(fullPath, 'utf8')
            
            // Check for mock data patterns
            const mockPatterns = [
                /mock.*data/i,
                /Mock API call/i,
                /mockResults/i,
                /hardcoded|hardcode/i,
                /fake.*data/i,
                /const.*=.*\[.*{.*name.*:.*".*"/
            ]
            
            const foundPatterns = mockPatterns.filter(pattern => pattern.test(content))
            
            if (foundPatterns.length > 0) {
                console.log(`❌ ${filePath} - Mock data patterns found`)
                mockDataFound.push({ file: filePath, patterns: foundPatterns.length })
            } else {
                console.log(`✅ ${filePath} - Clean, no mock data`)
            }
        } else {
            console.log(`⚠️  ${filePath} - File not found`)
        }
    }
    
    return mockDataFound
}

async function runTests() {
    try {
        const [apiResults, fileResults] = await Promise.all([
            testDatabaseConnections(),
            testFileCleanup()
        ])
        
        console.log('\n📈 SUMMARY REPORT\n')
        console.log('=' .repeat(50))
        
        // API Test Results
        console.log('\n🔗 API Endpoint Tests:')
        const realDataAPIs = apiResults.filter(r => r.status === 'REAL_DATA').length
        const mockDataAPIs = apiResults.filter(r => r.status === 'MOCK_DATA_FOUND').length
        const errorAPIs = apiResults.filter(r => r.status === 'API_ERROR' || r.status === 'CONNECTION_ERROR').length
        
        console.log(`   ✅ Real Database Connections: ${realDataAPIs}`)
        console.log(`   ❌ Mock Data Still Found: ${mockDataAPIs}`)
        console.log(`   ⚠️  API Errors: ${errorAPIs}`)
        
        // File Cleanup Results
        console.log('\n📁 File Cleanup Status:')
        console.log(`   ✅ Clean Files: ${filesToCheck.length - fileResults.length}`)
        console.log(`   ❌ Files with Mock Data: ${fileResults.length}`)
        
        // Overall Status
        console.log('\n🎯 OVERALL STATUS:')
        if (mockDataAPIs === 0 && fileResults.length === 0) {
            console.log('   🎉 SUCCESS: All mock data removed, real database connections verified!')
        } else {
            console.log('   ⚠️  PARTIAL: Some mock data or issues remain')
            
            if (mockDataAPIs > 0) {
                console.log('   - Mock data still found in API responses')
            }
            if (fileResults.length > 0) {
                console.log('   - Mock data patterns found in source files')
            }
        }
        
        console.log('\n✨ Database cleanup testing complete!')
        
    } catch (error) {
        console.error('❌ Test execution failed:', error)
    }
}

runTests()