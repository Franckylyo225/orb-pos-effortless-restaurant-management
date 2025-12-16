import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAuthErrorMessage } from "@/lib/validations/auth";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface LockStatus {
  locked: boolean;
  locked_until?: string;
  attempts: number;
  max_attempts: number;
  remaining_minutes?: number;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lockStatus, setLockStatus] = useState<LockStatus | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Check lock status when email changes
  useEffect(() => {
    const checkLock = async () => {
      if (!email || !email.includes("@")) return;
      
      const { data, error } = await supabase.rpc("check_account_locked", {
        user_email: email,
      });
      
      if (!error && data) {
        setLockStatus(data as unknown as LockStatus);
      }
    };

    const debounce = setTimeout(checkLock, 500);
    return () => clearTimeout(debounce);
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if account is locked before attempting login
    const { data: lockCheck } = await supabase.rpc("check_account_locked", {
      user_email: email,
    });

    const lockData = lockCheck as unknown as LockStatus | null;

    if (lockData?.locked) {
      const minutes = Math.ceil(lockData.remaining_minutes || 0);
      toast({
        title: "Compte temporairement verrouillé",
        description: `Trop de tentatives échouées. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
        variant: "destructive",
      });
      setLockStatus(lockData);
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      // Record the failed attempt
      const { data: attemptData } = await supabase.rpc("record_failed_login", {
        user_email: email,
      });

      const attemptResult = attemptData as unknown as LockStatus | null;

      if (attemptResult) {
        setLockStatus(attemptResult);
        
        if (attemptResult.locked) {
          toast({
            title: "Compte verrouillé",
            description: "Trop de tentatives échouées. Votre compte est verrouillé pour 15 minutes.",
            variant: "destructive",
          });
        } else {
          const remaining = attemptResult.max_attempts - attemptResult.attempts;
          const message = getAuthErrorMessage(error);
          toast({
            title: "Erreur de connexion",
            description: `${message} (${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""})`,
            variant: "destructive",
          });
        }
      } else {
        const message = getAuthErrorMessage(error);
        toast({
          title: "Erreur de connexion",
          description: message,
          variant: "destructive",
        });
      }

      setIsLoading(false);
      return;
    }

    // Reset attempts on successful login
    await supabase.rpc("reset_login_attempts", { user_email: email });

    toast({
      title: "Connexion réussie",
      description: "Bienvenue sur ORBI POS !",
    });

    navigate("/dashboard");
    setIsLoading(false);
  };

  const isAccountLocked = lockStatus?.locked ?? false;

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
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <span className="font-display font-bold text-2xl">ORBI POS</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold mb-2">
              Connexion à votre compte
            </h1>
            <p className="text-muted-foreground">
              Entrez vos identifiants pour accéder à votre tableau de bord.
            </p>
          </div>

          {/* Lock Warning */}
          {isAccountLocked && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Compte temporairement verrouillé. Réessayez dans{" "}
                {Math.ceil(lockStatus?.remaining_minutes || 15)} minute
                {Math.ceil(lockStatus?.remaining_minutes || 15) > 1 ? "s" : ""}.
              </AlertDescription>
            </Alert>
          )}

          {/* Attempts Warning */}
          {!isAccountLocked && lockStatus && lockStatus.attempts > 0 && (
            <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                {lockStatus.max_attempts - lockStatus.attempts} tentative
                {lockStatus.max_attempts - lockStatus.attempts > 1 ? "s" : ""} restante
                {lockStatus.max_attempts - lockStatus.attempts > 1 ? "s" : ""} avant verrouillage.
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                  disabled={isAccountLocked}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                  disabled={isAccountLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isAccountLocked}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading || isAccountLocked}
            >
              {isLoading ? "Connexion..." : isAccountLocked ? "Compte verrouillé" : "Se connecter"}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Image */}
      <div className="hidden lg:block lg:flex-1 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground">
            <h2 className="font-display text-4xl font-bold mb-6">
              Gérez votre restaurant
              <br />
              en toute simplicité
            </h2>
            <p className="text-primary-foreground/80 text-lg max-w-md mx-auto">
              Plus de 500 restaurants à travers l'Afrique font confiance à ORBI POS
              pour leurs opérations quotidiennes.
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
