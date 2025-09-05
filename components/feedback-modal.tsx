"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeedbackModalProps {
    children?: React.ReactNode;
}

export function FeedbackModal({ children }: FeedbackModalProps) {
    const [open, setOpen] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!feedback.trim()) {
            toast({
                title: "Error",
                description: "Please enter your feedback before submitting.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: feedback.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit feedback");
            }

            toast({
                title: "Feedback Submitted",
                description: "Thank you for your feedback! We'll review it soon.",
            });

            setFeedback("");
            setOpen(false);
        } catch (error) {
            console.error("Error submitting feedback:", error);
            toast({
                title: "Error",
                description: "Failed to submit feedback. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Give Feedback
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Share Your Feedback
                    </DialogTitle>
                    <DialogDescription>
                        Help us improve Builddrr by sharing your thoughts, suggestions, or reporting issues.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Textarea
                        placeholder="Tell us what you think... What's working well? What could be better? Any bugs you've encountered?"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="min-h-[120px] resize-none"
                        disabled={isSubmitting}
                    />
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !feedback.trim()}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Feedback
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
