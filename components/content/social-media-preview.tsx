import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Repeat2, Send } from "lucide-react"

interface SocialMediaPreviewProps {
  content: string
  media: string[]
  platforms: string[]
}

export default function SocialMediaPreview({ content, media, platforms }: SocialMediaPreviewProps) {
  if (platforms.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Select at least one platform to see a preview
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {platforms.includes("twitter") && (
        <Card>
          <CardHeader className="pb-2">
            <Badge variant="outline" className="w-fit bg-blue-50 text-blue-600 border-blue-200">
              X (Twitter) Preview
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="/abstract-profile.png" alt="User" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-bold">Jane Doe</span>
                  <span className="text-muted-foreground ml-2">@janedoe</span>
                </div>
                <p className="mt-1">{content || "Your post will appear here"}</p>
                {media.length > 0 && (
                  <div className={`mt-3 grid ${media.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-2`}>
                    {media.map((src, index) => (
                      <img
                        key={index}
                        src={src || "/placeholder.svg"}
                        alt={`Media ${index + 1}`}
                        className="rounded-lg w-full object-cover aspect-square"
                      />
                    ))}
                  </div>
                )}
                <div className="flex mt-3 justify-between text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs">0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat2 className="h-4 w-4" />
                    <span className="text-xs">0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span className="text-xs">0</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {platforms.includes("instagram") && (
        <Card>
          <CardHeader className="pb-2">
            <Badge variant="outline" className="w-fit bg-pink-50 text-pink-600 border-pink-200">
              Instagram Preview
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 border-2 border-pink-500">
                  <AvatarImage src="/abstract-profile.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <span className="font-semibold">janedoe</span>
              </div>

              {media.length > 0 ? (
                <img
                  src={media[0] || "/placeholder.svg"}
                  alt="Instagram post"
                  className="rounded-sm w-full object-cover aspect-square"
                />
              ) : (
                <div className="bg-gray-100 w-full aspect-square flex items-center justify-center rounded-sm">
                  <p className="text-muted-foreground text-sm">Add media for Instagram preview</p>
                </div>
              )}

              <div>
                <div className="flex gap-3 my-2">
                  <Heart className="h-5 w-5" />
                  <MessageCircle className="h-5 w-5" />
                  <Send className="h-5 w-5" />
                </div>
                <p className="text-sm">
                  <span className="font-semibold">janedoe</span> {content || "Your caption will appear here"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {platforms.includes("tiktok") && (
        <Card>
          <CardHeader className="pb-2">
            <Badge variant="outline" className="w-fit bg-gray-900 text-white border-gray-700">
              TikTok Preview
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {media.length > 0 ? (
                <div className="relative">
                  <img
                    src={media[0] || "/placeholder.svg"}
                    alt="TikTok post"
                    className="rounded-md w-full object-cover aspect-[9/16]"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white">
                    <p className="text-sm font-medium">@janedoe</p>
                    <p className="text-xs line-clamp-2">{content || "Your caption will appear here"}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 w-full aspect-[9/16] flex items-center justify-center rounded-md">
                  <p className="text-muted-foreground text-sm">Add video for TikTok preview</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
