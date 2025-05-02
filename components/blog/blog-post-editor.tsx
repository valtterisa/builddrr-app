"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function BlogPostEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!title) {
      setError("Please enter a title for your blog post");
      setIsSubmitting(false);
      return;
    }

    if (!content) {
      setError("Please enter content for your blog post");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call to save blog post
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real app, you would send the data to your API
      console.log({
        title,
        content,
        excerpt,
        category,
        featuredImage,
        status: isDraft ? "draft" : "published",
      });

      // Redirect to blog list page
      router.push("blog");
    } catch (err) {
      setError("Failed to save blog post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, false)}>
      <div className="grid gap-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter blog post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Enter a short excerpt for your blog post"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="content-strategy">
                      Content Strategy
                    </SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <Input
                  placeholder="Enter image URL"
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                />
                {featuredImage && (
                  <div className="mt-2 relative aspect-video rounded-md overflow-hidden border">
                    <img
                      src={featuredImage || "/placeholder.svg"}
                      alt="Featured"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/placeholder.svg?height=400&width=600";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="write">
              <TabsList className="mb-4">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your blog post content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[300px]"
                  />
                </div>
              </TabsContent>
              <TabsContent value="preview">
                <div className="prose max-w-none">
                  <h1>{title || "Blog Post Title"}</h1>
                  {featuredImage && (
                    <img
                      src={featuredImage || "/placeholder.svg"}
                      alt={title}
                      className="w-full h-64 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="whitespace-pre-wrap">
                    {content || "Your blog post content will appear here..."}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </Button>
        </div>
      </div>
    </form>
  );
}
