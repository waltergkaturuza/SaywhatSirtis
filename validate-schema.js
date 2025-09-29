// Schema validation script to check all fields and data types
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

async function validateSchema() {
  console.log('SIRTIS Database Schema Validation\n' + '='.repeat(60));
  
  const prisma = new PrismaClient()
  
  try {
    // Read the schema file
    const schemaPath = './prisma/schema.prisma'
    const schemaContent = fs.readFileSync(schemaPath, 'utf8')
    
    // Expected fields from the call centre API
    const expectedCallRecordFields = {
      // Primary fields
      'id': 'String @id',
      'caseNumber': 'String @unique',
      'callNumber': 'String?',
      'officerName': 'String?',
      
      // Caller Information
      'callerName': 'String',
      'callerPhone': 'String?',
      'callerEmail': 'String?',
      'callerAge': 'String?',
      'callerGender': 'String?',
      'callerKeyPopulation': 'String?',
      'callerProvince': 'String?',
      'callerAddress': 'String?',
      
      // Call Details
      'callType': 'String?',
      'modeOfCommunication': 'String?',
      'howDidYouHearAboutUs': 'String?',
      'callValidity': 'String?',
      'newOrRepeatCall': 'String?',
      'language': 'String?',
      'callDescription': 'String?',
      'purpose': 'String?',
      'isCase': 'String?',
      
      // Client Information
      'clientName': 'String?',
      'clientAge': 'String?',
      'clientSex': 'String?',
      'clientAddress': 'String?',
      'clientProvince': 'String?',
      
      // Additional Information
      'perpetrator': 'String?',
      'servicesRecommended': 'String?',
      'referral': 'String?',
      'voucherIssued': 'String?',
      'voucherValue': 'String?',
      'comment': 'String?',
      
      // System Fields
      'category': 'String?',
      'priority': 'String?',
      'status': 'String?',
      'subject': 'String',
      'description': 'String?',
      'assignedOfficer': 'String?',
      'summary': 'String?',
      'notes': 'String?',
      'resolution': 'String?',
      'satisfactionRating': 'Int?',
      'callStartTime': 'DateTime?',
      'callEndTime': 'DateTime?',
      'resolvedAt': 'DateTime?',
      'district': 'String?',
      'ward': 'String?',
      'followUpRequired': 'Boolean',
      'followUpDate': 'DateTime?',
      'createdAt': 'DateTime',
      'updatedAt': 'DateTime'
    }
    
    // Extract call_records model from schema
    const callRecordsMatch = schemaContent.match(/model call_records \{([\s\S]*?)\}/);
    
    if (!callRecordsMatch) {
      console.log('❌ call_records model not found in schema');
      return;
    }
    
    const callRecordsModel = callRecordsMatch[1];
    console.log('📋 Analyzing call_records model...\n');
    
    // Parse existing fields from schema
    const existingFields = {};
    const fieldLines = callRecordsModel.split('\n').filter(line => 
      line.trim() && 
      !line.trim().startsWith('//') && 
      !line.trim().startsWith('@@') &&
      line.includes(' ')
    );
    
    fieldLines.forEach(line => {
      const trimmed = line.trim();
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const fieldName = parts[0];
        const fieldType = parts.slice(1).join(' ');
        existingFields[fieldName] = fieldType;
      }
    });
    
    console.log(`Found ${Object.keys(existingFields).length} existing fields in call_records model\n`);
    
    // Check for missing fields
    const missingFields = [];
    const mismatchedTypes = [];
    const validFields = [];
    
    Object.entries(expectedCallRecordFields).forEach(([fieldName, expectedType]) => {
      if (!(fieldName in existingFields)) {
        missingFields.push({ field: fieldName, expectedType });
      } else {
        const existingType = existingFields[fieldName];
        // Normalize types for comparison
        const normalizedExpected = expectedType.replace('@default(now())', '').replace('@default', '').trim();
        const normalizedExisting = existingType.replace('@default(now())', '').replace('@default', '').trim();
        
        if (normalizedExisting.startsWith(normalizedExpected) || normalizedExpected.startsWith(normalizedExisting.split(' ')[0])) {
          validFields.push({ field: fieldName, type: existingType });
        } else {
          mismatchedTypes.push({ 
            field: fieldName, 
            expected: expectedType, 
            actual: existingType 
          });
        }
      }
    });
    
    // Check for extra fields in schema
    const extraFields = [];
    Object.entries(existingFields).forEach(([fieldName, fieldType]) => {
      if (!(fieldName in expectedCallRecordFields)) {
        extraFields.push({ field: fieldName, type: fieldType });
      }
    });
    
    // Display results
    console.log('✅ VALID FIELDS:');
    if (validFields.length > 0) {
      validFields.forEach(({ field, type }) => {
        console.log(`   ${field}: ${type}`);
      });
    } else {
      console.log('   None');
    }
    
    console.log('\n❌ MISSING FIELDS:');
    if (missingFields.length > 0) {
      missingFields.forEach(({ field, expectedType }) => {
        console.log(`   ${field}: ${expectedType}`);
      });
    } else {
      console.log('   None - All expected fields present! ✅');
    }
    
    console.log('\n⚠️  TYPE MISMATCHES:');
    if (mismatchedTypes.length > 0) {
      mismatchedTypes.forEach(({ field, expected, actual }) => {
        console.log(`   ${field}:`);
        console.log(`     Expected: ${expected}`);
        console.log(`     Actual:   ${actual}`);
      });
    } else {
      console.log('   None - All field types correct! ✅');
    }
    
    console.log('\nℹ️  EXTRA FIELDS IN SCHEMA:');
    if (extraFields.length > 0) {
      extraFields.forEach(({ field, type }) => {
        console.log(`   ${field}: ${type}`);
      });
    } else {
      console.log('   None');
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION SUMMARY:');
    console.log(`✅ Valid fields: ${validFields.length}`);
    console.log(`❌ Missing fields: ${missingFields.length}`);
    console.log(`⚠️  Type mismatches: ${mismatchedTypes.length}`);
    console.log(`ℹ️  Extra fields: ${extraFields.length}`);
    
    if (missingFields.length === 0 && mismatchedTypes.length === 0) {
      console.log('\n🎉 SCHEMA IS COMPLETE! All required fields present with correct types.');
    } else {
      console.log('\n🔧 SCHEMA NEEDS UPDATES:');
      if (missingFields.length > 0) {
        console.log(`   - Add ${missingFields.length} missing fields`);
      }
      if (mismatchedTypes.length > 0) {
        console.log(`   - Fix ${mismatchedTypes.length} type mismatches`);
      }
    }
    
    // Check other important models
    console.log('\n' + '='.repeat(60));
    console.log('🔍 CHECKING OTHER MODELS...\n');
    
    // Check if User model exists and has required fields
    const userModelMatch = schemaContent.match(/model [Uu]ser[s]? \{([\s\S]*?)\}/);
    if (userModelMatch) {
      console.log('✅ User model found');
    } else {
      console.log('❌ User model not found - may cause authentication issues');
    }
    
    // Check if Employee model exists  
    const employeeModelMatch = schemaContent.match(/model [Ee]mployee[s]? \{([\s\S]*?)\}/);
    if (employeeModelMatch) {
      console.log('✅ Employee model found');
    } else {
      console.log('❌ Employee model not found - may cause HR issues');
    }
    
    // Check if Department model exists
    const departmentModelMatch = schemaContent.match(/model [Dd]epartment[s]? \{([\s\S]*?)\}/);
    if (departmentModelMatch) {
      console.log('✅ Department model found');
    } else {
      console.log('❌ Department model not found - may cause organizational issues');
    }
    
    // Test database connection
    console.log('\n🔌 Testing database connection...');
    const callCount = await prisma.call_records.count();
    console.log(`✅ Database connected - ${callCount} call records found`);
    
  } catch (error) {
    console.error('❌ Validation Error:', error.message);
    
    if (error.message.includes('Unknown arg')) {
      console.log('\n💡 This might be a Prisma schema parsing error.');
      console.log('   Consider running: npx prisma generate');
    }
    
    if (error.message.includes('does not exist')) {
      console.log('\n💡 Database table might not exist.');
      console.log('   Consider running: npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

validateSchema().catch(console.error);