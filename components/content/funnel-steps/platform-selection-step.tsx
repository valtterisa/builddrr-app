"use client"

import type { ContentCreationState } from "../content-creation-funnel"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PlatformSelectionStepProps {
  state: ContentCreationState
  updateState: (updates: Partial<ContentCreationState>) => void
}

// Sample platform data
const availablePlatforms = [
  {
    id: "twitter",
    name: "X (Twitter)",
    icon: "/platform-icons/twitter.svg",
    color: "bg-blue-500",
    accounts: [
      { id: "twitter1", name: "Main Account", avatar: "/abstract-profile.png" },
      { id: "twitter2", name: "Brand Account", avatar: "/abstract-profile.png" },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "/platform-icons/instagram.svg",
    color: "bg-pink-500",
    accounts: [
      { id: "insta1", name: "Personal", avatar: "/abstract-profile.png" },
      { id: "insta2", name: "Business", avatar: "/abstract-profile.png" },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: "/platform-icons/tiktok.svg",
    color: "bg-black",
    accounts: [{ id: "tiktok1", name: "Main", avatar: "/abstract-profile.png" }],
  },
  {
    id: "bluesky",
    name: "Bluesky",
    icon: "/platform-icons/bluesky.svg",
    color: "bg-sky-500",
    accounts: [{ id: "bluesky1", name: "Personal", avatar: "/abstract-profile.png" }],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: "/platform-icons/pinterest.svg",
    color: "bg-red-600",
    accounts: [{ id: "pinterest1", name: "Business", avatar: "/abstract-profile.png" }],
  },
]

export default function PlatformSelectionStep({ state, updateState }: PlatformSelectionStepProps) {
  const togglePlatform = (platformId: string) => {
    let newPlatforms = [...state.platforms]
    const newSelectedAccounts = { ...state.selectedAccounts }

    if (newPlatforms.includes(platformId)) {
      // Remove platform
      newPlatforms = newPlatforms.filter((id) => id !== platformId)
      delete newSelectedAccounts[platformId]
    } else {
      // Add platform
      newPlatforms.push(platformId)
      // Auto-select the first account
      const platform = availablePlatforms.find((p) => p.id === platformId)
      if (platform && platform.accounts.length > 0) {
        newSelectedAccounts[platformId] = [platform.accounts[0].id]
      } else {
        newSelectedAccounts[platformId] = []
      }
    }

    updateState({
      platforms: newPlatforms,
      selectedAccounts: newSelectedAccounts,
    })
  }

  const toggleAccount = (platformId: string, accountId: string) => {
    const currentSelected = state.selectedAccounts[platformId] || []
    let newSelected: string[]

    if (currentSelected.includes(accountId)) {
      // Remove account
      newSelected = currentSelected.filter((id) => id !== accountId)
    } else {
      // Add account
      newSelected = [...currentSelected, accountId]
    }

    const newSelectedAccounts = {
      ...state.selectedAccounts,
      [platformId]: newSelected,
    }

    updateState({ selectedAccounts: newSelectedAccounts })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Select Platforms</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Select the platforms where you want to publish your content and choose which accounts to use for each
                platform.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availablePlatforms.map((platform) => (
          <div
            key={platform.id}
            className={cn(
              "border rounded-lg p-4 transition-all",
              state.platforms.includes(platform.id) ? "border-purple-500 bg-purple-50" : "hover:border-gray-400",
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", platform.color)}>
                  {platform.id === "twitter" && (
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                    </svg>
                  )}
                  {platform.id === "instagram" && (
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.982c2.937 0 3.285.011 4.445.064 1.072.049 1.655.228 2.042.379.514.2.88.439 1.265.823.385.385.624.751.824 1.265.15.387.33.97.379 2.042.053 1.16.064 1.508.064 4.445 0 2.937-.011 3.285-.064 4.445-.049 1.072-.228 1.655-.379 2.042-.2.514-.439.88-.823 1.265-.385.385-.751.624-1.265.824-.387.15-.97.33-2.042.379-1.16.053-1.508.064-4.445.064-2.937 0-3.285-.011-4.445-.064-1.072-.049-1.655-.228-2.042-.379-.514-.2-.88-.439-1.265-.823-.385-.385-.624-.751-.824-1.265-.15-.387-.33-.97-.379-2.042-.053-1.16-.064-1.508-.064-4.445 0-2.937.011-3.285.064-4.445.049-1.072.228-1.655.379-2.042.2-.514.439-.88.823-1.265.385-.385.751-.624 1.265-.824.387-.15.97-.33 2.042-.379 1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066-1.171.054-1.97.24-2.67.512-.724.281-1.337.657-1.949 1.27-.613.612-.989 1.225-1.27 1.949-.272.7-.458 1.499-.512 2.67C1.013 8.638 1 9.013 1 12s.013 3.362.066 4.535c.054 1.171.24 1.97.512 2.67.281.724.657 1.337 1.27 1.949.612.613 1.225.989 1.949 1.27.7.272 1.499.458 2.67.512C8.638 22.987 9.013 23 12 23s3.362-.013 4.535-.066c1.171-.054 1.97-.24 2.67-.512.724-.281 1.337-.657 1.949-1.27.613-.612.989-1.225 1.27-1.949.272-.7.458-1.499.512-2.67C22.987 15.362 23 14.987 23 12s-.013-3.362-.066-4.535c-.054-1.171-.24-1.97-.512-2.67-.281-.724-.657-1.337-1.27-1.949-.612-.613-1.225-.989-1.949-1.27-.7-.272-1.499-.458-2.67-.512C15.362 1.013 14.987 1 12 1Zm0 5.351c-3.121 0-5.649 2.528-5.649 5.649 0 3.121 2.528 5.649 5.649 5.649 3.121 0 5.649-2.528 5.649-5.649 0-3.121-2.528-5.649-5.649-5.649Zm0 9.316c-2.026 0-3.667-1.641-3.667-3.667 0-2.026 1.641-3.667 3.667-3.667 2.026 0 3.667 1.641 3.667 3.667 0 2.026-1.641 3.667-3.667 3.667Zm7.192-9.539c0 .729-.592 1.32-1.321 1.32-.729 0-1.32-.591-1.32-1.32 0-.729.591-1.32 1.32-1.32.729 0 1.321.591 1.321 1.32Z" />
                    </svg>
                  )}
                  {platform.id === "tiktok" && (
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.321 5.562a5.124 5.124 0 0 1-3.414-1.267 5.124 5.124 0 0 1-1.53-3.295h-3.643v13.636c0 1.355-1.095 2.45-2.45 2.45s-2.45-1.095-2.45-2.45 1.095-2.45 2.45-2.45c.273 0 .537.045.784.127v-3.688a6.13 6.13 0 0 0-.784-.05c-3.362 0-6.088 2.729-6.088 6.09a6.089 6.089 0 0 0 6.088 6.088c3.361 0 6.09-2.727 6.09-6.088V8.967a8.78 8.78 0 0 0 4.948 1.514V7a5.127 5.127 0 0 1-1 .188 5.127 5.127 0 0 1-1-.188V5.562h.001Z" />
                    </svg>
                  )}
                  {/* Simplified icons for Bluesky and Pinterest */}
                  {platform.id === "bluesky" && (
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="8" />
                    </svg>
                  )}
                  {platform.id === "pinterest" && (
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.546 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.525-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{platform.name}</span>
              </div>

              <Button
                variant={state.platforms.includes(platform.id) ? "default" : "outline"}
                size="sm"
                onClick={() => togglePlatform(platform.id)}
                className={state.platforms.includes(platform.id) ? "bg-purple-600" : ""}
              >
                {state.platforms.includes(platform.id) ? <Check className="h-4 w-4 mr-1" /> : null}
                {state.platforms.includes(platform.id) ? "Selected" : "Select"}
              </Button>
            </div>

            {state.platforms.includes(platform.id) && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Select accounts to publish to:</p>
                <div className="space-y-2">
                  {platform.accounts.map((account) => {
                    const isSelected = (state.selectedAccounts[platform.id] || []).includes(account.id)

                    return (
                      <div
                        key={account.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer",
                          isSelected ? "bg-purple-100" : "hover:bg-gray-100",
                        )}
                        onClick={() => toggleAccount(platform.id, account.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={account.avatar || "/placeholder.svg"} alt={account.name} />
                            <AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{account.name}</span>
                        </div>

                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center",
                            isSelected ? "bg-purple-600 border-purple-600" : "border-gray-300",
                          )}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
