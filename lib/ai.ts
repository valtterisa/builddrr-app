import generateValidSectionCode from "./services/code-quality";

interface GenerateWebsiteParams {
  businessName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  components: any[];
}

interface WebsiteState {
  lastGenerated: string;
  components: any[];
  businessInfo: {
    name: string;
    description: string;
  };
  design: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

export async function generateWebsite({
  businessName,
  description,
  colors,
  components,
}: GenerateWebsiteParams) {
  const prompt = `Create a modern, visually stunning website for "${businessName}". Follow these strict requirements:

Business Description: ${description}

Color Scheme (use these EXACT colors):
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}

Design Requirements:
- Use clean, modern design principles with ample white space
- Implement smooth animations using framer-motion
- Create responsive layouts that work perfectly on all devices
- Use shadcn/ui components for consistency and polish
- Implement proper semantic HTML structure
- Ensure all interactive elements have hover states
- Use professional typography with proper hierarchy
- Include subtle animations for enhanced user experience

Required Components:
- Header (with responsive navigation)
- Footer (with proper site structure)
${components.map((component: any) => `- ${component.name}: ${component.description}`).join("\n")}

Technical Requirements:
- Use "use client" directive for client components
- Implement proper TypeScript types
- Use proper aria-labels and semantic HTML
- Implement smooth scroll behaviors
- Ensure all components are properly animated
- Use proper error handling and loading states
- Implement proper responsive design patterns

The output must be production-ready, visually stunning websites that can win design awards.`;

  console.log("Enhanced AI Prompt:", prompt);

  const generatedContent = await generateValidSectionCode(prompt);

  console.log("Generated Content:", generatedContent);

  return generatedContent;
}

export function getStoredWebsiteState(): WebsiteState | null {
  const stored = localStorage.getItem('websiteState');
  return stored ? JSON.parse(stored) : null;
}

export function clearStoredWebsiteState(): void {
  localStorage.removeItem('websiteState');
}

// const enhancedPrompt = `${systemPrompt}

// Implementation Requirements:
// 1. Each component MUST be implemented exactly as specified
// 2. Generated code MUST be production-ready with NO TODOs or placeholders
// 3. All provided colors MUST be used exactly as specified
// 4. Error handling MUST be implemented for all user interactions
// 5. Loading states MUST be visually polished with proper animations

// ${prompt}

// Remember: The output must be production-ready, visually stunning, and be able to win design awards.`;
