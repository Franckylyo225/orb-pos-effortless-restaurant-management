import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FreeTrial } from "@/components/landing/FreeTrial";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  UtensilsCrossed, 
  Building2, 
  Coffee, 
  Pizza, 
  Truck, 
  ChefHat,
  ArrowRight,
  Check
} from "lucide-react";

const useCases = [
  {
    icon: UtensilsCrossed,
    title: "Restaurants traditionnels",
    subtitle: "Du maquis au restaurant gastronomique",
    description: "Gérez facilement votre salle, vos commandes et vos paiements avec une interface simple et rapide.",
    features: [
      "Plan de salle interactif",
      "Gestion des tables et réservations",
      "Envoi des commandes en cuisine",
      "Facturation multi-modes de paiement"
    ],
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"
  },
  {
    icon: Building2,
    title: "Hôtels & Resorts",
    subtitle: "Restauration hôtelière premium",
    description: "Solution complète pour les restaurants d'hôtels avec gestion multi-points de vente et rapports consolidés.",
    features: [
      "Multi-restaurants centralisés",
      "Rapports consolidés par établissement",
      "Gestion des équipes multi-sites",
      "Intégration facturation chambre"
    ],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop"
  },
  {
    icon: Coffee,
    title: "Cafés & Bars",
    subtitle: "Service rapide et ambiance détendue",
    description: "Interface ultra-rapide pour le service au comptoir avec gestion des happy hours et promotions.",
    features: [
      "Commandes rapides au comptoir",
      "Gestion des happy hours",
      "Suivi des consommations",
      "Caisse simplifiée"
    ],
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop"
  },
  {
    icon: Pizza,
    title: "Fast-food & Snacks",
    subtitle: "Volume élevé, service express",
    description: "Optimisé pour les commandes à fort volume avec écran cuisine et gestion des files d'attente.",
    features: [
      "Interface tactile ultra-rapide",
      "Écran de préparation cuisine",
      "Gestion des numéros de commande",
      "Statistiques temps réel"
    ],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop"
  },
  {
    icon: Truck,
    title: "Food Trucks & Ambulants",
    subtitle: "Mobilité et flexibilité",
    description: "Fonctionne en mode hors-ligne parfait pour les événements et marchés sans connexion stable.",
    features: [
      "Mode 100% hors-ligne",
      "Synchronisation automatique",
      "Caisse mobile simplifiée",
      "Rapports de fin de journée"
    ],
    image: "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=600&h=400&fit=crop"
  },
  {
    icon: ChefHat,
    title: "Traiteurs & Événements",
    subtitle: "Gestion des commandes spéciales",
    description: "Parfait pour les commandes personnalisées, menus événementiels et gestion des livraisons.",
    features: [
      "Devis et commandes personnalisées",
      "Gestion des événements",
      "Planification des préparations",
      "Suivi des livraisons"
    ],
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop"
  }
];

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 gradient-warm opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Une solution pour
                <span className="text-primary"> chaque type de restaurant</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Du petit maquis de quartier au grand hôtel, ORBI POS s'adapte à tous les formats de restauration en Afrique.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="space-y-24">
              {useCases.map((useCase, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
                >
                  {/* Image */}
                  <div className="lg:w-1/2">
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                      <img 
                        src={useCase.image} 
                        alt={useCase.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
                          <useCase.icon className="text-primary-foreground" size={24} />
                        </div>
                        <span className="text-white font-semibold text-lg">{useCase.title}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2 space-y-6">
                    <div>
                      <p className="text-primary font-medium mb-2">{useCase.subtitle}</p>
                      <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">{useCase.title}</h2>
                      <p className="text-muted-foreground text-lg">{useCase.description}</p>
                    </div>

                    <ul className="space-y-3">
                      {useCase.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Check className="text-primary" size={14} />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button asChild>
                      <Link to="/register">
                        Essayer pour {useCase.title.toLowerCase()}
                        <ArrowRight className="ml-2" size={18} />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <FreeTrial />
      </main>
      
      <Footer />
    </div>
  );
}
