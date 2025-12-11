import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { 
  Zap, 
  LayoutGrid, 
  BarChart3, 
  Users, 
  Package, 
  Receipt, 
  Smartphone, 
  Wifi, 
  Shield,
  Clock,
  CreditCard,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "POS Ultra-Rapide",
    description: "Interface tactile optimisée pour une prise de commande en quelques secondes. Parfait pour les heures de pointe.",
    details: ["Recherche instantanée", "Raccourcis personnalisables", "Mode hors-ligne"]
  },
  {
    icon: LayoutGrid,
    title: "Gestion des Tables",
    description: "Visualisez votre salle en temps réel avec un plan interactif de vos tables.",
    details: ["Plan de salle visuel", "Statuts en temps réel", "Fusion de tables"]
  },
  {
    icon: BarChart3,
    title: "Rapports Détaillés",
    description: "Analysez vos ventes, marges et performances avec des tableaux de bord complets.",
    details: ["Rapports journaliers/mensuels", "Export PDF/Excel", "Suivi des marges"]
  },
  {
    icon: Users,
    title: "Gestion d'Équipe",
    description: "Gérez les rôles et permissions de votre personnel facilement.",
    details: ["4 niveaux de rôles", "Suivi d'activité", "Historique complet"]
  },
  {
    icon: Package,
    title: "Gestion des Stocks",
    description: "Suivez automatiquement vos inventaires et recevez des alertes de rupture.",
    details: ["Alertes de stock bas", "Gestion fournisseurs", "Inventaires automatiques"]
  },
  {
    icon: Receipt,
    title: "Facturation Flexible",
    description: "Générez des factures et envoyez-les par WhatsApp, SMS ou impression thermique.",
    details: ["Impression thermique", "Envoi WhatsApp/SMS", "Historique complet"]
  },
  {
    icon: Smartphone,
    title: "Application Mobile",
    description: "Gérez votre restaurant depuis votre téléphone où que vous soyez.",
    details: ["Vue manager mobile", "Mode serveur", "Notifications push"]
  },
  {
    icon: Wifi,
    title: "Mode Hors-Ligne",
    description: "Continuez à travailler même sans connexion internet.",
    details: ["Synchronisation auto", "Sauvegarde locale", "Pas de perte de données"]
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Vos données sont protégées avec un chiffrement de niveau bancaire.",
    details: ["Chiffrement SSL", "Sauvegardes quotidiennes", "Accès sécurisé"]
  },
  {
    icon: Clock,
    title: "Historique Complet",
    description: "Retrouvez toutes vos commandes et transactions passées en un clic.",
    details: ["Recherche avancée", "Filtres multiples", "Export de données"]
  },
  {
    icon: CreditCard,
    title: "Multi-Paiements",
    description: "Acceptez tous les modes de paiement : espèces, cartes, Mobile Money.",
    details: ["Orange Money", "MTN Money", "Wave, Cartes"]
  },
  {
    icon: Globe,
    title: "Multi-Restaurants",
    description: "Gérez plusieurs établissements depuis une seule interface.",
    details: ["Tableau de bord unifié", "Rapports consolidés", "Gestion centralisée"]
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 gradient-warm opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Toutes les fonctionnalités pour
                <span className="text-primary"> gérer votre restaurant</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                ORBI POS combine puissance et simplicité pour vous offrir l'outil de gestion le plus complet du marché africain.
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl gradient-warm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="text-primary-foreground" size={28} />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
