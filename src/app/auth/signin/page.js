'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Timer, Clock, Shield, Zap, BarChart3 } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const { currentTheme, setCurrentTheme, theme, themes } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme.bg}`}>
      {/* Background Pattern */}
      <div className={`absolute inset-0 ${theme.pattern}`}></div>
      
      {/* Theme Selector */}
      <div className="absolute top-6 right-6 z-10">
        <div className="flex items-center space-x-2">
          {Object.entries(themes).map(([key, themeOption]) => (
            <button
              key={key}
              onClick={() => setCurrentTheme(key)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                currentTheme === key
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : `${theme.surface} ${theme.textMuted} ${theme.surfaceHover} border border-white/10`
              }`}
            >
              {themeOption.icon}
              <span className="text-sm font-medium hidden sm:inline">{themeOption.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center px-12">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${theme.textPrimary}`}>TimeTracker</h1>
                <p className={`${theme.textMuted} font-medium`}>Professional Time Management</p>
              </div>
            </div>

            {/* Main Heading */}
            <h2 className={`text-4xl xl:text-5xl font-bold ${theme.textPrimary} mb-6 leading-tight`}>
              Track your time,
              <br />
              <span className={`${theme.accent}`}>boost productivity</span>
            </h2>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-12">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme.textPrimary}`}>TimeTracker</h1>
                <p className={`text-sm ${theme.textMuted}`}>Professional Time Management</p>
              </div>
            </div>

            {/* Sign In Card */}
            <div className={`${theme.surface} rounded-3xl p-8 shadow-2xl border border-white/10`}>
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold ${theme.textPrimary} mb-3`}>Welcome back</h2>
                <p className={`${theme.textSecondary} text-lg`}>
                  Sign in to access your time tracking dashboard
                </p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full ${theme.button} text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-3`}
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </div>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}