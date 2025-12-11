import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRestaurant } from "@/hooks/useRestaurant";
import { 
  useSubscriptionFeatures, 
  FEATURES, 
  PLAN_LIMITS,
  SubscriptionPlan 
} from "@/hooks/useSubscriptionFeatures";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Crown, 
  Zap, 
  Building2,
  Loader2,
  Star,
  Users,
  Store,
  LayoutGrid
} from "lucide-react";

interface Plan {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  limits: { label: string; value: string | number }[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Pour démarrer votre activité",
    price: 19000,
    period: "FCFA/mois",
    icon: <Building2 className="h-6 w-6" />,
    limits: [
      { label: "Membres d'équipe", value: PLAN_LIMITS.basic.maxTeamMembers },
      { label: "Restaurants", value: PLAN_LIMITS.basic.maxRestaurants },
      { label: "Tables", value: PLAN_LIMITS.basic.maxTables },
    ],
    features: [
      "Gestion des commandes",
      "Menu illimité",
      "Écran cuisine",
      "Rapports basiques",
      "Support par email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Pour les restaurants en croissance",
    price: 49000,
    period: "FCFA/mois",
    popular: true,
    icon: <Zap className="h-6 w-6" />,
    limits: [
      { label: "Membres d'équipe", value: PLAN_LIMITS.pro.maxTeamMembers },
      { label: "Restaurants", value: PLAN_LIMITS.pro.maxRestaurants },
      { label: "Tables", value: "Illimité" },
    ],
    features: [
      "Toutes les fonctionnalités Basic",
      "Gestion du stock",
      "Rapports avancés",
      "Exports PDF/Excel",
      "Commandes QR",
      "Reçus personnalisés",
      "Support prioritaire",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    description: "Solution complète pour les professionnels",
    price: 129000,
    period: "FCFA/mois",
    icon: <Crown className="h-6 w-6" />,
    limits: [
      { label: "Membres d'équipe", value: "Illimité" },
      { label: "Restaurants", value: "Illimité" },
      { label: "Tables", value: "Illimité" },
    ],
    features: [
      "Toutes les fonctionnalités Pro",
      "Multi-établissements",
      "Accès API",
      "Intégrations tierces",
      "Support 24/7",
      "Formation dédiée",
      "Manager de compte",
    ],
  },
];

export default function Subscription() {
  const { restaurant, loading } = useRestaurant();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const currentPlan = restaurant?.subscription_plan || "basic";

  const handleSelectPlan = async (planId: string) => {
    if (!restaurant) return;
    if (planId === currentPlan) return;

    setUpgrading(planId);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ subscription_plan: planId })
        .eq("id", restaurant.id);

      if (error) throw error;

      toast({
        title: "Abonnement mis à jour !",
        description: `Vous êtes maintenant sur le plan ${plans.find(p => p.id === planId)?.name}.`,
      });

      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'abonnement.",
        variant: "destructive",
      });
    } finally {
      setUpgrading(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Abonnement</h1>
          <p className="text-muted-foreground mt-2">
            Choisissez le plan qui correspond le mieux aux besoins de votre restaurant
          </p>
        </div>

        {/* Current Plan Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan actuel</p>
                <p className="font-display font-bold text-xl capitalize">{currentPlan}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              Actif
            </Badge>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isUpgrade = plans.findIndex(p => p.id === plan.id) > plans.findIndex(p => p.id === currentPlan);
            
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative transition-all duration-300 hover:shadow-lg",
                  plan.popular && "border-primary shadow-soft",
                  isCurrentPlan && "ring-2 ring-primary"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    <span className="text-4xl font-display font-bold">
                      {plan.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>

                  {/* Limits */}
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                    {plan.limits.map((limit, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{limit.label}</span>
                        <span className="font-semibold">{limit.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm">
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    variant={isCurrentPlan ? "secondary" : plan.popular ? "default" : "outline"}
                    disabled={isCurrentPlan || upgrading !== null}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {upgrading === plan.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Traitement...
                      </>
                    ) : isCurrentPlan ? (
                      "Plan actuel"
                    ) : isUpgrade ? (
                      "Passer à ce plan"
                    ) : (
                      "Changer de plan"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Puis-je changer de plan à tout moment ?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            <div>
              <p className="font-medium">Comment fonctionne la facturation ?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous êtes facturé mensuellement. En cas de changement de plan, 
                le nouveau tarif s'applique au prochain cycle de facturation.
              </p>
            </div>
            <div>
              <p className="font-medium">Puis-je annuler mon abonnement ?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Vous pouvez annuler votre abonnement à tout moment. 
                Vous conserverez l'accès jusqu'à la fin de votre période de facturation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
