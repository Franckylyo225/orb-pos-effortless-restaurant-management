import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscriptionFeatures, PlanLimits, PLAN_PRICING } from "@/hooks/useSubscriptionFeatures";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, ArrowRight } from "lucide-react";

interface LimitGateProps {
  limitType: keyof PlanLimits;
  currentCount: number;
  children: ReactNode;
  onLimitReached?: () => void;
  customMessage?: string;
}

const LIMIT_LABELS: Record<keyof PlanLimits, { singular: string; plural: string }> = {
  maxTeamMembers: { singular: "membre d'équipe", plural: "membres d'équipe" },
  maxRestaurants: { singular: "restaurant", plural: "restaurants" },
  maxTables: { singular: "table", plural: "tables" },
};

/**
 * LimitGate component that conditionally renders children based on plan limits.
 * If the user has reached their limit, it shows an upgrade message.
 */
export function LimitGate({
  limitType,
  currentCount,
  children,
  onLimitReached,
  customMessage,
}: LimitGateProps) {
  const navigate = useNavigate();
  const { isWithinLimit, limits, currentPlan, getNextPlan } = useSubscriptionFeatures();

  if (isWithinLimit(limitType, currentCount)) {
    return <>{children}</>;
  }

  const nextPlan = getNextPlan();
  const nextPlanInfo = nextPlan ? PLAN_PRICING[nextPlan] : null;
  const limitLabel = LIMIT_LABELS[limitType];
  const limit = limits[limitType];

  const handleUpgrade = () => {
    if (onLimitReached) {
      onLimitReached();
    }
    navigate("/dashboard/subscription");
  };

  const message = customMessage || 
    `Vous avez atteint la limite de ${limit} ${limit > 1 ? limitLabel.plural : limitLabel.singular} pour le plan ${currentPlan}.`;

  return (
    <Card className="border-amber-500/20 bg-amber-500/5">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-600">Limite atteinte</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {message}
            </p>
            {nextPlanInfo && (
              <Button className="mt-3 gap-2" size="sm" onClick={handleUpgrade}>
                Passer au plan {nextPlanInfo.name}
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
