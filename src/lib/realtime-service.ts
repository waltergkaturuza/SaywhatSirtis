import React from 'react'

export interface RealTimeConfig {
  enabled: boolean
  serverUrl: string
  reconnectAttempts: number
  reconnectDelay: number
}

export const defaultRealTimeConfig: RealTimeConfig = {
  enabled: false,
  serverUrl: 'http://localhost:3001',
  reconnectAttempts: 5,
  reconnectDelay: 1000
}

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  return React.createElement('div', null, children)
}

export function useRealTime() {
  return {
    socket: null,
    isConnected: false,
    config: defaultRealTimeConfig,
    emit: () => {},
    on: () => {},
    off: () => {},
    subscribe: () => () => {},
    connectionStatus: 'disconnected'
  }
}

export function useRealTimeNotifications() {
  return {
    notifications: [],
    markAsRead: () => {}
  }
}

export function useUserPresence(userId: string) {
  return {
    onlineUsers: []
  }
}

export function useLiveActivity() {
  return []
}
