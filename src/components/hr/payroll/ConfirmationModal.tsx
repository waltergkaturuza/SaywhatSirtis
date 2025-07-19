import React from 'react'
import { 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  InformationCircleIcon 
} from "@heroicons/react/24/outline"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'warning' | 'success' | 'info' | 'danger'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-600" />
      case 'danger':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-600" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          iconBg: 'bg-yellow-100',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
        }
      case 'success':
        return {
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
          confirmBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
        }
      case 'danger':
        return {
          bg: 'bg-red-50',
          iconBg: 'bg-red-100',
          confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
        }
      default:
        return {
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
        }
    }
  }

  const colors = getColors()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.iconBg} flex items-center justify-center`}>
              {getIcon()}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${colors.confirmBtn}`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
