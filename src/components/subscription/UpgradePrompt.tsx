import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Lock, 
  Sparkles, 
  ArrowRight,
  Crown,
  Zap
} from "lucide-react";
import { 
  SubscriptionPlan, 
  FeatureKey, 
  FEATURES, 
  PLAN_PRICING 
} from "@/hooks/useSubscriptionFeatures";

interface UpgradePromptProps {
  feature?: FeatureKey;
  requiredPlan?: SubscriptionPlan;
  title?: string;
  description?: string;
  variant?: "card" | "inline" | "banner";
}

export function UpgradePrompt({
  feature,
  requiredPlan,
  title,
  description,
  variant = "card",
}: UpgradePromptProps) {
  const navigate = useNavigate();

  const featureConfig = feature ? FEATURES[feature] : null;
  const plan = requiredPlan || (feature ? FEATURES[feature].plans[0] : "pro");
  const planInfo = PLAN_PRICING[plan];

  const displayTitle = title || featureConfig?.name || "Fonctionnalité Premium";
  const displayDescription = description || featureConfig?.description || "Cette fonctionnalité nécessite un abonnement supérieur";

  const handleUpgrade = () => {
    navigate("/dashboard/subscription");
  };

  const PlanIcon = plan === "premium" ? Crown : Zap;

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <Lock className="h-5 w-5 text-amber-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-600">
            {displayTitle} - Plan {planInfo.name} requis
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleUpgrade}>
          Upgrade
        </Button>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">{displayTitle}</h3>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {planInfo.name}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                {displayDescription}
              </p>
            </div>
          </div>
          <Button onClick={handleUpgrade} className="gap-2">
            <PlanIcon size={16} />
            Passer au plan {planInfo.name}
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{displayTitle}</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">
          {displayDescription}
        </p>
        <Badge variant="secondary" className="mb-4">
          Disponible avec le plan {planInfo.name}
        </Badge>
        <Button onClick={handleUpgrade} className="gap-2">
          <PlanIcon size={16} />
          Mettre à niveau
        </Button>
      </CardContent>
    </Card>
  );
}
