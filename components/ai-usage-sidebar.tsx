"use client";

// Note: AI usage now handled via server actions in lib/actions/ai-usage.ts
import { useState, useEffect } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { checkCurrentUsageLimits } from "@/lib/actions/ai-usage";
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
  const { plan, isActive } = useSubscription();
  const router = useRouter();

  // State for AI usage data
  const [limits, setLimits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load usage data on mount
  useEffect(() => {
    const loadUsageData = async () => {
      try {
        setIsLoading(true);
        const result = await checkCurrentUsageLimits();
        if (result.error) {
          setError(result.error);
        } else {
          setLimits(result.limits);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load usage data");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsageData();
  }, []);

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
  if (!limits || !plan) {
    console.log("AI Usage Sidebar Debug:", { limits, plan });
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

  const hasExceededLimits = limits.some((limit) => limit.is_exceeded);
  const isEnterprise = plan === "enterprise";

  // Get chat usage data from limits array (server action returns limits with usage info)
  const chatLimit = limits.find((limit) => limit.usage_type === "chat");
  const chatUsage = chatLimit?.current_usage || 0;
  const chatLimitValue = chatLimit?.limit_value || 0;
  const chatPercentage =
    chatLimitValue === -1
      ? 0
      : Math.min((chatUsage / chatLimitValue) * 100, 100);

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
          <Zap className="h-4 w-4 " />
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
            {chatUsage} / {formatLimit(chatLimitValue)}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full transition-all ${getUsageColor(chatPercentage)}`}
            style={{ width: `${chatPercentage}%` }}
          />
        </div>
      </div>

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
