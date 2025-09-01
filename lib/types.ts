// AI Usage Types
export type AIUsageType = "chat";

export interface AIUsage {
  id: string;
  user_id: string;
  website_id?: string;
  usage_type: AIUsageType;
  tokens_used: number;
  requests_count: number;
  cost_usd: number;
  created_at: string;
  updated_at: string;
}

export interface AIUsageLimit {
  id: string;
  plan_name: "free" | "pro" | "enterprise";
  monthly_chat_requests: number;
  monthly_content_generation_requests: number;
  monthly_code_generation_requests: number;
  monthly_image_generation_requests: number;
  monthly_token_limit: number;
  created_at: string;
  updated_at: string;
}

export interface AIUsageSummary {
  usage_type: AIUsageType;
  total_requests: number;
  total_tokens: number;
  total_cost: number;
}

export interface AIUsageLimitCheck {
  plan_name: string;
  usage_type: AIUsageType;
  current_usage: number;
  limit_value: number;
  is_exceeded: boolean;
}

export interface PlanLimits {
  free: AIUsageLimit;
  pro: AIUsageLimit;
  enterprise: AIUsageLimit;
}
