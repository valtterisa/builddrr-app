import { generateServerFiles } from "./server"; // Import server generation logic
import queryAI from "./services/code-generator";


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
  const prompt = `<user-prompt> Create a modern, visually stunning website for "${businessName}". Follow these strict requirements:

<business-description> 
${description}
</business-description> 

<color-scheme> 
(use these EXACT colors):
- Primary: ${colors.primary}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}
</color-scheme>

<required-components>

- Header (with responsive navigation)
- Footer (with proper site structure)
- Hero
${components.map((component: any) => `- ${component.name}: ${component.description}`).join("\n")}
Additional note: ALWAYS implement ALL the components listed here.
</required-components>
<user-prompt>`;

  // const generatedContent = await generateValidSectionCode(prompt);
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