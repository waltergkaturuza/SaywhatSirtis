import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/admin-auth'

// Mock API keys data
let apiKeys = [
  {
    id: '1',
    name: 'Mobile App API Key',
    key: 'sirtis_mobile_key_' + Math.random().toString(36).substring(2, 15),
    permissions: ['read', 'write'],
    lastUsed: new Date().toISOString(),
    createdAt: '2024-01-15',
    expiresAt: '2025-01-15',
    isActive: true,
    usage: {
      totalRequests: 15420,
      dailyRequests: 1250,
      rateLimitRemaining: 4750
    }
  },
  {
    id: '2',
    name: 'Web Dashboard API Key',
    key: 'sirtis_web_key_' + Math.random().toString(36).substring(2, 15),
    permissions: ['read', 'write', 'admin'],
    lastUsed: new Date(Date.now() - 3600000).toISOString(),
    createdAt: '2024-02-01',
    expiresAt: '2025-02-01',
    isActive: true,
    usage: {
      totalRequests: 8750,
      dailyRequests: 890,
      rateLimitRemaining: 5110
    }
  },
  {
    id: '3',
    name: 'Third Party Integration',
    key: 'sirtis_3rd_key_' + Math.random().toString(36).substring(2, 15),
    permissions: ['read'],
    lastUsed: new Date(Date.now() - 86400000).toISOString(),
    createdAt: '2024-03-10',
    expiresAt: '2025-03-10',
    isActive: false,
    usage: {
      totalRequests: 2340,
      dailyRequests: 45,
      rateLimitRemaining: 5955
    }
  }
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let filteredKeys = apiKeys

    if (status) {
      filteredKeys = filteredKeys.filter(key => 
        status === 'active' ? key.isActive : !key.isActive
      )
    }

    if (search) {
      filteredKeys = filteredKeys.filter(key =>
        key.name.toLowerCase().includes(search.toLowerCase()) ||
        key.key.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Mask API keys for security
    const maskedKeys = filteredKeys.map(key => ({
      ...key,
      key: key.key.substring(0, 12) + '...' + key.key.substring(key.key.length - 4)
    }))

    return NextResponse.json({
      success: true,
      data: {
        apiKeys: maskedKeys,
        total: filteredKeys.length,
        totalActive: apiKeys.filter(k => k.isActive).length,
        totalInactive: apiKeys.filter(k => !k.isActive).length,
        totalRequests: apiKeys.reduce((sum, k) => sum + k.usage.totalRequests, 0)
      }
    })

  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Failed to fetch API keys' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin permissions
    if (!hasAdminAccess(session)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { action, keyId, keyData } = body

    switch (action) {
      case 'create_key':
        const newKey = {
          id: (apiKeys.length + 1).toString(),
          name: keyData.name,
          key: `sirtis_${keyData.name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 15)}`,
          permissions: keyData.permissions || ['read'],
          lastUsed: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString().split('T')[0],
          expiresAt: new Date(Date.now() + (keyData.expiryDays || 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          isActive: true,
          usage: {
            totalRequests: 0,
            dailyRequests: 0,
            rateLimitRemaining: 6000
          }
        }
        
        apiKeys.push(newKey)
        
        return NextResponse.json({
          success: true,
          message: 'API key created successfully',
          data: newKey
        })

      case 'update_key':
        const keyIndex = apiKeys.findIndex(k => k.id === keyId)
        if (keyIndex === -1) {
          return NextResponse.json({ error: 'API key not found' }, { status: 404 })
        }
        
        apiKeys[keyIndex] = {
          ...apiKeys[keyIndex],
          ...keyData
        }
        
        return NextResponse.json({
          success: true,
          message: 'API key updated successfully',
          data: apiKeys[keyIndex]
        })

      case 'toggle_status':
        const keyToToggle = apiKeys.find(k => k.id === keyId)
        if (!keyToToggle) {
          return NextResponse.json({ error: 'API key not found' }, { status: 404 })
        }
        
        keyToToggle.isActive = !keyToToggle.isActive
        
        return NextResponse.json({
          success: true,
          message: `API key ${keyToToggle.isActive ? 'activated' : 'deactivated'} successfully`,
          data: keyToToggle
        })

      case 'regenerate_key':
        const keyToRegenerate = apiKeys.find(k => k.id === keyId)
        if (!keyToRegenerate) {
          return NextResponse.json({ error: 'API key not found' }, { status: 404 })
        }
        
        keyToRegenerate.key = `sirtis_${keyToRegenerate.name.toLowerCase().replace(/\s+/g, '_')}_${Math.random().toString(36).substring(2, 15)}`
        keyToRegenerate.lastUsed = new Date().toISOString().split('T')[0]
        keyToRegenerate.usage = {
          totalRequests: 0,
          dailyRequests: 0,
          rateLimitRemaining: 6000
        }
        
        return NextResponse.json({
          success: true,
          message: 'API key regenerated successfully',
          data: keyToRegenerate
        })

      case 'delete_key':
        const keyToDelete = apiKeys.find(k => k.id === keyId)
        if (!keyToDelete) {
          return NextResponse.json({ error: 'API key not found' }, { status: 404 })
        }
        
        apiKeys = apiKeys.filter(k => k.id !== keyId)
        
        return NextResponse.json({
          success: true,
          message: 'API key deleted successfully'
        })

      case 'test_key':
        const keyToTest = apiKeys.find(k => k.id === keyId)
        if (!keyToTest) {
          return NextResponse.json({ error: 'API key not found' }, { status: 404 })
        }
        
        if (!keyToTest.isActive) {
          return NextResponse.json({
            success: false,
            message: 'API key is inactive'
          })
        }
        
        return NextResponse.json({
          success: true,
          message: 'API key is valid and active',
          data: {
            permissions: keyToTest.permissions,
            rateLimitRemaining: keyToTest.usage.rateLimitRemaining,
            expiresAt: keyToTest.expiresAt
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error processing API key action:', error)
    return NextResponse.json(
      { error: 'Failed to process API key action' },
      { status: 500 }
    )
  }
}
