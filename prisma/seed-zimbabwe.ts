import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Zimbabwe-specific payroll data...')

  // Create allowance types common in Zimbabwe
  const allowanceTypes = [
    { name: 'Transport Allowance', description: 'Monthly transport allowance', defaultAmount: 50.00 },
    { name: 'Lunch Allowance', description: 'Daily lunch allowance', defaultAmount: 5.00 },
    { name: 'Housing Allowance', description: 'Monthly housing allowance', defaultAmount: 200.00 },
    { name: 'Medical Allowance', description: 'Monthly medical allowance', defaultAmount: 30.00 },
    { name: 'Education Allowance', description: 'Education assistance allowance', defaultAmount: 100.00 },
    { name: 'Communication Allowance', description: 'Mobile phone and internet allowance', defaultAmount: 25.00 },
    { name: 'Performance Bonus', description: 'Monthly performance bonus', defaultAmount: 150.00 },
    { name: 'Overtime Pay', description: 'Overtime compensation', defaultAmount: 0.00 },
  ]

  for (const allowanceType of allowanceTypes) {
    await prisma.allowanceType.upsert({
      where: { name: allowanceType.name },
      update: allowanceType,
      create: allowanceType,
    })
  }

  // Create deduction types common in Zimbabwe
  const deductionTypes = [
    { name: 'Salary Advance', description: 'Salary advance deduction', defaultAmount: 0.00 },
    { name: 'Uniform Deduction', description: 'Uniform cost deduction', defaultAmount: 15.00 },
    { name: 'Loan Repayment', description: 'Staff loan repayment', defaultAmount: 0.00 },
    { name: 'Union Dues', description: 'Trade union membership fees', defaultAmount: 2.00 },
    { name: 'Late Coming Fine', description: 'Late coming penalty', defaultAmount: 5.00 },
    { name: 'Disciplinary Fine', description: 'Disciplinary action fine', defaultAmount: 0.00 },
    { name: 'Canteen Deduction', description: 'Canteen food deduction', defaultAmount: 20.00 },
    { name: 'Medical Aid', description: 'Medical insurance contribution', defaultAmount: 25.00 },
  ]

  for (const deductionType of deductionTypes) {
    await prisma.deductionType.upsert({
      where: { name: deductionType.name },
      update: deductionType,
      create: deductionType,
    })
  }

  // Create Zimbabwe tax brackets (PAYE 2024)
  const taxBrackets = [
    { name: 'Tax Free', minIncome: 0, maxIncome: 300, rate: 0.00, flatAmount: 0 },
    { name: 'Basic Rate', minIncome: 300, maxIncome: 900, rate: 0.15, flatAmount: 0 },
    { name: 'Standard Rate', minIncome: 900, maxIncome: 1500, rate: 0.25, flatAmount: 90 },
    { name: 'Higher Rate', minIncome: 1500, maxIncome: null, rate: 0.35, flatAmount: 240 },
  ]

  for (const bracket of taxBrackets) {
    await prisma.taxBracket.create({
      data: {
        name: bracket.name,
        minIncome: bracket.minIncome,
        maxIncome: bracket.maxIncome,
        rate: bracket.rate,
        flatAmount: bracket.flatAmount,
      },
    })
  }

  // Create payroll settings for Zimbabwe
  const payrollSettings = [
    { setting: 'NSSA_RATE', value: '0.035' }, // 3.5% NSSA contribution
    { setting: 'NSSA_MAX_MONTHLY', value: '35' }, // Maximum $35 per month
    { setting: 'HEALTH_INSURANCE', value: '15' }, // Fixed health insurance
    { setting: 'CURRENCY', value: 'USD' },
    { setting: 'COUNTRY', value: 'Zimbabwe' },
    { setting: 'WORKING_DAYS_PER_MONTH', value: '22' },
    { setting: 'OVERTIME_MULTIPLIER', value: '1.5' },
    { setting: 'PUBLIC_HOLIDAYS_MULTIPLIER', value: '2.0' },
  ]

  for (const setting of payrollSettings) {
    await prisma.payrollSettings.upsert({
      where: { setting: setting.setting },
      update: { value: setting.value },
      create: setting,
    })
  }

  // Create sample departments
  const departments = [
    { name: 'Administration', description: 'Administrative department' },
    { name: 'Finance', description: 'Finance and accounting' },
    { name: 'Human Resources', description: 'Human resources management' },
    { name: 'Information Technology', description: 'IT and systems' },
    { name: 'Operations', description: 'Operations and logistics' },
    { name: 'Marketing', description: 'Marketing and sales' },
    { name: 'Customer Service', description: 'Customer service and support' },
    { name: 'Research & Development', description: 'Research and development' },
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: dept,
      create: dept,
    })
  }

  console.log('Zimbabwe payroll data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
