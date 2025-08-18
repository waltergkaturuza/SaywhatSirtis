'use client'

import React from 'react'

// Simplified components for build compatibility
export function RealTimeStatusIndicator({ className }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
      <span className="text-sm text-gray-600">Real-time features loading...</span>
    </div>
  )
}

export function LiveNotifications({ className }: { className?: string }) {
  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="font-medium mb-2">Live Notifications</h3>
      <p className="text-sm text-gray-600">No notifications</p>
    </div>
  )
}

export function UserPresenceIndicator({ roomId, className }: { roomId?: string; className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
        <span className="text-xs">0</span>
      </div>
      <span className="text-sm text-gray-600">Users online</span>
    </div>
  )
}

export function LiveActivityFeed({ className }: { className?: string }) {
  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="font-medium mb-2">Live Activity</h3>
      <p className="text-sm text-gray-600">No recent activity</p>
    </div>
  )
}

export function CollaborativeEditing({ documentId, className }: { documentId?: string; className?: string }) {
  return (
    <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
      <h3 className="font-medium mb-2">Collaborative Editing</h3>
      <textarea 
        className="w-full h-32 p-2 border rounded"
        placeholder="Collaborative editing not yet available..."
        disabled
      />
    </div>
  )
}
