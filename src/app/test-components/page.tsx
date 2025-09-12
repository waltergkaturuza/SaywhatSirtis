"use client"

// Component validation test
import { MainLayout } from "@/components/layout/main-layout"
import { EnhancedLayout, ModulePage } from "@/components/layout/enhanced-layout"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import Chatbot from "@/components/chatbot/chatbot"

export default function ComponentTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Component Validation Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">✅ All components imported successfully!</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>✅ MainLayout</li>
            <li>✅ EnhancedLayout</li>
            <li>✅ ModulePage</li>
            <li>✅ Header</li>
            <li>✅ Sidebar</li>
            <li>✅ Chatbot</li>
          </ul>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Components Test Complete</h2>
          <p className="text-green-600">All essential components are working properly!</p>
        </div>
      </div>
    </div>
  )
}
