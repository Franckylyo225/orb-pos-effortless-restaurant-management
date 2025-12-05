import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8 animate-fade-up">
            <Star size={16} className="fill-current" />
            <span className="text-sm font-medium">Solution #1 pour restaurants en Afrique</span>
          </div>

          {/* Headline */}
          <h1 
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            La caisse moderne et simple pour{" "}
            <span className="text-primary">gérer votre restaurant</span>
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Du petit maquis au grand hôtel, ORBI POS simplifie vos ventes, 
            votre stock et votre équipe. Configurez en 10 minutes, utilisez sans formation.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/register" className="group">
                Créer mon restaurant
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/demo" className="group">
                <Play size={20} className="text-primary" />
                Voir la démo
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <div 
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1 text-warning">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={16} className="fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">500+</span> restaurants nous font confiance
              </p>
            </div>
          </div>
        </div>

        {/* Hero Image / Dashboard Preview */}
        <div 
          className="mt-16 md:mt-24 relative animate-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-large border border-border/50 bg-card">
            <div className="aspect-[16/10] md:aspect-[16/9] bg-gradient-to-br from-muted to-background p-4 md:p-8">
              {/* Mock Dashboard UI */}
              <div className="grid grid-cols-4 gap-4 h-full">
                {/* Sidebar */}
                <div className="hidden md:block col-span-1 bg-background rounded-xl p-4 space-y-3">
                  <div className="w-12 h-12 rounded-xl gradient-warm" />
                  <div className="space-y-2 pt-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 rounded-lg bg-muted" />
                    ))}
                  </div>
                </div>
                
                {/* Main Content */}
                <div className="col-span-4 md:col-span-3 space-y-4">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {["Ventes", "Commandes", "Clients", "Stock"].map((stat, i) => (
                      <div key={stat} className="bg-background rounded-xl p-4">
                        <div className="text-xs text-muted-foreground">{stat}</div>
                        <div className="text-lg md:text-2xl font-bold mt-1">
                          {(Math.random() * 1000).toFixed(0)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Content Area */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                    <div className="md:col-span-2 bg-background rounded-xl p-4 space-y-3">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="grid grid-cols-4 gap-2">
                        {Array(8).fill(null).map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-muted" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-background rounded-xl p-4 space-y-3">
                      <div className="h-4 w-24 bg-muted rounded" />
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted" />
                          <div className="flex-1">
                            <div className="h-3 w-20 bg-muted rounded" />
                            <div className="h-2 w-12 bg-muted rounded mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/20 rounded-2xl blur-xl" />
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-secondary/20 rounded-2xl blur-xl" />
        </div>
      </div>
    </section>
  );
}
