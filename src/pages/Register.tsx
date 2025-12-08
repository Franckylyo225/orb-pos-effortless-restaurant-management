import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Eye, EyeOff, ArrowLeft, Mail, Lock, User, Building2, 
  ArrowRight, Phone, MapPin, Upload, Check, UtensilsCrossed,
  LayoutGrid, Users, QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useRestaurant } from "@/hooks/useRestaurant";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";

type Step = "account" | "otp" | "restaurant" | "onboarding";

export default function Register() {
  const [step, setStep] = useState<Step>("account");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    restaurantName: "",
    address: "",
    cuisineType: "",
    logoUrl: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, user, loading } = useAuth();
  const { createRestaurant } = useRestaurant();

  // Redirect if already logged in with restaurant
  useEffect(() => {
    if (!loading && user) {
      // Check if user already has a restaurant
      supabase
        .from("user_restaurants")
        .select("restaurant_id")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            navigate("/dashboard");
          }
        });
    }
  }, [user, loading, navigate]);

  const updateFormData = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.name);

    if (error) {
      let message = "Une erreur est survenue lors de l'inscription.";
      if (error.message.includes("already registered")) {
        message = "Cet email est déjà utilisé. Veuillez vous connecter.";
      } else if (error.message.includes("Password")) {
        message = "Le mot de passe doit contenir au moins 6 caractères.";
      }
      toast({
        title: "Erreur d'inscription",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Update profile with phone number
    if (formData.phone) {
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        await supabase
          .from("profiles")
          .update({ phone: formData.phone })
          .eq("id", newUser.id);
      }
    }

    toast({
      title: "Compte créé !",
      description: "Un code de vérification a été envoyé à votre email.",
    });

    setIsLoading(false);
    // Skip OTP for now since auto-confirm is enabled, go directly to restaurant
    setStep("restaurant");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: otpCode,
      type: "email",
    });

    if (error) {
      toast({
        title: "Code invalide",
        description: "Le code de vérification est incorrect ou a expiré.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setStep("restaurant");
  };

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await createRestaurant({
      name: formData.restaurantName,
      address: formData.address || undefined,
      cuisine_type: formData.cuisineType || undefined,
      logo_url: logoPreview || undefined,
    });

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le restaurant. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Restaurant créé !",
      description: "Votre espace est prêt à être configuré.",
    });

    setIsLoading(false);
    setStep("onboarding");
  };

  const handleOnboardingComplete = () => {
    navigate("/dashboard");
  };

  const cuisineTypes = [
    { label: "Cuisine africaine", icon: "🍲" },
    { label: "Fast-food", icon: "🍔" },
    { label: "Gastronomique", icon: "🍽️" },
    { label: "Café / Brasserie", icon: "☕" },
    { label: "Street food", icon: "🌮" },
    { label: "Autre", icon: "🍴" },
  ];

  const onboardingSteps = [
    { 
      icon: LayoutGrid, 
      title: "Ajouter vos tables", 
      description: "Configurez le plan de salle",
      action: () => navigate("/dashboard/tables"),
    },
    { 
      icon: UtensilsCrossed, 
      title: "Créer votre menu", 
      description: "Ajoutez vos plats et boissons",
      action: () => navigate("/dashboard/menu"),
    },
    { 
      icon: Users, 
      title: "Inviter l'équipe", 
      description: "Ajoutez serveurs et caissiers",
      action: () => navigate("/dashboard/settings"),
    },
    { 
      icon: QrCode, 
      title: "Activer les commandes QR", 
      description: "Générez vos QR codes",
      action: () => navigate("/dashboard/tables"),
    },
  ];

  const getStepNumber = () => {
    switch (step) {
      case "account": return 1;
      case "otp": return 2;
      case "restaurant": return 2;
      case "onboarding": return 3;
      default: return 1;
    }
  };

  const goBack = () => {
    switch (step) {
      case "otp":
        setStep("account");
        break;
      case "restaurant":
        // Can't go back from restaurant if account created
        break;
      case "onboarding":
        // Can't go back from onboarding
        break;
      default:
        navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back Link */}
          {step === "account" && (
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Retour à l'accueil
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <span className="font-display font-bold text-2xl">ORBI POS</span>
          </Link>

          {/* Progress */}
          {step !== "onboarding" && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= getStepNumber() ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Step: Account Creation */}
          {step === "account" && (
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold mb-2">
                  Créer votre compte
                </h1>
                <p className="text-muted-foreground">
                  Commencez par créer votre compte gérant.
                </p>
              </div>

              <form onSubmit={handleAccountSubmit} className="space-y-5">
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
                  <Label htmlFor="email">Email professionnel</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@restaurant.com"
                      value={formData.email}
                      onChange={(e) => updateFormData("email", e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+225 07 00 00 00 00"
                      value={formData.phone}
                      onChange={(e) => updateFormData("phone", e.target.value)}
                      className="pl-10 h-12"
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
                      placeholder="Minimum 6 caractères"
                      value={formData.password}
                      onChange={(e) => updateFormData("password", e.target.value)}
                      className="pl-10 pr-10 h-12"
                      minLength={6}
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

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Création en cours..."
                  ) : (
                    <>
                      Créer mon compte
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

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

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Se connecter
                </Link>
              </p>
            </>
          )}

          {/* Step: OTP Verification */}
          {step === "otp" && (
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold mb-2">
                  Vérifiez votre email
                </h1>
                <p className="text-muted-foreground">
                  Entrez le code à 6 chiffres envoyé à{" "}
                  <span className="font-medium text-foreground">{formData.email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={setOtpCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || otpCode.length !== 6}
                >
                  {isLoading ? "Vérification..." : "Vérifier le code"}
                </Button>

                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Renvoyer le code
                </button>
              </form>
            </>
          )}

          {/* Step: Restaurant Creation */}
          {step === "restaurant" && (
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold mb-2">
                  Créer votre restaurant
                </h1>
                <p className="text-muted-foreground">
                  Dernière étape ! Parlez-nous de votre établissement.
                </p>
              </div>

              <form onSubmit={handleRestaurantSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName">Nom du restaurant *</Label>
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
                  <Label htmlFor="address">Adresse (optionnel)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      id="address"
                      type="text"
                      placeholder="123 Rue Principale, Abidjan"
                      value={formData.address}
                      onChange={(e) => updateFormData("address", e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Type de cuisine (optionnel)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {cuisineTypes.map((type) => (
                      <button
                        key={type.label}
                        type="button"
                        onClick={() => updateFormData("cuisineType", type.label)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          formData.cuisineType === type.label
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{type.icon}</span>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Logo (optionnel)</Label>
                  <div className="flex items-center gap-4">
                    {logoPreview ? (
                      <div className="relative">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 rounded-xl object-cover border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="flex-1 h-16 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                        <Upload size={18} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Ajouter un logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Création en cours..."
                  ) : (
                    <>
                      Créer mon restaurant
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Step: Onboarding */}
          {step === "onboarding" && (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold mb-2">
                  Félicitations ! 🎉
                </h1>
                <p className="text-muted-foreground">
                  Votre restaurant est créé. Configurez-le en quelques clics.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {onboardingSteps.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon size={24} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>

              <Button
                onClick={handleOnboardingComplete}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Passer au tableau de bord
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="hidden lg:block lg:flex-1 bg-secondary relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-secondary-foreground">
            {step === "account" && (
              <>
                <h2 className="font-display text-4xl font-bold mb-6">
                  Démarrez en
                  <br />
                  10 minutes
                </h2>
                <p className="text-secondary-foreground/80 text-lg max-w-md mx-auto">
                  Créez votre compte et votre restaurant en un seul flux simple et rapide.
                </p>
              </>
            )}
            {step === "otp" && (
              <>
                <h2 className="font-display text-4xl font-bold mb-6">
                  Sécurisez
                  <br />
                  votre compte
                </h2>
                <p className="text-secondary-foreground/80 text-lg max-w-md mx-auto">
                  Un code à usage unique garantit la sécurité de votre espace.
                </p>
              </>
            )}
            {step === "restaurant" && (
              <>
                <h2 className="font-display text-4xl font-bold mb-6">
                  Votre espace
                  <br />
                  personnalisé
                </h2>
                <p className="text-secondary-foreground/80 text-lg max-w-md mx-auto">
                  Menu, équipe, tables — tout sera connecté à votre restaurant.
                </p>
              </>
            )}
            {step === "onboarding" && (
              <>
                <h2 className="font-display text-4xl font-bold mb-6">
                  Prêt pour
                  <br />
                  vos clients
                </h2>
                <p className="text-secondary-foreground/80 text-lg max-w-md mx-auto">
                  Configurez votre restaurant et recevez vos premières commandes.
                </p>
              </>
            )}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary-foreground/10 rounded-full" />
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-secondary-foreground/10 rounded-full" />
      </div>
    </div>
  );
}
