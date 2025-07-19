'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Shield, Fingerprint } from 'lucide-react'
import Image from 'next/image'

interface LoginFormProps {
  callbackUrl?: string
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mfaCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showMFA, setShowMFA] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [biometricSupported, setBiometricSupported] = useState(false)
  
  const router = useRouter()

  React.useEffect(() => {
    // Check for biometric support
    if (typeof window !== 'undefined' && 'credentials' in navigator) {
      setBiometricSupported(true)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleBiometricLogin = async () => {
    if (!biometricSupported) {
      setError('Biometric authentication is not supported on this device')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Check if user has biometric credentials
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)
      
      const availableCredentials = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          allowCredentials: [],
          userVerification: 'preferred'
        }
      })

      if (availableCredentials) {
        const result = await signIn('biometric', {
          credential: JSON.stringify(availableCredentials),
          redirect: false
        })

        if (result?.error) {
          setError('Biometric authentication failed')
        } else if (result?.ok) {
          router.push(callbackUrl || '/dashboard')
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error)
      setError('Biometric authentication failed. Please try password login.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        mfaCode: showMFA ? formData.mfaCode : undefined,
        redirect: false
      })

      if (result?.error) {
        if (result.error === 'MFA_REQUIRED') {
          setShowMFA(true)
          setError('Please enter your multi-factor authentication code')
        } else if (result.error === 'INVALID_MFA') {
          setError('Invalid MFA code. Please try again.')
        } else if (result.error === 'ACCOUNT_LOCKED') {
          setError('Account locked due to too many failed attempts. Please contact support.')
        } else if (result.error === 'CREDENTIALS_INVALID') {
          setError('Invalid email or password')
        } else {
          setError('Login failed. Please check your credentials and try again.')
        }
      } else if (result?.ok) {
        router.push(callbackUrl || '/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/assets/saywhat-logo.png"
              alt="SAYWHAT Logo"
              width={80}
              height={80}
              className="rounded-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to SIRTIS</CardTitle>
          <CardDescription>
            SAYWHAT Integrated Real-Time Information System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@saywhat.org"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {showMFA && (
              <div className="space-y-2">
                <Label htmlFor="mfaCode">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Multi-Factor Authentication Code
                </Label>
                <Input
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.mfaCode}
                  onChange={handleInputChange}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  className="h-11 text-center text-2xl tracking-widest"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {showMFA ? 'Verify & Sign In' : 'Sign In'}
            </Button>

            {biometricSupported && !showMFA && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            {biometricSupported && !showMFA && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleBiometricLogin}
                disabled={isLoading}
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Biometric Login
              </Button>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Secure login with enterprise-grade authentication</p>
            <p className="mt-2 text-xs text-gray-500">
              © 2025 SAYWHAT Organization. All rights reserved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
