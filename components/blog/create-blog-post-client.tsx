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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MarkdownEditor } from "@/components/blog/markdown-editor";

export default function CreateBlogPostClient() {
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
    <div className="flex flex-col space-y-6 container py-10 px-4 md:px-6">
      <h2 className="text-2xl font-bold tracking-tight">Create Blog Post</h2>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="social-media">
                          Social Media
                        </SelectItem>
                        <SelectItem value="content-strategy">
                          Content Strategy
                        </SelectItem>
                        <SelectItem value="analytics">Analytics</SelectItem>
                        <SelectItem value="seo">SEO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input
                      id="featuredImage"
                      placeholder="Enter image URL"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                    />
                  </div>
                </div>

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
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <MarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your blog post content here using markdown..."
                  minHeight="400px"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, true)}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
