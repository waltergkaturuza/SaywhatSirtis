"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, SparklesIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setIsSuccess(false)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Check if sign in was successful
        const session = await getSession()
        if (session) {
          setIsSuccess(true)
          // Small delay to show success state before redirect
          setTimeout(() => {
            router.push("/")
          }, 1500)
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Custom CSS for rotating rings animation */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 20s linear infinite;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-orange-50 to-green-50 relative overflow-hidden py-4">
        {/* Rotating Rings Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Outermost Ring */}
          <div className="absolute w-96 h-96 border-2 border-dashed border-orange-200/40 rounded-full animate-spin-slow">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-orange-400 rounded-full shadow-lg shadow-orange-400/50 animate-pulse"></div>
          </div>
          
          {/* Middle Ring */}
          <div className="absolute w-80 h-80 border-2 border-green-200/50 rounded-full animate-spin-reverse">
            <div className="absolute top-1/4 right-0 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse delay-1000"></div>
          </div>
          
          {/* Inner Ring */}
          <div className="absolute w-64 h-64 border border-gray-200/60 rounded-full animate-spin-slow">
            <div className="absolute bottom-0 left-1/4 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full shadow-md shadow-gray-400/50 animate-pulse delay-500"></div>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
        </div>

        <div className="max-w-lg w-full space-y-6 relative z-10 mx-4">
          {/* Card Container */}
          <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl p-6 border border-gray-100 relative overflow-hidden">
            {/* Decorative header gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-green-500 to-orange-600"></div>
            
            {/* Logo and Header Section */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4 relative">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-green-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white rounded-full p-3 shadow-lg">
                    <Image
                      src="/assets/saywhat-logo.png"
                      alt="SAYWHAT Logo"
                      width={160}
                      height={100}
                      className="h-20 w-auto"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-gray-800 to-green-600 bg-clip-text text-transparent">
                  SIRTIS
                </h1>
                <h2 className="text-lg font-semibold text-gray-800">
                  Welcome Back
                </h2>
                <p className="text-xs text-gray-600 font-medium">
                  SAYWHAT Integrated Real-Time Information System
                </p>
                <div className="flex justify-center items-center space-x-2 mt-2">
                  <SparklesIcon className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Secure Access Portal</span>
                  <SparklesIcon className="h-3 w-3 text-green-500" />
                </div>
              </div>
            </div>
          
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-200 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                  <div className="text-sm text-red-700 font-medium text-center">{error}</div>
                </div>
              )}

              {isSuccess && (
                <div className="rounded-2xl bg-green-50 border border-green-200 p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
                  <div className="text-sm text-green-700 font-medium text-center flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Login successful! Redirecting...
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {/* Email Input */}
                <div className="group">
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm text-sm"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                
                {/* Password Input */}
                <div className="group">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-xl transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || isSuccess}
                  className={`group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-semibold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
                    isSuccess 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-green-500/25' 
                      : isLoading
                      ? 'bg-gradient-to-r from-orange-400 to-orange-500 opacity-75'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500 shadow-orange-500/25 hover:shadow-orange-500/40'
                  }`}
                >
                  <span className="flex items-center">
                    {isSuccess && (
                      <CheckCircleIcon className="h-5 w-5 mr-2 animate-bounce" />
                    )}
                    {isLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    <span className="tracking-wide">
                      {isLoading ? "Signing In..." : isSuccess ? "Login Successful!" : "Sign In"}
                    </span>
                  </span>
                  
                  {!isLoading && !isSuccess && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Powered by{" "}
                  <span className="font-semibold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                    SAYWHAT Technologies
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Additional decorative elements */}
          <div className="text-center mt-4">
            <div className="inline-flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <span>Secure</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-300"></div>
              <span>Reliable</span>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-600"></div>
              <span>Professional</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
