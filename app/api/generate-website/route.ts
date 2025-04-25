import { NextRequest, NextResponse } from "next/server";
import generateValidSectionCode from "@/lib/services/code-quality";
import { userPrompt } from "@/lib/prompts/user";
import { generateAIResponse } from "@/app/actions";

export async function POST(request: NextRequest) {
  try {
    const websiteData = await request.json();

    const prompt = userPrompt({
      businessName: websiteData.businessInfo.name,
      description: websiteData.businessInfo.description,
      colors: websiteData.design.colors,
      components: websiteData.components,
    });

    // Query AI and get streaming response
    const generatedContent = await generateAIResponse(prompt);

    console.log("Generated Content:", generatedContent);

    return NextResponse.json({ data: generatedContent });
  } catch (error) {
    console.error("Error generating website:", error);
    return NextResponse.json(
      { error: "Failed to generate website content" },
      { status: 500 }
    );
  }
}
