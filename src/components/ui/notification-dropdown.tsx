'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { BellIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export function NotificationDropdown() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchNotifications = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=10')
      if (response.ok) {
        const data = await response.json()
        const notifs = data.data?.notifications || []
        setNotifications(notifs)
        setUnreadCount(notifs.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      intervalRef.current = setInterval(fetchNotifications, 30000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [session?.user?.id])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      })
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      })
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors">
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2.5 w-96 origin-top-right rounded-md bg-white dark:bg-gray-800 py-2 shadow-lg ring-1 ring-gray-900/5 dark:ring-gray-700 focus:outline-none">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                  {({ active }) => (
                    <div
                      className={cn(
                        'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                        !notification.isRead && 'bg-blue-50/50 dark:bg-blue-900/10',
                        active && 'bg-gray-50 dark:bg-gray-700/50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {notification.actionUrl ? (
                            <Link
                              href={notification.actionUrl}
                              onClick={() => markAsRead(notification.id)}
                              className="block"
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {formatTime(notification.createdAt)}
                              </p>
                            </Link>
                          ) : (
                            <div onClick={() => markAsRead(notification.id)}>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {notification.title}
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>
                          )}
                        </div>
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="ml-2 flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Menu.Item>
                ))}
              </div>
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/hr/notifications"
                className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View all notifications
              </Link>
            </div>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

