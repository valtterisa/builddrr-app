/**
 * Utility functions for tracking AI usage
 * This integrates with both Polar (for billing) and Supabase (for service limits)
 */

/**
 * Track AI usage by calling the API endpoint
 * This will track usage in both Polar and Supabase
 */
export async function trackAIUsage(
  usageType: "chat",
  tokensUsed: number,
  websiteId?: string,
  polarCustomerId?: string
): Promise<{
  success: boolean;
  usageId?: string;
  polarTracked?: boolean;
  supabaseTracked?: boolean;
  limits?: any[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/ai-usage/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usageType,
        tokensUsed,
        websiteId,
        polarCustomerId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error tracking AI usage:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Estimate tokens from text (rough approximation)
 * For production, consider using a proper tokenizer like tiktoken
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters for English text
  // This is a simplified approximation - use proper tokenizer for accuracy
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens from chat messages
 */
export function estimateChatTokens(
  messages: Array<{ role: string; content: string }>
): number {
  let totalTokens = 0;

  for (const message of messages) {
    // Add tokens for the message content
    totalTokens += estimateTokens(message.content);

    // Add tokens for the role (system, user, assistant)
    totalTokens += estimateTokens(message.role);

    // Add some overhead for message formatting
    totalTokens += 10;
  }

  return totalTokens;
}

/**
 * Check if user has exceeded their usage limits
 */
export async function checkUsageLimits(): Promise<{
  hasExceeded: boolean;
  limits: any[];
  error?: string;
}> {
  try {
    // This would typically call your existing check_ai_usage_limits RPC
    // For now, we'll return a placeholder
    return {
      hasExceeded: false,
      limits: [],
    };
  } catch (error) {
    return {
      hasExceeded: false,
      limits: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
