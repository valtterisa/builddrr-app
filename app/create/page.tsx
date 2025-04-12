"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, Palette, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";

const steps = [
  {
    id: "business-info",
    title: "Tell us about your business",
    description:
      "We'll use this information to create a website that perfectly represents your brand.",
  },
  {
    id: "style",
    title: "Choose your style",
    description:
      "Select colors and design preferences that match your brand identity.",
  },
  {
    id: "preview",
    title: "Preview & Generate",
    description: "Review your choices and let our AI create your website.",
  },
];

const colorOptions = [
  {
    name: "Modern",
    colors: {
      primary: "#6366F1",
      secondary: "#8B5CF6",
      accent: "#EC4899",
    },
  },
  {
    name: "Professional",
    colors: {
      primary: "#2563EB",
      secondary: "#3B82F6",
      accent: "#10B981",
    },
  },
  {
    name: "Creative",
    colors: {
      primary: "#EC4899",
      secondary: "#F43F5E",
      accent: "#F59E0B",
    },
  },
  {
    name: "Elegant",
    colors: {
      primary: "#10B981",
      secondary: "#059669",
      accent: "#6366F1",
    },
  },
  {
    name: "Bold",
    colors: {
      primary: "#F59E0B",
      secondary: "#D97706",
      accent: "#EC4899",
    },
  },
  {
    name: "Minimal",
    colors: {
      primary: "#6B7280",
      secondary: "#4B5563",
      accent: "#9CA3AF",
    },
  },
];

const loadingSteps = [
  {
    title: "Analyzing your business",
    description: "Understanding your brand and creating a unique identity",
  },
  {
    title: "Designing your website",
    description: "Applying your chosen colors and creating a beautiful layout",
  },
  {
    title: "Generating content",
    description: "Writing engaging copy and creating sections for your website",
  },
  {
    title: "Finalizing your website",
    description: "Putting everything together and preparing for launch",
  },
];

