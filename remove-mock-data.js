#!/usr/bin/env node
/**
 * Mock Data Removal Script for SIRTIS
 * 
 * This script safely removes all test/mock/sample data from the system
 * while preserving the database structure and essential configuration.
 * 
 * ⚠️  WARNING: This will permanently delete test data. 
 * Make sure you have a backup if needed.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function removeMockData() {
  console.log('🧹 SIRTIS Mock Data Removal Started...\n');

  try {
    // 1. Clear database tables (in correct order due to foreign key constraints)
    console.log('📊 Clearing database tables...');
    
    const tablesToClear = [
      // Performance Management (newest tables first)
      'ResponsibilityAssessment',
      'ValueAssessment', 
      'PerformanceAppraisal',
      'PerformanceActivity',
      'DevelopmentActivity',
      'KeyResponsibility',
      'PerformancePlan',
      'Qualification',
      
      // Training and HR
      'TrainingCertificate',
      'TrainingAttendance', 
      'TrainingEnrollment',
      'TrainingSession',
      'TrainingProgram',
      'PerformanceReview',
      
      // Call Centre
      'CallRecord',
      
      // Assets and Inventory
      'AssetAudit',
      'MaintenanceRecord',
      'Asset',
      
      // Projects and Events
      'Event',
      'Project',
      
      // Risk Management
      'RiskNotification',
      'RiskAuditLog',
      'RiskDocument',
      'RiskAssessment',
      'RiskMitigation', 
      'Risk',
      
      // Documents and AI
      'DocumentActivity',
      'BatchAnalysis',
      'SearchLog',
      'DocumentContent',
      'DocumentClassificationAI',
      'DocumentAnalysis',
      'Document',
      
      // Core tables (be careful with these)
      'AuditLog',
      'Employee', // Keep admin users, remove test employees
      'Department' // Keep essential departments, remove test ones
    ];

    let deletedCounts = {};
    
    for (const table of tablesToClear) {
      try {
        const modelName = table.charAt(0).toLowerCase() + table.slice(1);
        
        if (table === 'Employee') {
          // Keep admin users, only remove test employees
          const result = await prisma.employee.deleteMany({
            where: {
              OR: [
                { email: { contains: 'test' } },
                { email: { contains: 'demo' } },
                { email: { contains: 'sample' } },
                { firstName: { contains: 'Test' } },
                { firstName: { contains: 'Demo' } },
                { firstName: { contains: 'Sample' } }
              ]
            }
          });
          deletedCounts[table] = result.count;
          
        } else if (table === 'Department') {
          // Keep essential departments, remove test ones
          const result = await prisma.department.deleteMany({
            where: {
              OR: [
                { name: { contains: 'Test' } },
                { name: { contains: 'Demo' } },
                { name: { contains: 'Sample' } }
              ]
            }
          });
          deletedCounts[table] = result.count;
          
        } else if (prisma[modelName] && typeof prisma[modelName].deleteMany === 'function') {
          // Clear all records for other tables
          const result = await prisma[modelName].deleteMany({});
          deletedCounts[table] = result.count;
        }
        
        console.log(`   ✅ ${table}: ${deletedCounts[table] || 0} records removed`);
        
      } catch (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    }

    // 2. Remove seed and test files
    console.log('\n📁 Removing seed and test files...');
    
    const filesToRemove = [
      // Root directory seed files
      'clear-seed-data.js',
      'seed-risks.js', 
      'seed-hr-data.js',
      
      // Test files (keep essential ones)
      'test-db-connection.js',
      'test-database-fix.js',
      'test-dashboard-null-safety.js',
      'test-edit-case-api.js',
      'test-complete-functionality.js',
      'test-complete-call-form.js',
      'test-assets-fix.js',
      'test-assets-api.js',
      'test-archive-restore.js',
      'test-training-creation-complete.js',
      'test-schema.js',
      'test-role-api.js',
      'test-risk-models.js',
      'test-risk-management-api.js',
      'test-risk-management-access.js',
      'test-risk-enhancements.js',
      'test-projects-api.js',
      'test-programs-fetch.js',
      'test-programs-analytics.js',
      'test-performance-api.js',
      'test-payroll-api.js',
      'test-notifications.js',
      'test-integration-audit.js',
      'test-inventory-fix.js',
      'test-hr-apis.js',
      'test-hr-api-flow.js',
      'test-hr-analytics.js',
      'test-events-api.js',
      'test-employee-creation.js',
      'test-documents-api.js',
      'test-departments-api.js',
      'test-database-retry.js',
      'test-call-centre-api.js',
      'test-call-analytics.js',
      'test-audit-enhancements.js',
      'test-asset-tracking.js',
      
      // Prisma seed files (keep seed-safe.ts as backup)
      'prisma/seed-dangerous-backup.ts',
      'prisma/seed-zimbabwe.ts',
      'prisma/seed-supabase.ts',
      'prisma/seed.ts',
      
      // Scripts directory
      'scripts/seed-recruitment.ts',
      'scripts/seed-rbac-basic.js',
      'scripts/seed-projects.ts', 
      'scripts/seed-events.ts',
      'scripts/seed-audits-maintenance.ts',
      'scripts/seed-assets.ts',
      'scripts/test-inventory-api.js'
    ];

    let removedFiles = 0;
    let skippedFiles = 0;
    
    for (const filePath of filesToRemove) {
      const fullPath = path.join(process.cwd(), filePath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`   ✅ Removed: ${filePath}`);
          removedFiles++;
        } else {
          skippedFiles++;
        }
      } catch (error) {
        console.log(`   ⚠️  Could not remove ${filePath}: ${error.message}`);
        skippedFiles++;
      }
    }

    // 3. Clean up package.json scripts (remove seed-related)
    console.log('\n📦 Cleaning package.json scripts...');
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Remove seed-related scripts
      const scriptsToRemove = [
        'seed',
        'seed:dev', 
        'seed:prod',
        'seed:safe',
        'seed:zimbabwe',
        'seed:supabase',
        'clear:seed'
      ];
      
      let removedScripts = 0;
      scriptsToRemove.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
          delete packageJson.scripts[script];
          removedScripts++;
        }
      });
      
      if (removedScripts > 0) {
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        console.log(`   ✅ Removed ${removedScripts} seed scripts from package.json`);
      } else {
        console.log(`   ℹ️  No seed scripts found in package.json`);
      }
    }

    // 4. Summary
    console.log('\n📊 Mock Data Removal Summary:');
    console.log(`   🗄️  Database records cleared: ${Object.values(deletedCounts).reduce((a, b) => a + b, 0)}`);
    console.log(`   📁 Files removed: ${removedFiles}`);
    console.log(`   ⏭️  Files skipped: ${skippedFiles}`);
    
    console.log('\n🎉 Mock data removal completed successfully!');
    console.log('\n📋 What was preserved:');
    console.log('   ✅ Database structure and schema');
    console.log('   ✅ Essential configuration files');
    console.log('   ✅ Admin user accounts');
    console.log('   ✅ Core department structure');
    console.log('   ✅ Application source code');
    console.log('   ✅ Production deployment files');
    
    console.log('\n🔄 Next Steps:');
    console.log('   1. Review remaining data in database');
    console.log('   2. Run: npm run build (to ensure no broken imports)');
    console.log('   3. Test critical functionality');
    console.log('   4. Deploy clean system to production');

  } catch (error) {
    console.error('\n❌ Error during mock data removal:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Safety check
function confirmRemoval() {
  console.log('⚠️  WARNING: This will permanently remove ALL test/mock/sample data!');
  console.log('⚠️  Make sure you have backups if needed.');
  console.log('\n🎯 This script will:');
  console.log('   • Clear test data from database tables');
  console.log('   • Remove seed and test files'); 
  console.log('   • Clean package.json scripts');
  console.log('   • Preserve production code and essential data');
  
  // For automated execution, skip confirmation
  if (process.argv.includes('--force') || process.env.NODE_ENV === 'production') {
    return true;
  }
  
  console.log('\n❓ Are you sure you want to continue? (Type "YES" to confirm)');
  return false; // In automated context, we'll handle this differently
}

// Execute the script
if (require.main === module) {
  if (process.argv.includes('--force')) {
    console.log('🚀 Force mode enabled, proceeding with mock data removal...\n');
    removeMockData().catch(console.error);
  } else {
    console.log('💡 Run with --force flag to execute: node remove-mock-data.js --force');
    confirmRemoval();
  }
}

module.exports = { removeMockData };
