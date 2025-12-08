import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    description: "Pour les petits établissements",
    price: "19 000",
    currency: "FCFA",
    period: "/mois",
    features: [
      "1 caisse (terminal)",
      "Gestion des commandes",
      "Menu illimité",
      "Rapports de base",
      "Support email"
    ],
    popular: false,
    cta: "Commencer"
  },
  {
    name: "Pro",
    description: "Pour les restaurants en croissance",
    price: "49 000",
    currency: "FCFA",
    period: "/mois",
    features: [
      "3 caisses (terminaux)",
      "Gestion des tables",
      "Gestion du stock",
      "Gestion des employés",
      "Rapports avancés",
      "Multi-paiements",
      "Support prioritaire"
    ],
    popular: true,
    cta: "Essayer Pro"
  },
  {
    name: "Premium",
    description: "Pour les groupes de restaurants",
    price: "129 000",
    currency: "FCFA",
    period: "/mois",
    features: [
      "Caisses illimitées",
      "Multi-établissements",
      "API personnalisée",
      "IA prédictive",
      "Intégrations avancées",
      "Manager dédié",
      "Formation incluse"
    ],
    popular: false,
    cta: "Contacter les ventes"
  }
];

export function Pricing() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Tarifs
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
            Un plan adapté à chaque restaurant
          </h2>
          <p className="text-muted-foreground text-lg">
            Commencez gratuitement pendant 14 jours. Aucune carte requise. 
            Évoluez selon vos besoins.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-card border-2 border-primary shadow-large scale-105"
                  : "bg-card border border-border/50 hover:border-primary/30 hover:shadow-medium"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full gradient-warm text-primary-foreground text-sm font-medium">
                    <Sparkles size={14} />
                    Plus populaire
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="font-display font-bold text-xl mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.currency}{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="w-full"
                size="lg"
                asChild
              >
                <Link to="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <p className="text-center text-muted-foreground text-sm mt-12">
          Tous les prix sont en Francs CFA (FCFA). TVA incluse.
          <br />
          <Link to="/pricing" className="text-primary hover:underline">
            Voir tous les détails des plans →
          </Link>
        </p>
      </div>
    </section>
  );
}
