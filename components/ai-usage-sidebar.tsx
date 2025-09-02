"use client";

import { useAIUsage } from "@/hooks/use-ai-usage";
import { useSubscription } from "@/hooks/use-subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, MessageSquare, ArrowUpRight } from "lucide-react";
import { AIUsageType } from "@/lib/types";
import { useRouter } from "next/navigation";

const usageTypeIcons = {
  chat: MessageSquare,
};

const usageTypeLabels = {
  chat: "Chat Messages",
};

export function AIUsageSidebar() {
  const { usage, limits, planLimits, isLoading, error } = useAIUsage();
  const { plan, isActive } = useSubscription();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
          </div>
          <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">AI Usage</span>
        </div>
        <div className="text-xs text-red-500">Failed to load AI usage</div>
      </div>
    );
  }

  // Add safety checks for undefined values
  if (!usage || !limits || !planLimits || !plan) {
    console.log("AI Usage Sidebar Debug:", { usage, limits, planLimits, plan });
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">AI Usage</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {!plan ? "Loading plan..." : "Loading usage data..."}
        </div>
      </div>
    );
  }

  const currentPlan = planLimits[plan as keyof typeof planLimits];

  // Additional safety check for currentPlan
  if (!currentPlan) {
    console.log("AI Usage Sidebar Debug - No currentPlan:", {
      plan,
      planLimits,
      currentPlan,
    });
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">AI Usage</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Plan data not available for: {plan}
        </div>
      </div>
    );
  }

  const hasExceededLimits = limits.some((limit) => limit.is_exceeded);
  const isEnterprise = plan === "enterprise";

  // Get chat usage data
  const chatUsage =
    usage.find((u) => u.usage_type === "chat")?.total_requests || 0;
  const chatLimit = currentPlan.monthly_chat_requests;
  const chatPercentage =
    chatLimit === -1 ? 0 : Math.min((chatUsage / chatLimit) * 100, 100);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return "∞";
    return limit.toLocaleString();
  };

  return (
    <div className="px-4 py-3 border-t border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">AI Usage</span>
        </div>
        <Badge
          variant={isEnterprise ? "default" : "secondary"}
          className="text-xs"
        >
          {plan}
        </Badge>
      </div>

      {/* Chat Usage Bar */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Chat Messages</span>
          </div>
          <span className="font-medium">
            {chatUsage} / {formatLimit(chatLimit)}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full transition-all ${getUsageColor(chatPercentage)}`}
            style={{ width: `${chatPercentage}%` }}
          />
        </div>
      </div>

      {/* Warning Badge */}
      {hasExceededLimits && (
        <div className="mb-3">
          <Badge
            variant="destructive"
            className="w-full justify-center text-xs"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Limit Exceeded
          </Badge>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-border">
        {hasExceededLimits ? (
          <Button
            size="sm"
            className="w-full text-xs"
            variant="default"
            onClick={() => router.push("/dashboard/account/billing")}
          >
            Upgrade Plan
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        ) : !isEnterprise ? (
          <Button
            size="sm"
            className="w-full text-xs"
            variant="outline"
            onClick={() => router.push("/dashboard/account/billing")}
          >
            View Plans
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
