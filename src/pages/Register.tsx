import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Building2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    restaurantName: "",
    cuisineType: "",
    teamSize: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Compte créé avec succès !",
      description: "Bienvenue sur ORBI POS. Configurez votre restaurant.",
    });

    navigate("/dashboard");
    setIsLoading(false);
  };

  const cuisineTypes = [
    "Cuisine africaine",
    "Fast-food",
    "Restaurant gastronomique",
    "Café / Brasserie",
    "Street food",
    "Autre",
  ];

  const teamSizes = [
    "1-5 employés",
    "6-15 employés",
    "16-30 employés",
    "30+ employés",
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back Link */}
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate("/"))}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            {step > 1 ? "Étape précédente" : "Retour à l'accueil"}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <span className="font-display font-bold text-2xl">ORBI POS</span>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold mb-2">
              {step === 1 ? "Créer votre compte" : "Votre restaurant"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1
                ? "Renseignez vos informations personnelles."
                : "Parlez-nous de votre établissement."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className="pl-10 pr-10 h-12"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Nom du restaurant</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="restaurantName"
                      type="text"
                      placeholder="Le Baobab"
                      value={formData.restaurantName}
                      onChange={(e) => updateFormData("restaurantName", e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Type de cuisine</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {cuisineTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateFormData("cuisineType", type)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.cuisineType === type
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Taille de l'équipe</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {teamSizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => updateFormData("teamSize", size)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.teamSize === size
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full group"
              disabled={isLoading}
            >
              {isLoading ? (
                "Création en cours..."
              ) : step < 2 ? (
                <>
                  Continuer
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              ) : (
                "Créer mon restaurant"
              )}
            </Button>
          </form>

          {/* Terms */}
          {step === 1 && (
            <p className="mt-6 text-center text-xs text-muted-foreground">
              En vous inscrivant, vous acceptez nos{" "}
              <Link to="/terms" className="text-primary hover:underline">
                conditions d'utilisation
              </Link>{" "}
              et notre{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
          )}

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:flex-1 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-secondary-foreground">
            <h2 className="font-display text-4xl font-bold mb-6">
              Configurez votre
              <br />
              restaurant en 10 minutes
            </h2>
            <p className="text-secondary-foreground/80 text-lg max-w-md mx-auto">
              Menu, équipe, tables — tout est prêt pour recevoir vos premiers clients.
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary-foreground/10 rounded-full" />
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-secondary-foreground/10 rounded-full" />
      </div>
    </div>
  );
}
