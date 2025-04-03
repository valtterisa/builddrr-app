"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Define the steps in the onboarding process
const STEPS = [
  { id: "business", title: "Business Details" },
  { id: "features", title: "Website Features" },
  { id: "design", title: "Design Preferences" },
  { id: "templates", title: "Choose Template" },
];

// Industry options with icons/colors for visual selection
const INDUSTRIES = [
  {
    id: "technology",
    name: "Technology",
    color: "bg-blue-100 border-blue-300 text-blue-700",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    color: "bg-green-100 border-green-300 text-green-700",
  },
  {
    id: "education",
    name: "Education",
    color: "bg-yellow-100 border-yellow-300 text-yellow-700",
  },
  {
    id: "food",
    name: "Food & Restaurant",
    color: "bg-orange-100 border-orange-300 text-orange-700",
  },
  {
    id: "retail",
    name: "Retail",
    color: "bg-pink-100 border-pink-300 text-pink-700",
  },
  {
    id: "services",
    name: "Professional Services",
    color: "bg-purple-100 border-purple-300 text-purple-700",
  },
  {
    id: "realestate",
    name: "Real Estate",
    color: "bg-indigo-100 border-indigo-300 text-indigo-700",
  },
  {
    id: "fitness",
    name: "Fitness & Wellness",
    color: "bg-teal-100 border-teal-300 text-teal-700",
  },
  {
    id: "art",
    name: "Art & Design",
    color: "bg-red-100 border-red-300 text-red-700",
  },
  {
    id: "travel",
    name: "Travel & Hospitality",
    color: "bg-cyan-100 border-cyan-300 text-cyan-700",
  },
  {
    id: "other",
    name: "Other",
    color: "bg-gray-100 border-gray-300 text-gray-700",
  },
];

// Website features with descriptions
const FEATURES = [
  {
    id: "about",
    name: "About Us",
    description: "Company information and history",
  },
  {
    id: "services",
    name: "Services",
    description: "Products or services you offer",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Showcase your work or products",
  },
  {
    id: "testimonials",
    name: "Testimonials",
    description: "Customer reviews and feedback",
  },
  { id: "team", name: "Team", description: "Introduce your team members" },
  { id: "pricing", name: "Pricing", description: "Display your pricing plans" },
  { id: "blog", name: "Blog", description: "Share news and articles" },
  {
    id: "contact",
    name: "Contact",
    description: "Contact information and form",
  },
  { id: "faq", name: "FAQ", description: "Frequently asked questions" },
];

// Design styles with visual examples
const DESIGN_STYLES = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean, minimal, and contemporary",
  },
  { id: "classic", name: "Classic", description: "Timeless and traditional" },
  { id: "bold", name: "Bold", description: "Striking and attention-grabbing" },
  { id: "elegant", name: "Elegant", description: "Sophisticated and refined" },
  { id: "playful", name: "Playful", description: "Fun and creative" },
];

// Color schemes with visual examples
const COLOR_SCHEMES = [
  { id: "purple", name: "Purple", primary: "#6D28D9", secondary: "#8B5CF6" },
  { id: "blue", name: "Blue", primary: "#2563EB", secondary: "#3B82F6" },
  { id: "green", name: "Green", primary: "#059669", secondary: "#10B981" },
  { id: "orange", name: "Orange", primary: "#D97706", secondary: "#F59E0B" },
  { id: "red", name: "Red", primary: "#DC2626", secondary: "#EF4444" },
  { id: "pink", name: "Pink", primary: "#DB2777", secondary: "#EC4899" },
  { id: "gray", name: "Gray", primary: "#4B5563", secondary: "#6B7280" },
];

// Initial form state
const initialFormState = {
  businessName: "",
  industry: "",
  description: "",
  features: ["about", "services", "contact"],
  designStyle: "modern",
  colorScheme: "purple",
  selectedTemplate: 0,
};

