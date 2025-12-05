import { 
  ShoppingBag, 
  LayoutGrid, 
  Users, 
  BarChart3, 
  Package, 
  CreditCard,
  Smartphone,
  Globe
} from "lucide-react";

const features = [
  {
    icon: ShoppingBag,
    title: "POS Ultra-Rapide",
    description: "Interface tactile optimisée pour serveurs. Grands boutons, navigation intuitive, prise de commande en quelques secondes."
  },
  {
    icon: LayoutGrid,
    title: "Gestion des Tables",
    description: "Vue plan de salle visuelle. Statut en temps réel, transfert et fusion de tables en un clic."
  },
  {
    icon: Users,
    title: "Équipe & Permissions",
    description: "Gérez serveurs, caissiers et managers. Suivi d'activité et contrôle des accès par rôle."
  },
  {
    icon: BarChart3,
    title: "Rapports Détaillés",
    description: "Chiffre d'affaires, ventes par plat, moyens de paiement. Export PDF et Excel en un clic."
  },
  {
    icon: Package,
    title: "Stock Intelligent",
    description: "Suivi automatique des stocks, alertes rupture, gestion fournisseurs et commandes d'achat."
  },
  {
    icon: CreditCard,
    title: "Multi-Paiements",
    description: "Cash, carte bancaire, Mobile Money. Toutes les options pour vos clients africains et internationaux."
  },
  {
    icon: Smartphone,
    title: "100% Mobile",
    description: "Application responsive parfaite sur tablette et smartphone. Serveurs mobiles dans la salle."
  },
  {
    icon: Globe,
    title: "Multi-Restaurants",
    description: "Gérez plusieurs établissements depuis un seul compte. Vue consolidée de vos performances."
  }
];

export function Features() {
  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Fonctionnalités
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
            Tout ce dont votre restaurant a besoin
          </h2>
          <p className="text-muted-foreground text-lg">
            Une suite complète d'outils conçus pour simplifier la gestion de votre établissement,
            du comptoir à la cuisine.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-medium transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon size={24} />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
