import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Target, Heart, Users, Globe, Zap, Award } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission",
    description: "Démocratiser l'accès aux outils de gestion modernes pour les restaurants africains, du petit maquis au grand hôtel."
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Nous sommes passionnés par la restauration et l'innovation technologique au service de l'Afrique."
  },
  {
    icon: Users,
    title: "Proximité",
    description: "Une équipe locale qui comprend vos défis quotidiens et parle votre langue."
  },
  {
    icon: Globe,
    title: "Vision",
    description: "Devenir la référence des solutions POS en Afrique francophone et au-delà."
  }
];

const stats = [
  { value: "500+", label: "Restaurants équipés" },
  { value: "15+", label: "Pays en Afrique" },
  { value: "2M+", label: "Commandes traitées" },
  { value: "99.9%", label: "Disponibilité" }
];

const team = [
  { name: "Amadou Diallo", role: "CEO & Fondateur", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face" },
  { name: "Fatou Ndiaye", role: "CTO", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&h=300&fit=crop&crop=face" },
  { name: "Kofi Mensah", role: "Head of Product", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face" },
  { name: "Aïcha Traoré", role: "Head of Customer Success", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face" }
];

export default function AboutPage() {
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
                Révolutionner la restauration
                <span className="text-primary"> en Afrique</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                ORBI POS est né de la volonté de créer un outil de gestion simple, puissant et adapté aux réalités africaines.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
                Notre histoire
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p className="mb-6">
                  Tout a commencé en 2022 à Abidjan, lorsque notre fondateur, ancien restaurateur, 
                  a constaté le manque cruel d'outils de gestion adaptés aux restaurants africains. 
                  Les solutions existantes étaient soit trop complexes, soit trop chères, soit inadaptées 
                  au contexte local.
                </p>
                <p className="mb-6">
                  Avec une équipe de passionnés de tech et de restauration, nous avons créé ORBI POS : 
                  une solution pensée par des Africains, pour des Africains. Simple à utiliser, 
                  abordable, et capable de fonctionner même sans connexion internet stable.
                </p>
                <p>
                  Aujourd'hui, ORBI POS équipe plus de 500 restaurants dans 15 pays africains, 
                  du petit maquis de quartier au restaurant d'hôtel 5 étoiles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Nos valeurs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-6">
                    <value.icon className="text-primary-foreground" size={32} />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Notre équipe
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center group">
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-transparent group-hover:border-primary transition-colors">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">{member.role}</p>
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