export default function CreatePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomColors, setShowCustomColors] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<
    "primary" | "secondary" | "accent" | null
  >(null);
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    selectedColors: colorOptions[0],
    customColors: {
      primary: "#6366F1",
      secondary: "#8B5CF6",
      accent: "#EC4899",
    },
  });
  const [errors, setErrors] = useState({
    businessName: "",
    description: "",
  });

  const validateStep = () => {
    const newErrors = {
      businessName: "",
      description: "",
    };

    if (currentStep === 0) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Business description is required";
      }
    }

    setErrors(newErrors);
    return !newErrors.businessName && !newErrors.description;
  };

  const handleNext = () => {
    if (currentStep === 0 && !validateStep()) {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/");
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Mock API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Mock response
      const mockResponse = {
        id: "mock-website-id",
        name: formData.businessName,
        description: formData.description,
        colors: showCustomColors
          ? formData.customColors
          : formData.selectedColors.colors,
        content: {
          sections: [
            {
              type: "hero",
              title: "Welcome to " + formData.businessName,
              content: "Your business description will go here",
              cta: "Get Started",
              image: "hero-image.jpg",
            },
            {
              type: "about",
              title: "About Us",
              content: formData.description,
              cta: "Learn More",
              image: "about-image.jpg",
            },
            {
              type: "services",
              title: "Our Services",
              content: "Detailed services description",
              cta: "View Services",
              image: "services-image.jpg",
            },
            {
              type: "contact",
              title: "Get in Touch",
              content: "Contact information and form",
              cta: "Contact Us",
              image: "contact-image.jpg",
            },
          ],
        },
      };

      // Simulate storing in database
      console.log("Mock website created:", mockResponse);

      // Redirect to editor with mock ID
      // router.push(`/editor/${mockResponse.id}`);
      router.push(`/website/editor`);
    } catch (error) {
      toast.error("Failed to generate website. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleColorChange = (
    color: string,
    type: "primary" | "secondary" | "accent"
  ) => {
    setFormData((prev) => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [type]: color,
      },
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Name
              </label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Enter your business name"
                className={`w-full ${errors.businessName ? "border-red-500" : ""
                  }`}
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.businessName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your business, products, or services"
                className={`min-h-[150px] ${errors.description ? "border-red-500" : ""
                  }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {colorOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      selectedColors: option,
                    }));
                    setShowCustomColors(false);
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${!showCustomColors &&
                    formData.selectedColors.name === option.name
                    ? "border-purple-500 ring-2 ring-purple-200"
                    : "border-gray-200 hover:border-purple-300"
                    }`}
                >
                  <div className="space-y-2">
                    <div
                      className="h-8 rounded-md"
                      style={{ backgroundColor: option.colors.primary }}
                    />
                    <div
                      className="h-8 rounded-md"
                      style={{ backgroundColor: option.colors.secondary }}
                    />
                    <div
                      className="h-8 rounded-md"
                      style={{ backgroundColor: option.colors.accent }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-2">
                    {option.name}
                  </div>
                </button>
              ))}
              <button
                onClick={() => setShowCustomColors(true)}
                className={`p-4 rounded-lg border-2 transition-all ${showCustomColors
                  ? "border-purple-500 ring-2 ring-purple-200"
                  : "border-gray-200 hover:border-purple-300"
                  }`}
              >
                <div className="h-24 rounded-md mb-2 bg-gray-100 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Custom Colors
                </div>
              </button>
            </div>

            {showCustomColors && (
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {(["primary", "secondary", "accent"] as const).map((type) => (
                    <div key={type} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {type.charAt(0).toUpperCase() + type.slice(1)} Color
                      </label>
                      <div className="relative">
                        <button
                          onClick={() => setActiveColorPicker(type)}
                          className="w-full h-10 rounded-md border-2 border-gray-200"
                          style={{
                            backgroundColor: formData.customColors[type],
                          }}
                        />
                        {activeColorPicker === type && (
                          <div className="absolute top-12 left-0 z-10">
                            <HexColorPicker
                              color={formData.customColors[type]}
                              onChange={(color) =>
                                handleColorChange(color, type)
                              }
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.customColors[type]}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-2 h-32">
                    <div
                      className="rounded-l-lg"
                      style={{ backgroundColor: formData.customColors.primary }}
                    />
                    <div
                      className=""
                      style={{
                        backgroundColor: formData.customColors.secondary,
                      }}
                    />
                    <div
                      className="rounded-r-lg"
                      style={{ backgroundColor: formData.customColors.accent }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium text-gray-900 mb-2">
                Business Information
              </h3>
              <p className="text-gray-600">{formData.businessName}</p>
              <p className="text-gray-600 mt-2">{formData.description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium text-gray-900 mb-2">Selected Style</h3>
              <div className="flex items-center gap-2">
                <div className="grid grid-cols-3 gap-1 w-24">
                  <div
                    className="h-6 rounded"
                    style={{
                      backgroundColor: showCustomColors
                        ? formData.customColors.primary
                        : formData.selectedColors.colors.primary,
                    }}
                  />
                  <div
                    className="h-6 rounded"
                    style={{
                      backgroundColor: showCustomColors
                        ? formData.customColors.secondary
                        : formData.selectedColors.colors.secondary,
                    }}
                  />
                  <div
                    className="h-6 rounded"
                    style={{
                      backgroundColor: showCustomColors
                        ? formData.customColors.accent
                        : formData.selectedColors.colors.accent,
                    }}
                  />
                </div>
                <span className="text-gray-600">
                  {showCustomColors
                    ? "Custom Colors"
                    : formData.selectedColors.name}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Loader2 className="h-12 w-12 text-purple-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">
              Creating your website
            </h1>
            <p className="text-gray-600 mt-2">
              We're working hard to create your perfect website
            </p>
          </div>

          <div className="space-y-6">
            {loadingSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-medium">
                      {index + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 4, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              This usually takes about 30 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? "flex-1" : ""
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${index < currentStep ? "bg-purple-600" : "bg-gray-200"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 mb-6">
                  {steps[currentStep].description}
                </p>
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {currentStep === 0 ? "Back to Home" : "Previous"}
              </Button>
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 gap-2"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  "Generate Website"
                ) : (
                  <>
                    Next <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
