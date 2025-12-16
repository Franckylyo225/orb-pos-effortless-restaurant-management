import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { passwordSchema, getAuthErrorMessage } from "@/lib/validations/auth";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidLink, setIsValidLink] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // If there's no session and no hash fragment, the link might be invalid
      if (!session && !window.location.hash) {
        setIsValidLink(false);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password with Zod
    const validation = passwordSchema.safeParse(password);
    if (!validation.success) {
      toast({
        title: "Mot de passe invalide",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);

    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      navigate("/dashboard");
    }, 3000);
  };

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">
            Lien invalide ou expiré
          </h1>
          <p className="text-muted-foreground mb-6">
            Ce lien de réinitialisation n'est plus valide. Veuillez faire une
            nouvelle demande de réinitialisation.
          </p>
          <Button variant="hero" asChild>
            <Link to="/forgot-password">Nouvelle demande</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <span className="font-display font-bold text-2xl">ORBI POS</span>
          </Link>

          {isSuccess ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">
                Mot de passe modifié !
              </h1>
              <p className="text-muted-foreground mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous allez
                être redirigé vers votre tableau de bord.
              </p>
              <Button variant="hero" asChild className="w-full">
                <Link to="/dashboard">Accéder au tableau de bord</Link>
              </Button>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold mb-2">
                  Nouveau mot de passe
                </h1>
                <p className="text-muted-foreground">
                  Choisissez un nouveau mot de passe sécurisé pour votre compte.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  <PasswordStrengthIndicator password={password} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Retapez le mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 h-12"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-destructive">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || password !== confirmPassword}
                >
                  {isLoading ? "Modification..." : "Modifier le mot de passe"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:flex-1 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground">
            <h2 className="font-display text-4xl font-bold mb-6">
              Votre sécurité
              <br />
              notre priorité
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">
              Choisissez un mot de passe fort pour protéger vos données et celles
              de votre restaurant.
            </p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary-foreground/10 rounded-full" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-foreground/10 rounded-full" />
      </div>
    </div>
  );
}
