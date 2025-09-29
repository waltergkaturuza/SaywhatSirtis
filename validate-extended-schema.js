// Extended schema validation for all critical models
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

async function validateAllModels() {
  console.log('SIRTIS Extended Schema Validation\n' + '='.repeat(70));
  
  const prisma = new PrismaClient()
  
  try {
    // Read schema content
    const schemaContent = fs.readFileSync('./prisma/schema.prisma', 'utf8')
    
    // Define expected fields for critical models
    const expectedModels = {
      users: {
        'id': 'String @id',
        'name': 'String?',
        'email': 'String? @unique',
        'emailVerified': 'DateTime?',
        'image': 'String?',
        'role': 'String @default("user")',
        'permissions': 'String[]',
        'isActive': 'Boolean @default(true)',
        'createdAt': 'DateTime @default(now())',
        'updatedAt': 'DateTime'
      },
      
      employees: {
        'id': 'String @id',
        'name': 'String',
        'email': 'String @unique',
        'phone': 'String?',
        'position': 'String',
        'department': 'String',
        'employeeId': 'String @unique',
        'status': 'String @default("active")',
        'hireDate': 'DateTime',
        'createdAt': 'DateTime @default(now())',
        'updatedAt': 'DateTime'
      },
      
      departments: {
        'id': 'String @id',
        'name': 'String @unique',
        'description': 'String?',
        'budget': 'Float?',
        'createdAt': 'DateTime @default(now())',
        'updatedAt': 'DateTime'
      },
      
      documents: {
        'id': 'String @id',
        'title': 'String',
        'fileName': 'String',
        'filePath': 'String',
        'fileSize': 'Int',
        'mimeType': 'String',
        'department': 'String',
        'category': 'String',
        'uploadedBy': 'String',
        'createdAt': 'DateTime @default(now())',
        'updatedAt': 'DateTime'
      }
    }
    
    // Function to extract and analyze model fields
    function analyzeModel(modelName, expectedFields) {
      console.log(`\n📋 Analyzing ${modelName} model...`);
      
      const modelRegex = new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\}`, 'i');
      const modelMatch = schemaContent.match(modelRegex);
      
      if (!modelMatch) {
        console.log(`❌ ${modelName} model not found in schema`);
        return { missing: true, fields: [] };
      }
      
      const modelContent = modelMatch[1];
      const existingFields = {};
      
      // Parse existing fields
      const fieldLines = modelContent.split('\n').filter(line => 
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
      
      // Compare with expected fields
      const missingFields = [];
      const validFields = [];
      const extraFields = [];
      
      Object.entries(expectedFields).forEach(([fieldName, expectedType]) => {
        if (!(fieldName in existingFields)) {
          missingFields.push({ field: fieldName, expectedType });
        } else {
          validFields.push({ field: fieldName, type: existingFields[fieldName] });
        }
      });
      
      Object.entries(existingFields).forEach(([fieldName, fieldType]) => {
        if (!(fieldName in expectedFields)) {
          extraFields.push({ field: fieldName, type: fieldType });
        }
      });
      
      console.log(`   Found: ${Object.keys(existingFields).length} fields`);
      console.log(`   Valid: ${validFields.length}`);
      console.log(`   Missing: ${missingFields.length}`);
      console.log(`   Extra: ${extraFields.length}`);
      
      if (missingFields.length > 0) {
        console.log('   ❌ Missing fields:');
        missingFields.forEach(({ field, expectedType }) => {
          console.log(`      ${field}: ${expectedType}`);
        });
      }
      
      if (extraFields.length > 0) {
        console.log('   ℹ️  Extra fields:');
        extraFields.slice(0, 5).forEach(({ field, type }) => {
          console.log(`      ${field}: ${type}`);
        });
        if (extraFields.length > 5) {
          console.log(`      ... and ${extraFields.length - 5} more`);
        }
      }
      
      return {
        missing: false,
        fieldsCount: Object.keys(existingFields).length,
        missingFields,
        validFields,
        extraFields
      };
    }
    
    // Analyze all models
    const results = {};
    for (const [modelName, expectedFields] of Object.entries(expectedModels)) {
      results[modelName] = analyzeModel(modelName, expectedFields);
    }
    
    // Overall summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 OVERALL SCHEMA VALIDATION SUMMARY:');
    
    let totalModelsFound = 0;
    let totalMissingFields = 0;
    let criticalIssues = [];
    
    Object.entries(results).forEach(([modelName, result]) => {
      if (!result.missing) {
        totalModelsFound++;
        totalMissingFields += result.missingFields.length;
        
        if (result.missingFields.length > 0) {
          criticalIssues.push(`${modelName}: ${result.missingFields.length} missing fields`);
        }
      } else {
        criticalIssues.push(`${modelName}: Model not found`);
      }
    });
    
    console.log(`✅ Models found: ${totalModelsFound}/${Object.keys(expectedModels).length}`);
    console.log(`❌ Total missing fields: ${totalMissingFields}`);
    
    if (criticalIssues.length === 0) {
      console.log('\n🎉 ALL MODELS ARE PROPERLY CONFIGURED!');
    } else {
      console.log('\n⚠️  CRITICAL ISSUES FOUND:');
      criticalIssues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    // Test database connectivity for each model
    console.log('\n🔌 Testing database connectivity...');
    
    try {
      const callCount = await prisma.call_records.count();
      console.log(`✅ call_records: ${callCount} records`);
    } catch (e) {
      console.log(`❌ call_records: Error - ${e.message}`);
    }
    
    try {
      const userCount = await prisma.users ? await prisma.users.count() : 0;
      console.log(`✅ users: ${userCount} records`);
    } catch (e) {
      console.log(`❌ users: Error - ${e.message}`);
    }
    
    try {
      const employeeCount = await prisma.employees ? await prisma.employees.count() : await prisma.employee.count();
      console.log(`✅ employees: ${employeeCount} records`);
    } catch (e) {
      console.log(`❌ employees: Error - ${e.message}`);
    }
    
    try {
      const deptCount = await prisma.departments ? await prisma.departments.count() : await prisma.department.count();
      console.log(`✅ departments: ${deptCount} records`);
    } catch (e) {
      console.log(`❌ departments: Error - ${e.message}`);
    }
    
    // Check for potential schema improvements
    console.log('\n💡 RECOMMENDATIONS:');
    if (totalMissingFields === 0) {
      console.log('   - Schema is complete! No immediate changes needed.');
      console.log('   - Consider adding indexes for performance if not already present.');
      console.log('   - Ensure all foreign key relationships are properly defined.');
    } else {
      console.log('   - Add missing fields to ensure full functionality.');
      console.log('   - Run: npx prisma db push after schema updates.');
      console.log('   - Test all affected features after schema changes.');
    }
    
  } catch (error) {
    console.error('❌ Extended Validation Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

validateAllModels().catch(console.error);