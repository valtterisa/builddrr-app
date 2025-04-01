import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { businessName, description, industry, style, features } = await request.json()

    // Create a prompt for the AI to generate website content
    const prompt = `
      Generate content for a one-page business website with the following details:
      
      Business Name: ${businessName}
      Description: ${description}
      Industry: ${industry}
      Style: ${style}
      Features: ${Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature)
        .join(", ")}
      
      Please provide the following sections:
      1. A compelling headline
      2. A brief about us section (2-3 paragraphs)
      3. ${features.services ? "A services/products section with 3-4 items" : ""}
      4. ${features.testimonials ? "Three customer testimonials" : ""}
      
      Format the response as a JSON object with the following structure:
      {
        "headline": "string",
        "aboutUs": "string",
        "services": [{ "name": "string", "description": "string", "price": "string" }],
        "testimonials": [{ "name": "string", "role": "string", "content": "string" }]
      }
    `

    // Generate content using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    })

    // Parse the generated content
    const generatedContent = JSON.parse(text)

    return NextResponse.json({
      success: true,
      content: generatedContent,
    })
  } catch (error) {
    console.error("Error generating website content:", error)
    return NextResponse.json({ success: false, error: "Failed to generate website content" }, { status: 500 })
  }
}

