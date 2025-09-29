// Production 502 Error Diagnostic Script
const { PrismaClient } = require('@prisma/client')

async function diagnoseProductionIssues() {
  console.log('🔍 SIRTIS Production 502 Error Diagnosis\n' + '='.repeat(60))
  
  const prisma = new PrismaClient()
  
  try {
    // 1. Test basic database connection
    console.log('1. Testing database connection...')
    try {
      await prisma.$connect()
      console.log('   ✅ Database connection successful')
    } catch (error) {
      console.log('   ❌ Database connection failed:', error.message)
      return
    }

    // 2. Check call_records table structure and recent data
    console.log('\n2. Checking call_records table...')
    try {
      const callCount = await prisma.call_records.count()
      console.log(`   ✅ call_records table accessible: ${callCount} records`)
      
      // Check recent records
      const recentCalls = await prisma.call_records.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          caseNumber: true,
          callNumber: true,
          callerName: true,
          status: true,
          assignedOfficer: true,
          createdAt: true
        }
      })
      
      console.log('   Recent call records:')
      recentCalls.forEach((call, i) => {
        console.log(`   ${i + 1}. Case: ${call.caseNumber}, Call: ${call.callNumber}, Status: ${call.status}`)
      })
      
    } catch (error) {
      console.log('   ❌ call_records table error:', error.message)
    }

    // 3. Test case number generation logic
    console.log('\n3. Testing case number generation...')
    try {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const year = new Date().getFullYear()
      
      // Check if any case numbers exist for today with new format
      const todayCases = await prisma.call_records.findMany({
        where: {
          caseNumber: {
            startsWith: `CASE-${year}-`
          }
        },
        select: { caseNumber: true, createdAt: true },
        orderBy: { caseNumber: 'desc' },
        take: 5
      })
      
      console.log(`   Found ${todayCases.length} cases with new format CASE-${year}-XXXXXXXX`)
      todayCases.forEach(c => console.log(`     ${c.caseNumber} (${c.createdAt.toISOString()})`))
      
    } catch (error) {
      console.log('   ❌ Case number check failed:', error.message)
    }

    // 4. Check for constraint violations or data integrity issues
    console.log('\n4. Checking data integrity...')
    try {
      // Check for duplicate case numbers (should be unique)
      const duplicates = await prisma.$queryRaw`
        SELECT "caseNumber", COUNT(*) as count
        FROM call_records 
        GROUP BY "caseNumber" 
        HAVING COUNT(*) > 1
        LIMIT 5
      `
      
      if (Array.isArray(duplicates) && duplicates.length > 0) {
        console.log('   ⚠️  Found duplicate case numbers:')
        duplicates.forEach((dup) => {
          console.log(`     ${dup.caseNumber}: ${dup.count} duplicates`)
        })
      } else {
        console.log('   ✅ No duplicate case numbers found')
      }
      
    } catch (error) {
      console.log('   ⚠️  Could not check for duplicates:', error.message)
    }

    // 5. Test API endpoint data transformations
    console.log('\n5. Testing API data transformations...')
    try {
      const sampleCall = await prisma.call_records.findFirst({
        where: { assignedOfficer: { not: null } }
      })
      
      if (sampleCall) {
        // Test the case transformation logic used in /api/call-centre/cases
        const caseTransform = {
          id: sampleCall.id,
          caseNumber: `CASE-${sampleCall.id.substring(0, 8)}`,
          callNumber: sampleCall.callNumber || sampleCall.id,
          clientName: sampleCall.callerName,
          status: (sampleCall.status || 'OPEN').toLowerCase().replace('_', '-')
        }
        console.log('   ✅ Case transformation test successful:')
        console.log(`     Original: ${sampleCall.caseNumber} -> Transformed: ${caseTransform.caseNumber}`)
      } else {
        console.log('   ⚠️  No assigned calls found for transformation test')
      }
      
    } catch (error) {
      console.log('   ❌ API transformation test failed:', error.message)
    }

    // 6. Check for potential field issues
    console.log('\n6. Checking field accessibility...')
    try {
      const fieldTest = await prisma.call_records.findFirst({
        select: {
          id: true,
          caseNumber: true,
          callNumber: true,
          callerName: true,
          callerPhone: true,
          callType: true,
          modeOfCommunication: true,
          purpose: true,
          isCase: true,
          clientName: true,
          assignedOfficer: true,
          status: true,
          priority: true,
          summary: true,
          notes: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      if (fieldTest) {
        console.log('   ✅ All critical fields accessible')
        console.log(`     Sample: ${fieldTest.caseNumber} - ${fieldTest.callerName}`)
      } else {
        console.log('   ⚠️  No records found for field test')
      }
      
    } catch (error) {
      console.log('   ❌ Field accessibility test failed:', error.message)
      console.log('       This might indicate schema issues or field name problems')
    }

    // 7. Check recent changes impact
    console.log('\n7. Checking recent systematic numbering impact...')
    try {
      const year = new Date().getFullYear()
      
      // Look for both old and new format case numbers
      const oldFormat = await prisma.call_records.count({
        where: {
          caseNumber: {
            not: {
              startsWith: `CASE-${year}-`
            }
          }
        }
      })
      
      const newFormat = await prisma.call_records.count({
        where: {
          caseNumber: {
            startsWith: `CASE-${year}-`
          }
        }
      })
      
      console.log(`   Old format case numbers: ${oldFormat}`)
      console.log(`   New format case numbers: ${newFormat}`)
      
      if (newFormat > 0) {
        console.log('   ✅ Systematic numbering is working')
      } else {
        console.log('   ⚠️  No new format case numbers found - may need to test creation')
      }
      
    } catch (error) {
      console.log('   ❌ Recent changes check failed:', error.message)
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 DIAGNOSIS SUMMARY:')
    console.log('✅ If all checks above passed, the issue might be:')
    console.log('   - Render.com deployment configuration issues')
    console.log('   - Memory/timeout issues under load')
    console.log('   - Environment variables not set correctly in production')
    console.log('   - Database connection pool exhaustion')
    console.log('   - Next.js build/runtime issues')
    
    console.log('\n🔧 RECOMMENDED ACTIONS:')
    console.log('   1. Check Render.com logs for more specific error details')
    console.log('   2. Verify DATABASE_URL and other env vars in production')
    console.log('   3. Check if the build completed successfully')
    console.log('   4. Monitor database connection pool usage')
    console.log('   5. Consider adding more error logging to API routes')

  } catch (error) {
    console.error('❌ Diagnostic script failed:', error.message)
    console.error('   This indicates a fundamental database or connection issue')
  } finally {
    await prisma.$disconnect()
  }
}

diagnoseProductionIssues().catch(console.error)