const fs = require('fs');
const path = require('path');

console.log('🔧 ENHANCED PROPERTY SCANNER - MISSING FIELD DETECTOR');
console.log('=' .repeat(70));

// Enhanced regex patterns to catch ALL property access patterns
function scanForMissingProperties(content, filePath) {
  const missingProps = new Set();
  
  // Pattern 1: Direct property access in JSX inputs
  const inputValuePattern = /value=\{(\w+)\.(\w+)\}/g;
  let match;
  while ((match = inputValuePattern.exec(content)) !== null) {
    missingProps.add(`${match[1]}.${match[2]}`);
  }
  
  // Pattern 2: onChange handlers
  const onChangePattern = /onChange=.*?"(\w+)",\s*(\w+),\s*"(\w+)"/g;
  while ((match = onChangePattern.exec(content)) !== null) {
    missingProps.add(`${match[1]}.${match[3]}`);
  }
  
  // Pattern 3: Map operations with property access
  const mapPattern = /(\w+)\.map\([^)]*(\w+)\s*=>[^}]*(\w+)\.(\w+)/g;
  while ((match = mapPattern.exec(content)) !== null) {
    missingProps.add(`${match[3]}.${match[4]}`);
  }
  
  // Pattern 4: Conditional property access
  const conditionalPattern = /(\w+)\.(\w+)\s*\?\s*/g;
  while ((match = conditionalPattern.exec(content)) !== null) {
    missingProps.add(`${match[1]}.${match[2]}`);
  }
  
  // Pattern 5: Destructuring in function parameters
  const destructuringPattern = /\{\s*([^}]+)\s*\}\s*=\s*(\w+)/g;
  while ((match = destructuringPattern.exec(content)) !== null) {
    const props = match[1].split(',').map(p => p.trim().split(':')[0].trim());
    props.forEach(prop => {
      if (prop && !prop.includes('...')) {
        missingProps.add(`${match[2]}.${prop}`);
      }
    });
  }
  
  return Array.from(missingProps);
}

// Scan the specific performance plans page for missing properties
const performancePlanPath = './src/app/hr/performance/plans/create/page.tsx';
console.log('🔍 Scanning performance plan page for missing properties...');

if (fs.existsSync(performancePlanPath)) {
  const content = fs.readFileSync(performancePlanPath, 'utf8');
  const missingProps = scanForMissingProperties(content, performancePlanPath);
  
  console.log('\\n📋 Found property usage patterns:');
  missingProps.forEach(prop => {
    console.log(`  - ${prop}`);
  });
  
  // Extract specific properties for each object type
  const kpiProps = missingProps.filter(prop => prop.startsWith('kpi.')).map(prop => prop.split('.')[1]);
  const goalProps = missingProps.filter(prop => prop.startsWith('goal.')).map(prop => prop.split('.')[1]);
  const formDataProps = missingProps.filter(prop => prop.startsWith('formData.')).map(prop => prop.split('.')[1]);
  
  console.log('\\n🎯 Properties by type:');
  if (kpiProps.length > 0) {
    console.log('KPI properties:', kpiProps);
  }
  if (goalProps.length > 0) {
    console.log('Goal properties:', goalProps);
  }
  if (formDataProps.length > 0) {
    console.log('FormData properties:', formDataProps);
  }
  
  // Check current KPI definition and add missing properties
  const typesPath = './src/components/hr/performance/performance-plan-types.ts';
  if (fs.existsSync(typesPath)) {
    let typesContent = fs.readFileSync(typesPath, 'utf8');
    
    // Check which KPI properties are missing from the current definition
    const missingKpiProps = [];
    kpiProps.forEach(prop => {
      if (!typesContent.includes(`${prop}:`)) {
        missingKpiProps.push(prop);
      }
    });
    
    if (missingKpiProps.length > 0) {
      console.log(`\\n⚠️  Missing KPI properties: ${missingKpiProps.join(', ')}`);
      
      // Add missing properties to KPI type definition
      const kpiTypeRegex = /(kpis: Array<{[^}]+)(}>\n)/;
      const currentKpiMatch = typesContent.match(kpiTypeRegex);
      
      if (currentKpiMatch) {
        let newProperties = '';
        missingKpiProps.forEach(prop => {
          newProperties += `    ${prop}: string\\n`;
        });
        
        const updatedKpiType = currentKpiMatch[1] + newProperties + '  ' + currentKpiMatch[2];
        typesContent = typesContent.replace(kpiTypeRegex, updatedKpiType);
        
        // Also update createNewKPI function
        const createKpiRegex = /(export const createNewKPI = \(\) => \({[^}]+)(}\))/;
        const createKpiMatch = typesContent.match(createKpiRegex);
        
        if (createKpiMatch) {
          let newDefaults = '';
          missingKpiProps.forEach(prop => {
            newDefaults += `  ${prop}: '',\\n`;
          });
          
          const updatedCreateKpi = createKpiMatch[1] + newDefaults + '  ' + createKpiMatch[2];
          typesContent = typesContent.replace(createKpiRegex, updatedCreateKpi);
        }
        
        fs.writeFileSync(typesPath, typesContent);
        console.log('✅ Updated KPI type definition with missing properties');
      }
    }
    
    // Check for missing Goal properties
    const missingGoalProps = [];
    goalProps.forEach(prop => {
      if (!typesContent.includes(`${prop}:`)) {
        missingGoalProps.push(prop);
      }
    });
    
    if (missingGoalProps.length > 0) {
      console.log(`\\n⚠️  Missing Goal properties: ${missingGoalProps.join(', ')}`);
      
      // Update goals type and createNewGoal function similarly
      const goalsTypeRegex = /(goals: Array<{[^}]+)(}>\n)/;
      const currentGoalsMatch = typesContent.match(goalsTypeRegex);
      
      if (currentGoalsMatch) {
        let newProperties = '';
        missingGoalProps.forEach(prop => {
          newProperties += `    ${prop}: string\\n`;
        });
        
        const updatedGoalsType = currentGoalsMatch[1] + newProperties + '  ' + currentGoalsMatch[2];
        typesContent = typesContent.replace(goalsTypeRegex, updatedGoalsType);
        
        // Update createNewGoal function
        const createGoalRegex = /(export const createNewGoal = \(\): Goal => \({[^}]+)(}\))/;
        const createGoalMatch = typesContent.match(createGoalRegex);
        
        if (createGoalMatch) {
          let newDefaults = '';
          missingGoalProps.forEach(prop => {
            newDefaults += `  ${prop}: '',\\n`;
          });
          
          const updatedCreateGoal = createGoalMatch[1] + newDefaults + '  ' + createGoalMatch[2];
          typesContent = typesContent.replace(createGoalRegex, updatedCreateGoal);
        }
        
        fs.writeFileSync(typesPath, typesContent);
        console.log('✅ Updated Goal type definition with missing properties');
      }
    }
  }
} else {
  console.log('❌ Performance plan page not found');
}

console.log('\\n🎯 ENHANCED PROPERTY SCAN COMPLETE!');
console.log('=' .repeat(70));
