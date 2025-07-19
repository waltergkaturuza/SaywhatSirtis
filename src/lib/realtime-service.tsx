'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

// Real-time Event Types
export interface RealTimeEvents {
  'user:join': { userId: string; roomId: string; timestamp: Date }
  'user:leave': { userId: string; roomId: string; timestamp: Date }
  'document:update': { documentId: string; changes: any; userId: string; timestamp: Date }
  'task:update': { taskId: string; status: string; assignee: string; timestamp: Date }
  'notification:new': { type: string; message: string; userId: string; timestamp: Date }
  'dashboard:update': { data: any; timestamp: Date }
  'dashboard:request': { type: string; message: string; userId: string; timestamp: Date }
  'project:status': { projectId: string; status: string; progress: number; timestamp: Date }
  'chat:message': { roomId: string; message: string; senderId: string; timestamp: Date }
}

// Real-time Configuration
export interface RealTimeConfig {
  serverUrl: string
  autoConnect: boolean
  enableLogging: boolean
  reconnectionAttempts: number
  reconnectionDelay: number
}

// Real-time Context
interface RealTimeContextType {
  socket: Socket | null
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  emit: <K extends keyof RealTimeEvents>(event: K, data: RealTimeEvents[K]) => void
  subscribe: <K extends keyof RealTimeEvents>(
    event: K, 
    callback: (data: RealTimeEvents[K]) => void
  ) => () => void
  onlineUsers: { userId: string; status: 'online' | 'away' | 'busy' }[]
}

const RealTimeContext = createContext<RealTimeContextType | null>(null)

// Real-time Provider Component
export function RealTimeProvider({ 
  children, 
  config,
  userId 
}: { 
  children: ReactNode
  config: RealTimeConfig
  userId?: string 
}) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState<{ userId: string; status: 'online' | 'away' | 'busy' }[]>([])

  useEffect(() => {
    if (!config.autoConnect) return

    const socketInstance = io(config.serverUrl, {
      autoConnect: config.autoConnect,
      auth: {
        userId: userId
      }
    })

    setSocket(socketInstance)
    setConnectionStatus('connecting')

    // Connection event handlers
    socketInstance.on('connect', () => {
      setIsConnected(true)
      setConnectionStatus('connected')
      if (config.enableLogging) {
        console.log('✅ Real-time connection established')
      }
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
      if (config.enableLogging) {
        console.log('❌ Real-time connection lost')
      }
    })

    socketInstance.on('connect_error', (error) => {
      setConnectionStatus('error')
      if (config.enableLogging) {
        console.error('🔥 Real-time connection error:', error)
      }
    })

    // User presence handlers
    socketInstance.on('users:online', (users) => {
      setOnlineUsers(users)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [config, userId])

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('room:join', { roomId, userId })
      if (config.enableLogging) {
        console.log(`📍 Joined room: ${roomId}`)
      }
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('room:leave', { roomId, userId })
      if (config.enableLogging) {
        console.log(`📤 Left room: ${roomId}`)
      }
    }
  }

  const emit = <K extends keyof RealTimeEvents>(event: K, data: RealTimeEvents[K]) => {
    if (socket && isConnected) {
      socket.emit(event, data)
      if (config.enableLogging) {
        console.log(`📡 Emitted event: ${String(event)}`, data)
      }
    }
  }

  const subscribe = <K extends keyof RealTimeEvents>(
    event: K, 
    callback: (data: RealTimeEvents[K]) => void
  ) => {
    if (socket) {
      socket.on(event as string, callback)
      if (config.enableLogging) {
        console.log(`👂 Subscribed to event: ${String(event)}`)
      }
      
      return () => {
        socket.off(event as string, callback)
      }
    }
    
    return () => {}
  }

  const value: RealTimeContextType = {
    socket,
    isConnected,
    connectionStatus,
    joinRoom,
    leaveRoom,
    emit,
    subscribe,
    onlineUsers
  }

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  )
}

// Hook to use real-time features
export const useRealTime = () => {
  const context = useContext(RealTimeContext)
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider')
  }
  return context
}

// Custom hooks for specific real-time features
export const useRealTimeDocument = (documentId: string) => {
  const { subscribe, emit } = useRealTime()
  const [collaborators, setCollaborators] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const unsubscribe = subscribe('document:update', (data) => {
      if (data.documentId === documentId) {
        setLastUpdate(data.timestamp)
        // Handle document changes
      }
    })

    return unsubscribe
  }, [documentId, subscribe])

  const updateDocument = (changes: any) => {
    emit('document:update', {
      documentId,
      changes,
      userId: 'current-user', // Get from auth context
      timestamp: new Date()
    })
  }

  return { collaborators, lastUpdate, updateDocument }
}

export const useRealTimeNotifications = () => {
  const { subscribe } = useRealTime()
  const [notifications, setNotifications] = useState<RealTimeEvents['notification:new'][]>([])

  useEffect(() => {
    const unsubscribe = subscribe('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
    })

    return unsubscribe
  }, [subscribe])

  const clearNotifications = () => setNotifications([])
  const markAsRead = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }

  return { notifications, clearNotifications, markAsRead }
}

export const useRealTimeDashboard = () => {
  const { subscribe, emit } = useRealTime()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const unsubscribe = subscribe('dashboard:update', (data) => {
      setDashboardData(data.data)
      setLastUpdate(data.timestamp)
    })

    // Request initial data
    emit('dashboard:request', {
      type: 'initial',
      message: 'Request dashboard data',
      userId: 'current-user',
      timestamp: new Date()
    })

    return unsubscribe
  }, [subscribe, emit])

  return { dashboardData, lastUpdate }
}

export const useUserPresence = (roomId?: string) => {
  const { onlineUsers, joinRoom, leaveRoom } = useRealTime()

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId)
      return () => leaveRoom(roomId)
    }
  }, [roomId, joinRoom, leaveRoom])

  return { onlineUsers }
}

// Default configuration
export const defaultRealTimeConfig: RealTimeConfig = {
  serverUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001',
  autoConnect: true,
  enableLogging: process.env.NODE_ENV === 'development',
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
}
