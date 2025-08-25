'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info'
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false
}: ConfirmationModalProps) {
  
  const getVariantConfig = () => {
    switch (variant) {
      case 'destructive':
        return {
          icon: <XCircleIcon className="h-6 w-6 text-red-600" />,
          iconBg: 'bg-red-100',
          confirmButtonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          titleColor: 'text-red-900',
          descriptionColor: 'text-red-700'
        }
      case 'warning':
        return {
          icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />,
          iconBg: 'bg-yellow-100',
          confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          titleColor: 'text-yellow-900',
          descriptionColor: 'text-yellow-700'
        }
      case 'success':
        return {
          icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
          iconBg: 'bg-green-100',
          confirmButtonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          titleColor: 'text-green-900',
          descriptionColor: 'text-green-700'
        }
      case 'info':
        return {
          icon: <InformationCircleIcon className="h-6 w-6 text-blue-600" />,
          iconBg: 'bg-blue-100',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          titleColor: 'text-blue-900',
          descriptionColor: 'text-blue-700'
        }
      default:
        return {
          icon: <InformationCircleIcon className="h-6 w-6 text-gray-600" />,
          iconBg: 'bg-gray-100',
          confirmButtonClass: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          titleColor: 'text-gray-900',
          descriptionColor: 'text-gray-700'
        }
    }
  }

  const config = getVariantConfig()

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center`}>
              {config.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className={`text-lg font-semibold ${config.titleColor}`}>
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className={`mt-3 ${config.descriptionColor}`}>
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="sm:mr-3"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`${config.confirmButtonClass} text-white`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Convenience wrapper components for common use cases
export function DeleteConfirmationModal(props: Omit<ConfirmationModalProps, 'variant'>) {
  return (
    <ConfirmationModal
      {...props}
      variant="destructive"
      confirmText={props.confirmText || 'Delete'}
    />
  )
}

export function ProcessConfirmationModal(props: Omit<ConfirmationModalProps, 'variant'>) {
  return (
    <ConfirmationModal
      {...props}
      variant="warning"
      confirmText={props.confirmText || 'Process'}
    />
  )
}

export function SuccessConfirmationModal(props: Omit<ConfirmationModalProps, 'variant'>) {
  return (
    <ConfirmationModal
      {...props}
      variant="success"
      confirmText={props.confirmText || 'Continue'}
    />
  )
}
