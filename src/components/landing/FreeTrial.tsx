import { ArrowRight, Clock, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function FreeTrial() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-warm opacity-95" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8">
            <Zap size={16} className="animate-pulse" />
            Offre de lancement
          </div>

          {/* Main heading */}
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-6">
            Essayez ORBI POS gratuitement
            <br />
            <span className="text-white/90">pendant 14 jours</span>
          </h2>

          {/* Description */}
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Découvrez toutes les fonctionnalités Pro sans engagement. 
            Configurez votre restaurant en moins de 10 minutes et commencez à prendre des commandes.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Clock size={16} />
              </div>
              <span>14 jours gratuits</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard size={16} />
              </div>
              <span>Aucune carte requise</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Zap size={16} />
              </div>
              <span>Accès complet</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              className="bg-white text-primary hover:bg-white/90 font-semibold min-w-[200px]"
              asChild
            >
              <Link to="/register">
                Démarrer l'essai gratuit
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link to="/pricing">
                Voir les tarifs
              </Link>
            </Button>
          </div>

          {/* Trust note */}
          <p className="text-white/60 text-sm mt-8">
            Rejoignez +500 restaurants qui font confiance à ORBI POS en Afrique
          </p>
        </div>
      </div>
    </section>
  );
}