import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, UtensilsCrossed } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Animated Icon */}
        <div className="relative mb-8 inline-block">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
            <UtensilsCrossed className="w-16 h-16 text-primary/60" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <Search className="w-6 h-6 text-destructive/60" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-8xl md:text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/50 mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
          Page introuvable
        </h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Oups ! La page que vous recherchez semble avoir disparu. 
          Elle a peut-être été déplacée ou n'existe plus.
        </p>

        {/* Current path display */}
        <div className="mb-8 p-3 bg-muted/50 rounded-lg border border-border/50 inline-block">
          <code className="text-sm text-muted-foreground">
            {location.pathname}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/">
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="w-5 h-5" />
              Aller au tableau de bord
            </Link>
          </Button>
        </div>

        {/* Footer hint */}
        <p className="mt-12 text-sm text-muted-foreground">
          Besoin d'aide ?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contactez-nous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
