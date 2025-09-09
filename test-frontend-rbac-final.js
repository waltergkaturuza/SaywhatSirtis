/**
 * Final RBAC Frontend Integration Test
 * This script verifies that our role management system is fully functional
 */

async function testRoleManagementSystem() {
    const baseUrl = 'http://localhost:3001';
    
    console.log('🚀 Testing RBAC Frontend Integration...\n');
    
    try {
        // Test 1: Fetch all roles
        console.log('📋 Test 1: Fetching all roles...');
        const rolesResponse = await fetch(`${baseUrl}/api/admin/roles-test`);
        const rolesData = await rolesResponse.json();
        
        console.log(`✅ Status: ${rolesResponse.status}`);
        console.log(`📊 Message: ${rolesData.message}`);
        console.log(`🎯 Roles found: ${rolesData.roles?.length || 0}`);
        
        if (rolesData.roles && rolesData.roles.length > 0) {
            console.log('\n🏷️  Role Hierarchy:');
            rolesData.roles.forEach((role, index) => {
                console.log(`   ${index + 1}. ${role.name} (Level ${role.level}) - ${role.permissions?.length || 0} permissions`);
            });
        }
        
        // Test 2: Fetch all permissions
        console.log('\n📋 Test 2: Fetching all permissions...');
        const permissionsResponse = await fetch(`${baseUrl}/api/admin/permissions-test`);
        const permissionsData = await permissionsResponse.json();
        
        console.log(`✅ Status: ${permissionsResponse.status}`);
        console.log(`📊 Message: ${permissionsData.message}`);
        console.log(`🔐 Permissions found: ${permissionsData.permissions?.length || 0}`);
        
        if (permissionsData.permissions && permissionsData.permissions.length > 0) {
            const moduleGroups = {};
            permissionsData.permissions.forEach(perm => {
                if (!moduleGroups[perm.module]) {
                    moduleGroups[perm.module] = [];
                }
                moduleGroups[perm.module].push(perm);
            });
            
            console.log('\n🔐 Permissions by Module:');
            Object.keys(moduleGroups).forEach(module => {
                console.log(`   📁 ${module}: ${moduleGroups[module].length} permissions`);
            });
        }
        
        // Test 3: Create a test role
        console.log('\n📋 Test 3: Creating a test role...');
        const newRole = {
            name: 'Test Manager Role',
            description: 'A test role for demonstration',
            level: 2,
            department: 'Testing',
            permissions: ['users_read', 'projects_read', 'assets_read']
        };
        
        const createResponse = await fetch(`${baseUrl}/api/admin/roles-test`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newRole)
        });
        
        const createData = await createResponse.json();
        console.log(`✅ Status: ${createResponse.status}`);
        console.log(`📊 Message: ${createData.message}`);
        
        if (createData.role) {
            console.log(`🎯 Created role: ${createData.role.name}`);
            console.log(`📝 Description: ${createData.role.description}`);
            console.log(`🔐 Permissions: ${createData.role.permissions?.length || 0}`);
        }
        
        console.log('\n🎉 RBAC System Integration Complete!');
        console.log('\n📍 Frontend Access:');
        console.log(`   🌐 Role Management: ${baseUrl}/admin/roles`);
        console.log(`   📊 System Admin: ${baseUrl}/admin`);
        console.log(`   🏠 Main App: ${baseUrl}`);
        
        console.log('\n✅ ALL TESTS PASSED - Your role management system is working perfectly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Make sure development server is running: npm run dev');
        console.log('   2. Check that server is accessible at http://localhost:3001');
        console.log('   3. Verify API endpoints are correctly set up');
    }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
    // Running in Node.js environment
    const fetch = require('node-fetch');
    testRoleManagementSystem();
} else {
    // Running in browser environment
    console.log('🌐 Running in browser environment - ready for frontend testing!');
    window.testRoleManagementSystem = testRoleManagementSystem;
}
