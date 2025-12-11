import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Pricing } from "@/components/landing/Pricing";
import { FreeTrial } from "@/components/landing/FreeTrial";
import { FAQ } from "@/components/landing/FAQ";
import { Check, HelpCircle } from "lucide-react";

const comparisonFeatures = [
  { name: "Nombre de restaurants", basic: "1", pro: "3", premium: "Illimité" },
  { name: "Utilisateurs", basic: "2", pro: "10", premium: "Illimité" },
  { name: "Commandes par mois", basic: "500", pro: "Illimité", premium: "Illimité" },
  { name: "Gestion des tables", basic: true, pro: true, premium: true },
  { name: "Rapports de base", basic: true, pro: true, premium: true },
  { name: "Rapports avancés", basic: false, pro: true, premium: true },
  { name: "Gestion des stocks", basic: false, pro: true, premium: true },
  { name: "Multi-paiements", basic: true, pro: true, premium: true },
  { name: "Mode hors-ligne", basic: false, pro: true, premium: true },
  { name: "Application mobile", basic: false, pro: true, premium: true },
  { name: "Support prioritaire", basic: false, pro: true, premium: true },
  { name: "API personnalisée", basic: false, pro: false, premium: true },
  { name: "Formation dédiée", basic: false, pro: false, premium: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 gradient-warm opacity-10" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Des tarifs adaptés à
                <span className="text-primary"> votre activité</span>
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Commencez gratuitement pendant 14 jours, puis choisissez le plan qui correspond à vos besoins.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <Pricing />

        {/* Comparison Table */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Comparaison détaillée des plans
            </h2>
            
            <div className="max-w-5xl mx-auto overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold">Fonctionnalité</th>
                    <th className="text-center py-4 px-4 font-semibold">Basic</th>
                    <th className="text-center py-4 px-4 font-semibold text-primary">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 text-muted-foreground">{feature.name}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.basic === "boolean" ? (
                          feature.basic ? (
                            <Check className="mx-auto text-green-500" size={20} />
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )
                        ) : (
                          <span>{feature.basic}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center bg-primary/5">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <Check className="mx-auto text-green-500" size={20} />
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )
                        ) : (
                          <span className="font-medium">{feature.pro}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof feature.premium === "boolean" ? (
                          feature.premium ? (
                            <Check className="mx-auto text-green-500" size={20} />
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )
                        ) : (
                          <span>{feature.premium}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Free Trial CTA */}
        <FreeTrial />

        {/* FAQ */}
        <FAQ />
      </main>
      
      <Footer />
    </div>
  );
}
