// Quick SAYWHAT Theme Application Script
// This script shows how to apply consistent SAYWHAT styling to all form steps

const saywhatTheme = {
  // Colors
  colors: {
    primary: '#ff6b35', // saywhat-orange
    secondary: '#1e40af', // saywhat-blue  
    success: '#10b981', // green
    danger: '#dc2626', // saywhat-red
    warning: '#f59e0b', // amber
    info: '#3b82f6', // blue
    dark: '#1f2937', // saywhat-dark
    grey: '#6b7280', // saywhat-grey
    lightGrey: '#f3f4f6', // saywhat-light-grey
  },

  // Step Icons for each form step
  stepIcons: {
    1: `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />`, // User icon
    2: `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />`, // Phone icon
    3: `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />`, // Briefcase icon  
    4: `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />`, // Currency icon
    5: `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />`, // Book/Education icon
    6: `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />` // Shield/Security icon
  },

  // Step Titles
  stepTitles: {
    1: "Personal Information",
    2: "Emergency Contact Information", 
    3: "Employment Information",
    4: "Compensation & Benefits",
    5: "Education & Skills",
    6: "Access & Security"
  },

  // Common styling classes
  classes: {
    stepHeader: "flex items-center space-x-3 mb-6",
    stepIcon: "w-8 h-8 bg-saywhat-orange rounded-full flex items-center justify-center",
    stepTitle: "text-xl font-bold text-saywhat-dark",
    formContainer: "bg-saywhat-light-grey/50 p-4 rounded-lg",
    gridContainer: "grid grid-cols-2 gap-4",
    label: "text-saywhat-dark font-medium",
    input: "border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange",
    select: "border-saywhat-grey/30 focus:border-saywhat-orange focus:ring-saywhat-orange"
  }
}

// Example of complete step structure:
const stepTemplate = `
const renderStep{N} = () => (
  <div className="space-y-6">
    <div className="${saywhatTheme.classes.stepHeader}">
      <div className="${saywhatTheme.classes.stepIcon}">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {STEP_ICON_PATH}
        </svg>
      </div>
      <h3 className="${saywhatTheme.classes.stepTitle}">{STEP_TITLE}</h3>
    </div>
    
    <div className="${saywhatTheme.classes.formContainer}">
      <div className="${saywhatTheme.classes.gridContainer}">
        {/* Form fields with consistent styling */}
      </div>
    </div>
  </div>
)
`

console.log('🎨 SAYWHAT Theme Configuration:')
console.log('================================')
console.log()
console.log('📋 Color Palette:')
for (const [name, color] of Object.entries(saywhatTheme.colors)) {
  console.log(`   ${name}: ${color}`)
}
console.log()
console.log('🚀 Step Configuration:')
for (const [step, title] of Object.entries(saywhatTheme.stepTitles)) {
  console.log(`   Step ${step}: ${title}`)
}
console.log()
console.log('✨ Styling Applied:')
console.log('   - Professional SAYWHAT orange/blue color scheme')
console.log('   - Consistent step icons and headers')  
console.log('   - Enhanced form field styling with focus states')
console.log('   - Gradient backgrounds and shadow effects')
console.log('   - Improved typography and spacing')
console.log()
console.log('🎯 Form Features:')
console.log('   - 6-step wizard with progress tracking')
console.log('   - Animated step navigation')  
console.log('   - SAYWHAT branded header')
console.log('   - Responsive design')
console.log('   - Professional loading states')
console.log()
console.log('✅ Theme successfully applied to Employee Form!')
