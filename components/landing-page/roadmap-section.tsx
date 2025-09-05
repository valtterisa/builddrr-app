"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, MessageCircle, CheckCircle, Clock, Star } from "lucide-react";
import Link from "next/link";

export function RoadmapSection() {
    return (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Your Voice Shapes Our Future
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We're building Builddrr with you. See what's coming next, vote on features,
                        and share your feedback to help us prioritize what matters most.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {/* Roadmap Card */}
                    <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <Map className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">Product Roadmap</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 mb-6">
                                See what features we're working on, what's coming next, and what's planned for the future.
                            </p>
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Real-time updates</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Feature voting</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Progress tracking</span>
                                </div>
                            </div>
                            <Button asChild className="w-full">
                                <a
                                    href="https://builddrr.featurebase.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Roadmap
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Feedback Card */}
                    <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-xl">Share Feedback</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 mb-6">
                                Have ideas, suggestions, or found a bug? We want to hear from you.
                            </p>
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span>Feature requests</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span>Bug reports</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Star className="h-4 w-4 text-yellow-500" />
                                    <span>General feedback</span>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <a
                                    href="https://builddrr.featurebase.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Give Feedback
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Community Card */}
                    <Card className="border-2 border-green-200 hover:border-green-300 transition-colors md:col-span-2 lg:col-span-1">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <Clock className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle className="text-xl">Community Driven</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-gray-600 mb-6">
                                Join thousands of users helping us build the best website builder.
                            </p>
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Active community</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Regular updates</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>Transparent development</span>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard">
                                    Get Started
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA Section */}
                <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to Shape the Future?
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Join our community of builders and help us create the most powerful AI website builder.
                        Your feedback drives our development priorities.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg">
                            <a
                                href="https://builddrr.featurebase.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Map className="h-5 w-5 mr-2" />
                                Explore Roadmap
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <a
                                href="https://builddrr.featurebase.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="h-5 w-5 mr-2" />
                                Share Feedback
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
