import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAuthErrorMessage } from "@/lib/validations/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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

    setIsEmailSent(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <span className="font-display font-bold text-2xl">ORBI POS</span>
          </Link>

          {isEmailSent ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">
                Email envoyé !
              </h1>
              <p className="text-muted-foreground mb-6">
                Si un compte existe avec l'adresse{" "}
                <span className="font-medium text-foreground">{email}</span>,
                vous recevrez un lien de réinitialisation.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Vérifiez également vos spams si vous ne voyez pas l'email.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsEmailSent(false)}
              >
                Renvoyer l'email
              </Button>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <h1 className="font-display text-2xl font-bold mb-2">
                  Mot de passe oublié ?
                </h1>
                <p className="text-muted-foreground">
                  Entrez votre adresse email et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={18}
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Vous vous souvenez du mot de passe ?{" "}
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Se connecter
                </Link>
              </p>
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
              Sécurité avant tout
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">
              Nous prenons la sécurité de votre compte très au sérieux.
              Réinitialisez votre mot de passe en toute confiance.
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
