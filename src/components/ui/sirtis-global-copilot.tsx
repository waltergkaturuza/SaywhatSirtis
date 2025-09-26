"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  CpuChipIcon,
  SparklesIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  CubeIcon,
  Cog6ToothIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import { 
  MODULE_CONFIGS, 
  getContextualQuickActions as getModuleQuickActions,
  getContextualWelcome as getModuleWelcome
} from '@/lib/copilot-context'

interface ChatMessage {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
  context?: string
  suggestions?: string[]
}

interface SirtisGlobalCopilotProps {
  pageContext?: {
    module?: string
    subpage?: string
    data?: any
  }
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'default' | 'compact' | 'modern'
  initialMessage?: string
}

export default function SirtisGlobalCopilot({ 
  pageContext,
  position = 'bottom-right',
  theme = 'modern',
  initialMessage
}: SirtisGlobalCopilotProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get current module from pathname
  const getCurrentModule = useCallback(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    return pathSegments[0] || 'dashboard'
  }, [pathname])

  // Get contextual quick actions
  const getQuickActions = useCallback(() => {
    const module = getCurrentModule()
    const context = { 
      module, 
      subpage: pathname.split('/')[2],
      ...pageContext 
    }
    return getModuleQuickActions(context)
  }, [getCurrentModule, pathname, pageContext])

  // Initialize greeting message
  useEffect(() => {
    const module = getCurrentModule()
    const context = { 
      module, 
      subpage: pathname.split('/')[2],
      ...pageContext 
    }
    
    const greeting = initialMessage || getModuleWelcome(context, session?.user?.name)
    const quickActions = getQuickActions()
    
    setMessages([{
      id: "welcome",
      content: greeting,
      isBot: true,
      timestamp: new Date(),
      context: pathname,
      suggestions: quickActions.slice(0, 2) // Show first 2 as suggestions
    }])
  }, [pathname, session, initialMessage, getCurrentModule, getQuickActions, pageContext])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const getCurrentContext = useCallback(() => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentModule = pathSegments[0] || 'dashboard'
    
    return {
      userId: session?.user?.email || 'anonymous',
      userName: session?.user?.name || 'User',
      department: (session?.user as any)?.department || 'General',
      currentPage: currentModule,
      currentPath: pathname,
      pageContext: pageContext,
      timestamp: new Date().toISOString()
    }
  }, [pathname, session, pageContext])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      isBot: false,
      timestamp: new Date(),
      context: pathname
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/sirtis-global-copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          context: getCurrentContext(),
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          content: data.response,
          isBot: true,
          timestamp: new Date(),
          context: pathname,
          suggestions: data.suggestions || []
        }
        setMessages(prev => [...prev, botMessage])
        
        // Show note if using fallback mode
        if (data.note && data.provider === 'Intelligent Assistant Mode') {
          const noteMessage: ChatMessage = {
            id: `note-${Date.now()}`,
            content: `💡 ${data.note}`,
            isBot: true,
            timestamp: new Date(),
            context: pathname
          }
          setMessages(prev => [...prev, noteMessage])
        }
      } else {
        throw new Error('API request failed')
      }
    } catch (error) {
      console.error('Global Copilot Error:', error)
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "I'm experiencing technical difficulties. The system is running in demo mode. Please try again or contact support if the issue persists.",
        isBot: true,
        timestamp: new Date(),
        context: pathname
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = (action: string) => {
    setInputMessage(action)
    // Auto-send the quick action
    setTimeout(() => {
      const event = { key: 'Enter', shiftKey: false, preventDefault: () => {} } as React.KeyboardEvent
      handleKeyPress(event)
    }, 100)
  }

  const toggleCopilot = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMinimized(!isMinimized)
  }

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const panelPositionClasses = {
    'bottom-right': 'bottom-20 right-6',
    'bottom-left': 'bottom-20 left-6',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6'
  }

  const quickActions = getQuickActions()
  const currentModule = getCurrentModule()
  const moduleConfig = MODULE_CONFIGS[currentModule] || MODULE_CONFIGS.dashboard

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Panel */}
      {isOpen && (
        <div className={`fixed ${panelPositionClasses[position]} w-80 ${isMinimized ? 'h-16' : 'h-96'} transition-all duration-300 ease-in-out z-40`}>
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold text-sm">SIRTIS Copilot</h3>
                  <p className="text-xs text-indigo-100">
                    {moduleConfig.icon} {moduleConfig.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={toggleMinimize}
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-indigo-700 transition-colors"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? (
                    <PlusIcon className="h-4 w-4" />
                  ) : (
                    <MinusIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={toggleCopilot}
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-indigo-700 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.isBot
                            ? 'bg-white text-gray-900 border border-gray-200'
                            : 'bg-indigo-600 text-white'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.isBot && (
                            <SparklesIcon className="h-4 w-4 mt-0.5 text-indigo-600 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-1 opacity-70 ${
                              message.isBot ? 'text-gray-500' : 'text-indigo-200'
                            }`}>
                              {message.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </p>
                            {message.suggestions && message.suggestions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.suggestions.map((suggestion, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleQuickAction(suggestion)}
                                    className="block w-full text-left px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <SparklesIcon className="h-4 w-4 text-indigo-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-100 p-2 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {quickActions.slice(0, 4).map((action: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action)}
                        className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                        disabled={isLoading}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="bg-white border-t border-gray-200 p-3">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Ask about ${moduleConfig.name.toLowerCase()}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleCopilot}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="SIRTIS Copilot - AI Assistant"
      >
        {isOpen && !isMinimized ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <>
            <ChatBubbleLeftRightIcon className="h-6 w-6" />
            {/* AI activity indicator */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
            {/* Hover tooltip */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              SIRTIS AI Assistant
            </div>
          </>
        )}
      </button>

      {/* Status indicator for mobile */}
      {!isOpen && (
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
          <SparklesIcon className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </div>
  )
}