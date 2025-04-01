"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string, options?: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
        }

        setSession(data.session)
        setUser(data.session?.user ?? null)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to initialize Supabase client:", error)
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    try {
      const supabase = getSupabaseClient()
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Failed to subscribe to auth changes:", error)
      setIsLoading(false)
      return () => {}
    }
  }, [])

  const signUp = async (email: string, password: string, options?: any) => {
    try {
      const supabase = getSupabaseClient()
      return await supabase.auth.signUp({
        email,
        password,
        options,
      })
    } catch (error) {
      console.error("Sign up error:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = getSupabaseClient()
      return await supabase.auth.signInWithPassword({
        email,
        password,
      })
    } catch (error) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const supabase = getSupabaseClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const supabase = getSupabaseClient()
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    } catch (error) {
      console.error("Reset password error:", error)
      throw error
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

