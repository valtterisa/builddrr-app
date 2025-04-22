export interface GenerateWebsiteParams {
    businessName: string;
    description: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    components: any[];
}

export const userPrompt = ({ businessName, description, colors, components }: GenerateWebsiteParams) => `
<business-name>
${businessName}
</business-name>

<business-description>
${description}
</business-description>

<color-scheme>
<primary>${colors.primary}</primary>
<secondary>${colors.secondary}</secondary>
<accent>${colors.accent}</accent>
</color-scheme>

<required-components>
- Header (with responsive navigation)
- Footer (with proper site structure)
- Hero
${components.map((component: any) => `- ${component.name}: ${component.description}`).join("\n")}
</required-components>`;