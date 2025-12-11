import { ReactNode } from "react";
import { useSubscriptionFeatures, FeatureKey } from "@/hooks/useSubscriptionFeatures";
import { UpgradePrompt } from "./UpgradePrompt";

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  promptVariant?: "card" | "inline" | "banner";
}

/**
 * FeatureGate component that conditionally renders children based on subscription plan.
 * If the user doesn't have access to the feature, it shows an upgrade prompt.
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  promptVariant = "card",
}: FeatureGateProps) {
  const { hasFeature, getRequiredPlan } = useSubscriptionFeatures();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt 
        feature={feature} 
        requiredPlan={getRequiredPlan(feature)}
        variant={promptVariant}
      />
    );
  }

  return null;
}
