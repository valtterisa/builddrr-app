"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ContentInputStep from "./funnel-steps/content-input-step";
import PlatformSelectionStep from "./funnel-steps/platform-selection-step";
import ContentDetailsStep from "./funnel-steps/content-details-step";
import ReviewPublishStep from "./funnel-steps/review-publish-step";
import SocialMediaPreview from "./social-media-preview";
import { useRouter } from "next/navigation";

type ContentType = "text" | "image" | "video" | "link" | "mixed";
type Platform = {
  id: string;
  name: string;
  accounts: { id: string; name: string; avatar: string }[];
};

export type ContentCreationState = {
  contentType: ContentType;
  content: string;
  media: string[];
  platforms: string[];
  selectedAccounts: Record<string, string[]>; // platform id -> account ids
  platformSpecificContent: Record<string, string>; // platform id -> content
  useUnifiedContent: boolean;
  hashtags: string[];
  scheduledDate?: Date;
  isScheduled: boolean;
};

export default function ContentCreationFunnel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState<ContentCreationState>({
    contentType: "text",
    content: "",
    media: [],
    platforms: [],
    selectedAccounts: {},
    platformSpecificContent: {},
    useUnifiedContent: true,
    hashtags: [],
    isScheduled: false,
  });
  const router = useRouter();

  const steps = [
    { title: "Content Input", component: ContentInputStep },
    { title: "Platform Selection", component: PlatformSelectionStep },
    {
      title: "Content Details",
      component: ContentDetailsStep,
      // Skip this step for text-only posts handled in step 1
      shouldSkip: () =>
        state.contentType === "text" && state.media.length === 0,
    },
    { title: "Review & Publish", component: ReviewPublishStep },
  ];

  // Filter out steps that should be skipped
  const activeSteps = steps.filter((step) => !step.shouldSkip?.());

  const goToNextStep = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateState = (updates: Partial<ContentCreationState>) => {
    setState({ ...state, ...updates });
  };

  const handlePublish = () => {
    // In a real app, this would send the content to an API
    console.log("Publishing content:", state);

    // After successful publishing, you could redirect the user
    // For now, we'll just let the modal handle the UI feedback
  };

  const CurrentStepComponent = activeSteps[currentStep].component;

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    if (currentStep === 0) {
      // Content Input step validation
      return (
        state.contentType === "text" &&
        state.content.trim() === "" &&
        state.media.length === 0
      );
    } else if (currentStep === 1) {
      // Platform Selection step validation
      return (
        state.platforms.length === 0 ||
        state.platforms.some(
          (platform) => state.selectedAccounts[platform]?.length === 0
        )
      );
    }
    return false;
  };

  // Determine if the current step is the last step
  const isLastStep = currentStep === activeSteps.length - 1;

  // Get the combined content for preview (including hashtags)
  const getPreviewContent = () => {
    const hashtagString =
      state.hashtags.length > 0
        ? " " + state.hashtags.map((tag) => `#${tag}`).join(" ")
        : "";
    return state.content + hashtagString;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          {/* Step Indicator */}
          <div className="bg-muted px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              {activeSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                      index < currentStep
                        ? "bg-purple-600 text-white"
                        : index === currentStep
                          ? "bg-purple-100 text-purple-600 border-2 border-purple-600"
                          : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div
                    className={cn(
                      "ml-2 text-sm font-medium",
                      index === currentStep
                        ? "text-purple-600"
                        : "text-gray-500"
                    )}
                  >
                    {step.title}
                  </div>
                  {index < activeSteps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 h-0.5 mx-2",
                        index < currentStep ? "bg-purple-600" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Current Step Content */}
          <div className="p-6">
            {currentStep === activeSteps.length - 1 ? (
              <ReviewPublishStep
                state={state}
                updateState={updateState}
                onPublish={handlePublish}
              />
            ) : (
              <CurrentStepComponent
                state={state}
                updateState={updateState}
                onPublish={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 border-t flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {isLastStep ? (
              <Button
                onClick={handlePublish}
                disabled={false} // Add validation if needed
              >
                {state.isScheduled ? "Schedule Post" : "Publish Now"}
              </Button>
            ) : (
              <Button onClick={goToNextStep} disabled={isNextDisabled()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="lg:col-span-1">
        <Card className="overflow-hidden">
          <div className="bg-muted px-4 py-3 border-b">
            <h3 className="text-sm font-medium">Content Preview</h3>
          </div>
          <div className="p-4">
            <SocialMediaPreview
              content={getPreviewContent()}
              media={state.media}
              platforms={state.platforms}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
