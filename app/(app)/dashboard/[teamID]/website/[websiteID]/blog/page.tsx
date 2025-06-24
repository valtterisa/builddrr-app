import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Blog - Social Media Platform",
  description: "Manage and create your blog posts",
};

// Sample blog posts for demonstration
const samplePosts = [
  {
    id: "1",
    title: "10 Ways to Boost Your Social Media Engagement",
    excerpt:
      "Learn the top strategies to increase engagement on your social media posts and grow your audience.",
    category: "social-media",
    publishDate: "2023-05-15",
    readTime: 5,
    featuredImage: "/social-media-post.png",
  },
  {
    id: "2",
    title: "The Ultimate Guide to Content Planning",
    excerpt:
      "Discover how to create an effective content plan that saves time and drives results for your business.",
    category: "content-strategy",
    publishDate: "2023-06-22",
    readTime: 8,
    featuredImage: "/product-photography-still-life.png",
  },
  {
    id: "3",
    title: "How to Measure Social Media ROI",
    excerpt:
      "Learn practical methods to track and measure the return on investment from your social media marketing efforts.",
    category: "analytics",
    publishDate: "2023-07-10",
    readTime: 6,
    featuredImage: "/vast-mountain-valley.png",
  },
];

export default function BlogPage() {
  return (
    <div className="flex flex-col space-y-6 container py-10 px-4 md:px-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
        <Link href="blog/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create Blog Post
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {samplePosts.map((post) => (
          <Link href={`blog/${post.id}`} key={post.id} className="block group">
            <Card className="h-full overflow-hidden transition-all hover:shadow-md">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={
                    post.featuredImage ||
                    "/placeholder.svg?height=400&width=600"
                  }
                  alt={post.title}
                  className="object-cover w-full h-full transition-transform group-hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Badge variant="outline" className="capitalize">
                    {post.category.replace("-", " ")}
                  </Badge>
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <span>{post.publishDate}</span>
                </div>
                <div className="flex items-center">
                  <span>{post.readTime} min read</span>
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
