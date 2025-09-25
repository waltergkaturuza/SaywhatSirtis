"use client"

import { useState, useRef, useEffect } from "react"
import { 
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  UserIcon,
  CpuChipIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"

interface ChatMessage {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

interface DocumentSirtisCopilotProps {
  documentId: string
  documentName: string
  documentType?: string
  documentContent?: string
}

export default function DocumentSirtisCopilot({ 
  documentId, 
  documentName, 
  documentType,
  documentContent 
}: DocumentSirtisCopilotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: `Hello! I'm SIRTIS Copilot. I can help you analyze and understand "${documentName}". Ask me about the document's content, key points, or how it relates to your work.`,
      isBot: true,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/sirtis-copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          context: "document-analysis",
          documentId: documentId,
          documentName: documentName,
          documentType: documentType,
          documentContent: documentContent
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          content: data.response,
          isBot: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          content: "I'm experiencing technical difficulties analyzing this document. Please try again later.",
          isBot: true,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "Unable to connect to the document analysis service. Please check your connection and try again.",
        isBot: true,
        timestamp: new Date()
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

  const toggleCopilot = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleCopilot}
          className={`${
            isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
          } text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          aria-label={isOpen ? 'Close SIRTIS Copilot' : 'Open SIRTIS Copilot'}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <div className="relative">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
              <DocumentTextIcon className="h-3 w-3 absolute -top-1 -right-1 bg-white text-purple-600 rounded-full p-0.5" />
            </div>
          )}
        </button>
      </div>

      {/* Copilot Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl border-l border-gray-200 z-40 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">SIRTIS Copilot</h3>
                  <p className="text-xs text-purple-100">Document Analysis Assistant</p>
                </div>
              </div>
              <button
                onClick={toggleCopilot}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Document Context */}
          <div className="bg-gray-50 p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">{documentName}</p>
                {documentType && (
                  <p className="text-xs text-gray-500">Type: {documentType}</p>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isBot
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.isBot && (
                      <CpuChipIcon className="h-4 w-4 mt-0.5 text-purple-600" />
                    )}
                    {!message.isBot && (
                      <UserIcon className="h-4 w-4 mt-0.5 text-purple-200" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isBot ? 'text-gray-500' : 'text-purple-200'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <CpuChipIcon className="h-4 w-4 text-purple-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this document..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInputMessage("Summarize this document")}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                Summarize
              </button>
              <button
                onClick={() => setInputMessage("What are the key points?")}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                Key Points
              </button>
              <button
                onClick={() => setInputMessage("Extract action items")}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                Action Items
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}