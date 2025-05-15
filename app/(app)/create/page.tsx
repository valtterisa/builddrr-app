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
import { createClient } from "@/lib/supabase/client";
import { createAndDeployWebsite } from "@/lib/website-generator/website-creator";

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
    description: "Select colors that match your brand identity.",
  },
  {
    id: "components",
    title: "Choose website components",
    description: "Select the features and sections you want on your website.",
  },
  {
    id: "preview",
    title: "Review & Generate",
    description: "Review your choices and let our AI create your website.",
  },
];

const industries = [
  { id: "retail", name: "Retail & E-commerce" },
  { id: "services", name: "Professional Services" },
  { id: "tech", name: "Technology" },
  { id: "health", name: "Healthcare & Wellness" },
  { id: "food", name: "Food & Hospitality" },
  { id: "education", name: "Education & Training" },
  { id: "creative", name: "Creative & Design" },
  { id: "real-estate", name: "Real Estate" },
  { id: "nonprofit", name: "Nonprofit & Community" },
  { id: "other", name: "Other" },
];

const componentOptions = [
  {
    id: "contact-form",
    name: "Contact Form",
    description: "Let visitors get in touch with you",
  },
  {
    id: "blog",
    name: "Blog Section",
    description: "Share updates and articles",
  },
  {
    id: "testimonials",
    name: "Testimonials",
    description: "Display customer reviews",
  },
  {
    id: "gallery",
    name: "Image Gallery",
    description: "Showcase your work or products",
  },
  {
    id: "pricing",
    name: "Pricing Tables",
    description: "Display your pricing plans",
  },
  {
    id: "team",
    name: "Team Section",
    description: "Introduce your team members",
  },
  { id: "faq", name: "FAQ Section", description: "Answer common questions" },
  {
    id: "newsletter",
    name: "Newsletter Signup",
    description: "Collect email subscribers",
  },
  {
    id: "social",
    name: "Social Media Feed",
    description: "Display your social media posts",
  },
  {
    id: "map",
    name: "Location Map",
    description: "Show your physical location",
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

// Helper to slugify a string
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^a-z0-9-]/g, "") // Remove all non-alphanumeric except -
    .replace(/-+/g, "-") // Replace multiple - with single -
    .replace(/^-+|-+$/g, ""); // Trim - from start/end
}

// Helper to construct unique url
function constructWebsiteUrl(name: string, uuid: string): string {
  const slug = slugify(name);
  const shortId = uuid.split("-")[0];
  return `/site/${slug}-${shortId}`;
}

