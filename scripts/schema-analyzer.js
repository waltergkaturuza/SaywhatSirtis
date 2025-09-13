const fs = require('fs');
const path = require('path');

// Schema analysis script to find model/field mismatches
class SchemaAnalyzer {
  constructor() {
    this.prismaModels = new Map();
    this.issues = [];
    this.apiRoutes = [];
  }

  // Parse Prisma schema to extract models and their fields
  parsePrismaSchema() {
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract models
    const modelMatches = schemaContent.match(/model\s+(\w+)\s*{([^}]+)}/g);
    
    if (modelMatches) {
      modelMatches.forEach(match => {
        const modelNameMatch = match.match(/model\s+(\w+)\s*{/);
        const modelName = modelNameMatch[1];
        
        // Extract fields
        const fieldsContent = match.match(/{([^}]+)}/)[1];
        const fields = [];
        const relations = [];
        
        const fieldLines = fieldsContent.split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('@@') && !line.startsWith('//'));
        
        fieldLines.forEach(line => {
          const fieldMatch = line.match(/^(\w+)\s+/);
          if (fieldMatch) {
            const fieldName = fieldMatch[1];
            
            // Check if it's a relation
            if (line.includes('@relation') || this.isRelationType(line)) {
              relations.push(fieldName);
            } else {
              fields.push(fieldName);
            }
          }
        });
        
        this.prismaModels.set(modelName, {
          fields: fields,
          relations: relations,
          allProperties: [...fields, ...relations]
        });
      });
    }
    
    console.log(`📊 Found ${this.prismaModels.size} models in Prisma schema`);
  }

  isRelationType(line) {
    // Check if the type is another model (starts with uppercase)
    const typeMatch = line.match(/^\w+\s+(\w+)/);
    if (typeMatch) {
      const type = typeMatch[1].replace(/[\[\]?]/g, ''); // Remove array/optional markers
      return this.prismaModels.has(type) || /^[A-Z]/.test(type);
    }
    return false;
  }

  // Scan API routes for Prisma usage
  scanApiRoutes() {
    const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
    this.scanDirectory(apiDir);
    console.log(`🔍 Scanned ${this.apiRoutes.length} API route files`);
  }

  scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir);
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (entry.endsWith('.ts') || entry.endsWith('.js')) {
        this.analyzeApiFile(fullPath);
      }
    });
  }

  analyzeApiFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.apiRoutes.push(relativePath);
      
      // Find prisma model references
      const prismaMatches = content.match(/prisma\.(\w+)\./g);
      if (prismaMatches) {
        prismaMatches.forEach(match => {
          const modelName = match.replace('prisma.', '').replace('.', '');
          this.checkModelReference(relativePath, modelName, content);
        });
      }
      
      // Find field access patterns
      const fieldMatches = content.match(/\w+\.(\w+)/g);
      if (fieldMatches) {
        fieldMatches.forEach(match => {
          const fieldName = match.split('.')[1];
          this.checkFieldUsage(relativePath, fieldName, content);
        });
      }
      
    } catch (error) {
      console.warn(`⚠️  Error reading ${filePath}: ${error.message}`);
    }
  }

  checkModelReference(filePath, modelName, content) {
    // Check if model exists in schema
    if (!this.prismaModels.has(modelName)) {
      // Check for common naming patterns
      const possibleNames = [
        modelName + 's', // singular -> plural
        modelName.slice(0, -1), // plural -> singular
        this.toSnakeCase(modelName), // camelCase -> snake_case
        this.toCamelCase(modelName) // snake_case -> camelCase
      ];
      
      const suggestions = possibleNames.filter(name => this.prismaModels.has(name));
      
      this.issues.push({
        type: 'MODEL_NOT_FOUND',
        file: filePath,
        issue: `Model '${modelName}' not found in schema`,
        suggestions: suggestions.length > 0 ? suggestions : ['Check Prisma schema for correct model name'],
        line: this.findLineNumber(content, `prisma.${modelName}`)
      });
    }
  }

  checkFieldUsage(filePath, fieldName, content) {
    // This is a simplified check - in a real implementation, 
    // we'd need to track variable types more carefully
    const commonIssueFields = [
      'employeeId', 'departmentRef', 'qualification', 'user', 
      'employeeName', 'developmentActivities', 'updatedAt'
    ];
    
    if (commonIssueFields.includes(fieldName)) {
      this.issues.push({
        type: 'SUSPICIOUS_FIELD',
        file: filePath,
        issue: `Potentially problematic field: '${fieldName}'`,
        suggestions: this.getFieldSuggestions(fieldName),
        line: this.findLineNumber(content, fieldName)
      });
    }
  }

  getFieldSuggestions(fieldName) {
    const suggestions = {
      'employeeId': ['Check if should use employee relation instead'],
      'departmentRef': ['Use department string field or departments relation'],
      'qualification': ['Should be qualifications (plural)'],
      'user': ['Should be users (plural)'],
      'employeeName': ['Use firstName/lastName from user relation'],
      'developmentActivities': ['Check if this relation exists in schema'],
      'updatedAt': ['Check if model has updatedAt field']
    };
    
    return suggestions[fieldName] || ['Check schema for correct field name'];
  }

  toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  }

  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }

  findLineNumber(content, searchTerm) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchTerm)) {
        return i + 1;
      }
    }
    return null;
  }

  // Generate comprehensive report
  generateReport() {
    console.log('\n🔍 SCHEMA ANALYSIS REPORT\n');
    console.log('=' * 50);
    
    console.log('\n📋 AVAILABLE MODELS:');
    Array.from(this.prismaModels.keys()).sort().forEach(model => {
      console.log(`  ✓ ${model}`);
    });
    
    console.log(`\n🚨 FOUND ${this.issues.length} POTENTIAL ISSUES:\n`);
    
    const groupedIssues = this.groupIssuesByType();
    
    Object.keys(groupedIssues).forEach(type => {
      console.log(`\n📌 ${type.replace('_', ' ')}:`);
      groupedIssues[type].forEach(issue => {
        console.log(`  ❌ ${issue.file}:${issue.line || '?'}`);
        console.log(`     ${issue.issue}`);
        console.log(`     💡 Suggestions: ${issue.suggestions.join(', ')}`);
      });
    });
    
    this.generateFixScript();
  }

  groupIssuesByType() {
    const grouped = {};
    this.issues.forEach(issue => {
      if (!grouped[issue.type]) {
        grouped[issue.type] = [];
      }
      grouped[issue.type].push(issue);
    });
    return grouped;
  }

  generateFixScript() {
    console.log('\n🔧 GENERATING AUTO-FIX SUGGESTIONS:\n');
    
    const fixes = {
      'prisma.user.': 'prisma.users.',
      'prisma.qualification.': 'prisma.qualifications.',
      'prisma.document.': 'prisma.documents.',
      'prisma.callRecord.': 'prisma.call_records.',
      'prisma.performancePlan.': 'prisma.performance_plans.',
      'prisma.auditLog.': 'prisma.audit_logs.',
      'employee.employeeId': 'employee.id',
      'departmentRef': 'department',
    };

    const fixScript = `
# Auto-fix script for common issues
# Run these commands to fix the most common problems:

# 1. Fix model naming issues
${Object.keys(fixes).map(from => 
  `find src -name "*.ts" -exec sed -i 's/${from}/${fixes[from]}/g' {} +`
).join('\n')}

# 2. Add missing imports where needed
grep -r "randomUUID" src --include="*.ts" | grep -v "import.*randomUUID" | cut -d: -f1 | sort -u | while read file; do
  if ! grep -q "import.*randomUUID" "$file"; then
    sed -i '1i import { randomUUID } from "crypto";' "$file"
  fi
done

# 3. Add missing ID fields to audit_logs.create calls
find src -name "*.ts" -exec grep -l "audit_logs.create" {} + | while read file; do
  if ! grep -A 5 "audit_logs.create" "$file" | grep -q "id: randomUUID"; then
    echo "⚠️  File needs manual ID field addition: $file"
  fi
done
    `.trim();

    console.log(fixScript);
    
    // Write fix script to file
    fs.writeFileSync('auto-fix-schema.sh', fixScript);
    console.log('\n✅ Auto-fix script saved to: auto-fix-schema.sh');
  }

  run() {
    console.log('🚀 Starting comprehensive schema analysis...\n');
    this.parsePrismaSchema();
    this.scanApiRoutes();
    this.generateReport();
    console.log('\n✅ Analysis complete!');
  }
}

// Run the analyzer
const analyzer = new SchemaAnalyzer();
analyzer.run();
