import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const staticPath = path.join(process.cwd(), '.next', 'static')
    const publicPath = path.join(process.cwd(), 'public')
    
    const staticExists = fs.existsSync(staticPath)
    const publicExists = fs.existsSync(publicPath)
    
    let staticFiles = []
    let publicFiles = []
    
    if (staticExists) {
      try {
        const cssPath = path.join(staticPath, 'css')
        if (fs.existsSync(cssPath)) {
          staticFiles = fs.readdirSync(cssPath).filter(f => f.endsWith('.css'))
        }
      } catch (error) {
        staticFiles = [`Error reading CSS: ${error.message}`]
      }
    }
    
    if (publicExists) {
      try {
        publicFiles = fs.readdirSync(publicPath).slice(0, 5) // First 5 files
      } catch (error) {
        publicFiles = [`Error reading public: ${error.message}`]
      }
    }
    
    const debug = {
      timestamp: new Date().toISOString(),
      cwd: process.cwd(),
      nodeEnv: process.env.NODE_ENV,
      staticPath,
      publicPath,
      staticExists,
      publicExists,
      staticFiles,
      publicFiles,
      isProduction: process.env.NODE_ENV === 'production',
      headers: Object.fromEntries(request.headers.entries())
    }
    
    return NextResponse.json(debug, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { 
      status: 500 
    })
  }
}