function randomString(length: number) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function getUniqueWebsiteUrl(
  supabase: ReturnType<typeof createClient>,
  name: string,
  uuid: string,
  maxAttempts = 5
): Promise<string> {
  let baseUrl = constructWebsiteUrl(name, uuid);
  let url = baseUrl;
  let attempt = 0;
  while (attempt < maxAttempts) {
    const { data, error } = await supabase
      .from("my_websites")
      .select("id")
      .eq("url", url)
      .maybeSingle();
    if (!data) {
      return url;
    }
    // If exists, append random string
    url = `${baseUrl}-${randomString(4)}`;
    attempt++;
  }
  throw new Error(
    "Could not generate a unique URL for your website. Please try again."
  );
}

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
    industry: "",
    selectedColors: colorOptions[0],
    customColors: {
      primary: "#6366F1",
      secondary: "#8B5CF6",
      accent: "#EC4899",
    },
    selectedComponents: [] as string[],
  });

  const [errors, setErrors] = useState({
    businessName: "",
    description: "",
    industry: "",
  });

  const MAX_DESCRIPTION_LENGTH = 500;

  const validateStep = () => {
    const newErrors = {
      businessName: "",
      description: "",
      industry: "",
    };

    if (currentStep === 0) {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Business description is required";
      }
      if (!formData.industry) {
        newErrors.industry = "Please select an industry";
      }
      if (formData.description.length > MAX_DESCRIPTION_LENGTH) {
        newErrors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
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
    const colors = showCustomColors
      ? formData.customColors
      : formData.selectedColors.colors;

    try {
      // Get the authenticated user
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("User not authenticated");

      // Use our unified createAndDeployWebsite function
      const websiteData = {
        name: formData.businessName,
        description: formData.description,
        industry: formData.industry,
        colors: colors,
        components: formData.selectedComponents,
      };

      // Call our unified website creation function
      const result = await createAndDeployWebsite(userData.user.id, websiteData);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to generate website");
      }

      console.log("Website created successfully:", result.data);

      // Store data in localStorage for editor
      localStorage.setItem("currentWebsiteId", result.data.websiteId);

      // Redirect to editor for the new website
      router.push(`/website/editor/${result.data.websiteId}`);
    } catch (error) {
      console.error("Error generating website:", error);
      toast.error("Failed to generate website. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
                className={`w-full ${errors.businessName ? "border-red-500" : ""}`}
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
                className={`min-h-[150px] ${errors.description ? "border-red-500" : ""}`}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>
                  {formData.description.length}/{MAX_DESCRIPTION_LENGTH}{" "}
                  characters
                </span>
                <span
                  className={
                    formData.description.length > MAX_DESCRIPTION_LENGTH
                      ? "text-red-500"
                      : ""
                  }
                >
                  {MAX_DESCRIPTION_LENGTH - formData.description.length}{" "}
                  characters remaining
                </span>
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Industry
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        industry: industry.id,
                      }))
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.industry === industry.id
                        ? "border-purple-500 ring-2 ring-purple-200 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {industry.name}
                    </div>
                  </button>
                ))}
              </div>
              {errors.industry && (
                <p className="mt-2 text-sm text-red-500">{errors.industry}</p>
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
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !showCustomColors &&
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
                className={`p-4 rounded-lg border-2 transition-all ${
                  showCustomColors
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {componentOptions.map((component) => (
                <div
                  key={component.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    formData.selectedComponents.includes(component.id)
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      selectedComponents: prev.selectedComponents.includes(
                        component.id
                      )
                        ? prev.selectedComponents.filter(
                            (id) => id !== component.id
                          )
                        : [...prev.selectedComponents, component.id],
                    }));
                  }}
                >
                  <h3 className="font-medium text-gray-900">
                    {component.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {component.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium text-gray-900 mb-4">
                Business Information
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Business Name
                  </h4>
                  <p className="text-gray-900 mt-1">{formData.businessName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Description
                  </h4>
                  <p className="text-gray-900 mt-1">{formData.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Industry
                  </h4>
                  <p className="text-gray-900 mt-1">
                    {industries.find((i) => i.id === formData.industry)?.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium text-gray-900 mb-4">Design Style</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">
                    Color Scheme
                  </h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="grid grid-cols-3 gap-2 w-32">
                      <div
                        className="h-8 rounded"
                        style={{
                          backgroundColor: showCustomColors
                            ? formData.customColors.primary
                            : formData.selectedColors.colors.primary,
                        }}
                      />
                      <div
                        className="h-8 rounded"
                        style={{
                          backgroundColor: showCustomColors
                            ? formData.customColors.secondary
                            : formData.selectedColors.colors.secondary,
                        }}
                      />
                      <div
                        className="h-8 rounded"
                        style={{
                          backgroundColor: showCustomColors
                            ? formData.customColors.accent
                            : formData.selectedColors.colors.accent,
                        }}
                      />
                    </div>
                    <span className="text-gray-900">
                      {showCustomColors
                        ? "Custom Colors"
                        : formData.selectedColors.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-medium text-gray-900 mb-4">
                Selected Components
              </h3>
              {formData.selectedComponents.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {formData.selectedComponents.map((componentId) => {
                    const component = componentOptions.find(
                      (c) => c.id === componentId
                    );
                    return (
                      <div key={componentId} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {component?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {component?.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No components selected</p>
              )}
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
                transition={{ duration: 60, ease: "easeInOut" }}
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
                  className={`flex items-center ${
                    index < steps.length - 1 ? "flex-1" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStep ? "bg-purple-600" : "bg-gray-200"
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


