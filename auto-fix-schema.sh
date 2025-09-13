# Auto-fix script for common issues
# Run these commands to fix the most common problems:

# 1. Fix model naming issues
find src -name "*.ts" -exec sed -i 's/prisma.user./prisma.users./g' {} +
find src -name "*.ts" -exec sed -i 's/prisma.qualification./prisma.qualifications./g' {} +
find src -name "*.ts" -exec sed -i 's/prisma.document./prisma.documents./g' {} +
find src -name "*.ts" -exec sed -i 's/prisma.callRecord./prisma.call_records./g' {} +
find src -name "*.ts" -exec sed -i 's/prisma.performancePlan./prisma.performance_plans./g' {} +
find src -name "*.ts" -exec sed -i 's/prisma.auditLog./prisma.audit_logs./g' {} +
find src -name "*.ts" -exec sed -i 's/employee.employeeId/employee.id/g' {} +
find src -name "*.ts" -exec sed -i 's/departmentRef/department/g' {} +

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