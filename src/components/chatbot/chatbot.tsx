"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"

interface Message {
  id: number
  text: string
  isBot: boolean
  timestamp: string
  isLoading?: boolean
}

export default function Chatbot() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm SIRTIS Copilot, your AI assistant. I can help you with HR tasks, project management, analytics, and more. What would you like to know?",
      isBot: true,
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const toggleChat = () => setIsOpen(!isOpen)

  const getCurrentContext = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentPage = pathSegments[0] || 'dashboard'
    
    return {
      userId: session?.user?.email || 'anonymous',
      department: (session?.user as any)?.department || 'General',
      currentPage: currentPage,
      recentActions: [`Viewing ${currentPage}`, `Active session`]
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsTyping(true)

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: "Thinking...",
      isBot: true,
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const context = getCurrentContext()
      
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          context: context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Remove loading message and add bot response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        return [...withoutLoading, {
          id: Date.now() + 2,
          text: data.response,
          isBot: true,
          timestamp: new Date().toLocaleTimeString()
        }]
      })
    } catch (error) {
      console.error('Error getting AI response:', error)
      
      // Fallback to local demo response
      const context = getCurrentContext()
      const fallbackResponse = getContextualDemoResponse(currentInput, context.currentPage)
      
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading)
        return [...withoutLoading, {
          id: Date.now() + 2,
          text: fallbackResponse,
          isBot: true,
          timestamp: new Date().toLocaleTimeString()
        }]
      })
    } finally {
      setIsTyping(false)
    }
  }

  const getContextualDemoResponse = (message: string, currentPage: string): string => {
    const lowerMessage = message.toLowerCase()
    
    // Context-aware responses based on current page
    if (currentPage === 'hr' || currentPage === 'dashboard') {
      if (lowerMessage.includes('employee') || lowerMessage.includes('hr')) {
        return "I can help you with employee management, performance tracking, and HR analytics. Would you like me to show you recent employee metrics or help with performance evaluations?"
      }
    }
    
    if (currentPage === 'programs' || currentPage === 'projects') {
      if (lowerMessage.includes('project') || lowerMessage.includes('program')) {
        return "I can assist with project management, tracking milestones, and analyzing project performance. Would you like to see current project status or KPI insights?"
      }
    }
    
    if (currentPage === 'inventory') {
      if (lowerMessage.includes('inventory') || lowerMessage.includes('asset')) {
        return "I can help you track inventory levels, manage assets, and optimize stock management. What specific inventory information do you need?"
      }
    }
    
    if (currentPage === 'call-centre') {
      if (lowerMessage.includes('call') || lowerMessage.includes('customer')) {
        return "I can assist with call center analytics, customer service metrics, and case management. How can I help improve your customer service operations?"
      }
    }
    
    // General helpful responses
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I'm your SIRTIS AI assistant! I can help you with:
      
• HR management and employee analytics
• Project tracking and KPI monitoring  
• Inventory and asset management
• Call center optimization
• Document analysis and insights
• Real-time data visualization

What would you like to explore?`
    }
    
    return `I understand you're asking about "${message}". I'm here to help with SIRTIS operations across all departments. For full AI capabilities including predictive analytics and document analysis, please contact your administrator to configure the OpenAI integration.`
  }

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
        title="SIRTIS Copilot - AI Assistant"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        )}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-w-sm rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <h3 className="text-sm font-semibold text-white">SIRTIS Copilot</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white/80 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Current Context Info */}
          {session && (
            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-b">
              <div className="flex justify-between">
                <span>Page: {getCurrentContext().currentPage}</span>
                <span>User: {session.user?.name || session.user?.email}</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className="max-w-[85%]">
                  {message.isBot && (
                    <div className="flex items-center space-x-1 mb-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                      <span className="text-xs text-gray-500">SIRTIS Copilot</span>
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      message.isBot
                        ? message.isLoading
                          ? 'bg-gray-100 text-gray-600 animate-pulse'
                          : 'bg-gray-100 text-gray-900'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="ml-2">Thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 px-1">
                    {message.timestamp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 px-4 py-2">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setInputMessage("What can you help me with?")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"
                disabled={isTyping}
              >
                Help
              </button>
              <button
                onClick={() => setInputMessage("Show me HR analytics")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"
                disabled={isTyping}
              >
                HR Analytics
              </button>
              <button
                onClick={() => setInputMessage("Project status")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"
                disabled={isTyping}
              >
                Projects
              </button>
            </div>
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask SIRTIS Copilot anything..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isTyping ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <PaperAirplaneIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
