"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { AuthModal } from "@/components/auth-modal"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface PublishButtonProps {
  websiteData: any
  className?: string
}

export function PublishButton({ websiteData, className }: PublishButtonProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Check if user is already logged in
  const checkAuthStatus = async () => {
    const { data } = await supabase.auth.getSession()
    return !!data.session
  }

  const handlePublishClick = async () => {
    // Check if user is logged in
    const isLoggedIn = await checkAuthStatus()

    if (isLoggedIn) {
      // User is logged in, proceed with publishing
      publishWebsite()
    } else {
      // User is not logged in, show auth modal
      setIsAuthModalOpen(true)
    }
  }

  const publishWebsite = async () => {
    setIsPublishing(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Save website data to database
      const { data, error } = await supabase
        .from("websites")
        .insert([
          {
            user_id: user.id,
            name: websiteData.businessName || "My Website",
            data: websiteData,
            published: true,
            created_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) {
        throw error
      }

      toast({
        title: "Website published successfully!",
        description: "Your website is now live and can be shared.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Publishing failed",
        description: error.message || "There was an error publishing your website.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    publishWebsite()
  }

  return (
    <>
      <Button onClick={handlePublishClick} className={className} disabled={isPublishing}>
        {isPublishing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Publishing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Publish Website
          </>
        )}
      </Button>

      <AuthModal open={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
    </>
  )
}

