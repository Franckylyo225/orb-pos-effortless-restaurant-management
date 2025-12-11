import { useMemo } from "react";
import { useRestaurant } from "./useRestaurant";

export type SubscriptionPlan = "basic" | "pro" | "premium";

export type FeatureKey = 
  | "team_management"
  | "stock_management"
  | "advanced_reports"
  | "export_pdf_excel"
  | "multi_restaurant"
  | "api_access"
  | "integrations"
  | "priority_support"
  | "24_7_support"
  | "dedicated_training"
  | "account_manager"
  | "unlimited_tables"
  | "unlimited_menu"
  | "kitchen_display"
  | "qr_orders"
  | "custom_receipts";

export interface FeatureConfig {
  name: string;
  description: string;
  plans: SubscriptionPlan[];
}

export interface PlanLimits {
  maxTeamMembers: number;
  maxRestaurants: number;
  maxTables: number;
}

// Feature availability by plan
export const FEATURES: Record<FeatureKey, FeatureConfig> = {
  team_management: {
    name: "Gestion d'équipe",
    description: "Ajoutez et gérez les membres de votre équipe",
    plans: ["basic", "pro", "premium"],
  },
  stock_management: {
    name: "Gestion du stock",
    description: "Suivez votre inventaire et recevez des alertes",
    plans: ["pro", "premium"],
  },
  advanced_reports: {
    name: "Rapports avancés",
    description: "Analyses détaillées et comparaisons",
    plans: ["pro", "premium"],
  },
  export_pdf_excel: {
    name: "Exports PDF/Excel",
    description: "Exportez vos rapports en PDF ou Excel",
    plans: ["pro", "premium"],
  },
  multi_restaurant: {
    name: "Multi-établissements",
    description: "Gérez plusieurs restaurants",
    plans: ["premium"],
  },
  api_access: {
    name: "Accès API",
    description: "Intégrez ORBI POS avec vos outils",
    plans: ["premium"],
  },
  integrations: {
    name: "Intégrations tierces",
    description: "Connectez des services externes",
    plans: ["premium"],
  },
  priority_support: {
    name: "Support prioritaire",
    description: "Assistance rapide par email et chat",
    plans: ["pro", "premium"],
  },
  "24_7_support": {
    name: "Support 24/7",
    description: "Assistance disponible à tout moment",
    plans: ["premium"],
  },
  dedicated_training: {
    name: "Formation dédiée",
    description: "Formation personnalisée pour votre équipe",
    plans: ["premium"],
  },
  account_manager: {
    name: "Manager de compte",
    description: "Un interlocuteur dédié pour votre restaurant",
    plans: ["premium"],
  },
  unlimited_tables: {
    name: "Tables illimitées",
    description: "Aucune limite sur le nombre de tables",
    plans: ["pro", "premium"],
  },
  unlimited_menu: {
    name: "Menu illimité",
    description: "Ajoutez autant de plats que vous voulez",
    plans: ["basic", "pro", "premium"],
  },
  kitchen_display: {
    name: "Écran cuisine",
    description: "Affichage des commandes en cuisine",
    plans: ["basic", "pro", "premium"],
  },
  qr_orders: {
    name: "Commandes QR",
    description: "Permettez aux clients de commander par QR code",
    plans: ["pro", "premium"],
  },
  custom_receipts: {
    name: "Reçus personnalisés",
    description: "Personnalisez vos tickets de caisse",
    plans: ["pro", "premium"],
  },
};

// Plan limits
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  basic: {
    maxTeamMembers: 3,
    maxRestaurants: 1,
    maxTables: 5,
  },
  pro: {
    maxTeamMembers: 10,
    maxRestaurants: 3,
    maxTables: 999,
  },
  premium: {
    maxTeamMembers: 999,
    maxRestaurants: 999,
    maxTables: 999,
  },
};

// Plan pricing
export const PLAN_PRICING: Record<SubscriptionPlan, { price: number; name: string; description: string }> = {
  basic: {
    price: 19000,
    name: "Basic",
    description: "Pour démarrer votre activité",
  },
  pro: {
    price: 49000,
    name: "Pro",
    description: "Pour les restaurants en croissance",
  },
  premium: {
    price: 129000,
    name: "Premium",
    description: "Solution complète pour les professionnels",
  },
};

export function useSubscriptionFeatures() {
  const { restaurant } = useRestaurant();

  const currentPlan = useMemo<SubscriptionPlan>(() => {
    const plan = restaurant?.subscription_plan;
    if (plan === "pro" || plan === "premium") return plan;
    return "basic";
  }, [restaurant?.subscription_plan]);

  const limits = useMemo(() => PLAN_LIMITS[currentPlan], [currentPlan]);

  const hasFeature = (feature: FeatureKey): boolean => {
    return FEATURES[feature].plans.includes(currentPlan);
  };

  const getRequiredPlan = (feature: FeatureKey): SubscriptionPlan => {
    const plans = FEATURES[feature].plans;
    return plans[0]; // Return the lowest plan that has this feature
  };

  const isWithinLimit = (type: keyof PlanLimits, currentCount: number): boolean => {
    return currentCount < limits[type];
  };

  const canUpgrade = currentPlan !== "premium";

  const getNextPlan = (): SubscriptionPlan | null => {
    if (currentPlan === "basic") return "pro";
    if (currentPlan === "pro") return "premium";
    return null;
  };

  return {
    currentPlan,
    limits,
    hasFeature,
    getRequiredPlan,
    isWithinLimit,
    canUpgrade,
    getNextPlan,
    pricing: PLAN_PRICING,
    features: FEATURES,
  };
}
