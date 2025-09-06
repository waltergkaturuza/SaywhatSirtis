// Debug Environment Variables
console.log('🔍 Environment Variables Debug:')
console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('DIRECT_URL:', process.env.DIRECT_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)

// Export debug info
export const debugEnv = {
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  nodeEnv: process.env.NODE_ENV,
  nextAuthUrl: process.env.NEXTAUTH_URL
}