export default function AICreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<any[]>([]);

  // Load saved form data from localStorage on initial load
  useEffect(() => {
    const savedData = localStorage.getItem("aiOnboardingData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);

        // If they already completed some steps, take them to where they left off
        if (parsedData.industry && currentStep === 0) {
          setCurrentStep(1);
        }
        if (parsedData.features.length > 0 && currentStep === 1) {
          setCurrentStep(2);
        }
        if (parsedData.designStyle && currentStep === 2) {
          setCurrentStep(3);
        }
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("aiOnboardingData", JSON.stringify(formData));
  }, [formData]);

  // Generate templates when reaching the template selection step
  useEffect(() => {
    if (currentStep === 3 && templates.length === 0) {
      generateTemplates();
    }
  }, [currentStep]);

  const generateTemplates = async () => {
    setIsLoading(true);

    try {
      // Simulate API call to generate templates
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create 3 different template variations based on user input
      const generatedTemplates = [
        {
          id: 1,
          name: `${
            formData.designStyle.charAt(0).toUpperCase() +
            formData.designStyle.slice(1)
          } Design`,
          description: `A ${formData.designStyle} website for ${
            formData.businessName
          } with a focus on ${formData.features.slice(0, 2).join(" and ")}.`,
          preview: `/placeholder.svg?height=300&width=500&text=Template+1`,
          sections: generateSections(formData, "variation1"),
        },
        {
          id: 2,
          name: `${
            formData.colorScheme.charAt(0).toUpperCase() +
            formData.colorScheme.slice(1)
          } Accent`,
          description: `A ${formData.colorScheme}-themed website highlighting your ${formData.industry} business with unique sections.`,
          preview: `/placeholder.svg?height=300&width=500&text=Template+2`,
          sections: generateSections(formData, "variation2"),
        },
        {
          id: 3,
          name: "Premium Layout",
          description: `An advanced layout for ${formData.businessName} with premium features and optimized content structure.`,
          preview: `/placeholder.svg?height=300&width=500&text=Template+3`,
          sections: generateSections(formData, "variation3"),
        },
      ];

      setTemplates(generatedTemplates);
    } catch (error) {
      console.error("Error generating templates:", error);
      toast({
        title: "Error",
        description: "Failed to generate templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate different section variations based on user input
  const generateSections = (data: typeof formData, variation: string) => {
    const sections = [];

    // Always add a hero section
    sections.push({
      id: `hero-${Date.now()}`,
      type: "hero",
      title:
        variation === "variation1"
          ? `Welcome to ${data.businessName}`
          : variation === "variation2"
          ? `${data.businessName} - ${getIndustryName(data.industry)}`
          : `Discover ${data.businessName}`,
      subtitle:
        variation === "variation1"
          ? data.description
          : variation === "variation2"
          ? `Premier ${getIndustryName(
              data.industry
            )} services tailored for you`
          : `${data.description.split(" ").slice(0, 10).join(" ")}...`,
      ctaText:
        variation === "variation1"
          ? "Learn More"
          : variation === "variation2"
          ? "Explore Services"
          : "Get Started",
      ctaLink: "#about",
    });

    // Add selected features as sections
    data.features.forEach((feature) => {
      switch (feature) {
        case "about":
          sections.push({
            id: `about-${Date.now()}`,
            type: "about",
            title:
              variation === "variation1"
                ? "About Us"
                : variation === "variation2"
                ? "Our Story"
                : "Who We Are",
            content: `We are ${
              data.businessName
            }, a leading provider in the ${getIndustryName(
              data.industry
            )} industry. ${data.description}`,
          });
          break;
        case "services":
          sections.push({
            id: `services-${Date.now()}`,
            type: "services",
            title:
              variation === "variation1"
                ? "Our Services"
                : variation === "variation2"
                ? "What We Offer"
                : "Services & Solutions",
            services: [
              {
                title:
                  variation === "variation1"
                    ? "Service 1"
                    : variation === "variation2"
                    ? "Primary Service"
                    : "Core Solution",
                description: `A premium service for ${getIndustryName(
                  data.industry
                )} clients.`,
              },
              {
                title:
                  variation === "variation1"
                    ? "Service 2"
                    : variation === "variation2"
                    ? "Secondary Service"
                    : "Advanced Option",
                description: "Tailored solutions to meet your specific needs.",
              },
              {
                title:
                  variation === "variation1"
                    ? "Service 3"
                    : variation === "variation2"
                    ? "Specialty Service"
                    : "Custom Package",
                description: "Specialized offerings for discerning customers.",
              },
            ],
          });
          break;
        case "portfolio":
          sections.push({
            id: `portfolio-${Date.now()}`,
            type: "portfolio",
            title:
              variation === "variation1"
                ? "Our Portfolio"
                : variation === "variation2"
                ? "Featured Work"
                : "Showcase",
            items: [
              {
                title: "Project 1",
                description: "Description of project 1",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Project 2",
                description: "Description of project 2",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Project 3",
                description: "Description of project 3",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                title: "Project 4",
                description: "Description of project 4",
                image: "/placeholder.svg?height=200&width=300",
              },
            ],
          });
          break;
        case "testimonials":
          sections.push({
            id: `testimonials-${Date.now()}`,
            type: "testimonials",
            title:
              variation === "variation1"
                ? "Testimonials"
                : variation === "variation2"
                ? "Client Feedback"
                : "What People Say",
            testimonials: [
              {
                name: "Client Name 1",
                role: "CEO, Company",
                text: "Excellent service and results. Highly recommended!",
              },
              {
                name: "Client Name 2",
                role: "Director, Organization",
                text: "Professional team that delivered beyond our expectations.",
              },
              {
                name: "Client Name 3",
                role: "Manager, Business",
                text: "A pleasure to work with. Will definitely use their services again.",
              },
            ],
          });
          break;
        case "contact":
          sections.push({
            id: `contact-${Date.now()}`,
            type: "contact",
            title:
              variation === "variation1"
                ? "Contact Us"
                : variation === "variation2"
                ? "Get In Touch"
                : "Reach Out",
            email: "contact@example.com",
            phone: "(123) 456-7890",
            address: "123 Main St, City, Country",
          });
          break;
        // Add other feature types as needed
      }
    });

    return sections;
  };

  const getIndustryName = (id: string) => {
    const industry = INDUSTRIES.find((ind) => ind.id === id);
    return industry ? industry.name : id;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleIndustrySelect = (industryId: string) => {
    setFormData((prev) => ({ ...prev, industry: industryId }));

    // Clear error for industry if it exists
    if (errors.industry) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.industry;
        return newErrors;
      });
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    setFormData((prev) => {
      const features = [...prev.features];

      if (features.includes(featureId)) {
        return { ...prev, features: features.filter((f) => f !== featureId) };
      } else {
        return { ...prev, features: [...features, featureId] };
      }
    });

    // Clear error for features if it exists
    if (errors.features) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.features;
        return newErrors;
      });
    }
  };

  const handleDesignStyleSelect = (styleId: string) => {
    setFormData((prev) => ({ ...prev, designStyle: styleId }));
  };

  const handleColorSchemeSelect = (schemeId: string) => {
    setFormData((prev) => ({ ...prev, colorScheme: schemeId }));
  };

  const handleTemplateSelect = (index: number) => {
    setFormData((prev) => ({ ...prev, selectedTemplate: index }));
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0: // Business Details
        if (!formData.businessName.trim()) {
          newErrors.businessName = "Business name is required";
        }

        if (!formData.industry) {
          newErrors.industry = "Please select an industry";
        }

        if (!formData.description.trim()) {
          newErrors.description = "Please provide a brief description";
        } else if (formData.description.length < 20) {
          newErrors.description =
            "Description should be at least 20 characters";
        }
        break;

      case 1: // Features
        if (formData.features.length === 0) {
          newErrors.features = "Please select at least one feature";
        }
        break;

      case 2: // Design
        if (!formData.designStyle) {
          newErrors.designStyle = "Please select a design style";
        }

        if (!formData.colorScheme) {
          newErrors.colorScheme = "Please select a color scheme";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    setIsLoading(true);

    try {
      // Get the selected template
      const selectedTemplate = templates[formData.selectedTemplate];

      // Store the complete website data in localStorage
      const websiteData = {
        ...formData,
        source: "ai",
        createdAt: new Date().toISOString(),
        sections: selectedTemplate.sections,
      };

      localStorage.setItem("websiteData", JSON.stringify(websiteData));

      // Navigate to editor
      router.push("/website/editor");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Business Details
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-base font-medium">
                Business Name
              </Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="e.g. Acme Inc., Mountain View Cafe, Bright Spark Studios"
                value={formData.businessName}
                onChange={handleInputChange}
                className={cn(
                  "border-2 p-6 text-lg",
                  errors.businessName
                    ? "border-red-300 focus:border-red-500"
                    : formData.businessName
                    ? "border-green-300 focus:border-green-500"
                    : "border-gray-200"
                )}
              />
              {errors.businessName && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.businessName}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Industry</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INDUSTRIES.map((industry) => (
                  <div
                    key={industry.id}
                    onClick={() => handleIndustrySelect(industry.id)}
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-all",
                      formData.industry === industry.id
                        ? `${industry.color} border-2 ring-2 ring-offset-2 ring-purple-300`
                        : "border-gray-200 hover:border-purple-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{industry.name}</span>
                      {formData.industry === industry.id && (
                        <Check className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.industry && (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.industry}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Business Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your business, products, or services. What makes you unique? What do you offer to customers?"
                value={formData.description}
                onChange={handleInputChange}
                className={cn(
                  "min-h-[150px] border-2 p-4 text-base",
                  errors.description
                    ? "border-red-300 focus:border-red-500"
                    : formData.description.length >= 20
                    ? "border-green-300 focus:border-green-500"
                    : "border-gray-200"
                )}
              />
              {errors.description ? (
                <div className="flex items-center text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description}
                </div>
              ) : (
                <div className="text-gray-500 text-sm mt-1">
                  {formData.description.length}/20 characters minimum
                </div>
              )}
            </div>
          </div>
        );

      case 1: // Features
        return (
          <div className="space-y-6">
            <p className="text-gray-600">
              Select the sections you want to include in your website. You can
              add or remove sections later.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  onClick={() => handleFeatureToggle(feature.id)}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all",
                    formData.features.includes(feature.id)
                      ? "bg-purple-50 border-purple-300 ring-2 ring-offset-2 ring-purple-300"
                      : "border-gray-200 hover:border-purple-200"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{feature.name}</span>
                    {formData.features.includes(feature.id) && (
                      <Check className="h-5 w-5 text-purple-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>

            {errors.features && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.features}
              </div>
            )}
          </div>
        );

      case 2: // Design
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-medium">Design Style</Label>
              <div className="grid md:grid-cols-3 gap-4">
                {DESIGN_STYLES.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => handleDesignStyleSelect(style.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      formData.designStyle === style.id
                        ? "bg-purple-50 border-purple-300 ring-2 ring-offset-2 ring-purple-300"
                        : "border-gray-200 hover:border-purple-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{style.name}</span>
                      {formData.designStyle === style.id && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{style.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Color Scheme</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COLOR_SCHEMES.map((scheme) => (
                  <div
                    key={scheme.id}
                    onClick={() => handleColorSchemeSelect(scheme.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 cursor-pointer transition-all",
                      formData.colorScheme === scheme.id
                        ? "border-purple-300 ring-2 ring-offset-2 ring-purple-300"
                        : "border-gray-200 hover:border-purple-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{scheme.name}</span>
                      {formData.colorScheme === scheme.id && (
                        <Check className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: scheme.secondary }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Templates
        return (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Generating your templates
                </h3>
                <p className="text-gray-600">
                  We're creating custom templates based on your preferences...
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-600">
                  Choose one of these templates as a starting point. You can
                  customize it further in the editor.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {templates.map((template, index) => (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(index)}
                      className={cn(
                        "rounded-lg border-2 cursor-pointer transition-all overflow-hidden",
                        formData.selectedTemplate === index
                          ? "border-purple-300 ring-2 ring-offset-2 ring-purple-300"
                          : "border-gray-200 hover:border-purple-200"
                      )}
                    >
                      <div className="relative">
                        <img
                          src={template.preview || "/placeholder.svg"}
                          alt={template.name}
                          className="w-full h-48 object-cover"
                        />
                        {formData.selectedTemplate === index && (
                          <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-full">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-700"></div>
          <span className="font-bold text-xl">SiteForge</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create with AI</h1>
          <p className="text-gray-600 mb-8">
            Tell us about your business and we'll generate a website for you
          </p>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center relative",
                    index <= currentStep ? "text-purple-600" : "text-gray-400"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                      index < currentStep
                        ? "bg-purple-600 text-white"
                        : index === currentStep
                        ? "bg-white border-2 border-purple-600 text-purple-600"
                        : "bg-white border-2 border-gray-300 text-gray-400"
                    )}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>

                  {/* Connector line */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-5 left-[calc(100%_-_10px)] h-[2px] w-[calc(100%_-_10px)]",
                        index < currentStep ? "bg-purple-600" : "bg-gray-300"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {STEPS[currentStep].title}
              </h2>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                className="gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={isLoading || templates.length === 0}
                className="gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating your website...
                  </>
                ) : (
                  <>
                    Create Website
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
