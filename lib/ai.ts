import { GenerateWebsiteParams, userPrompt } from "./prompts/user";
import { generateServerFiles } from "./server"; // Import server generation logic
import queryAI from "./services/code-generator";

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

  const prompt = userPrompt({ businessName, description, colors, components })

  const generatedContent = await queryAI(prompt)

  generateServerFiles(generatedContent)

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