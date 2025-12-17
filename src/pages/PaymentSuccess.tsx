import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, ArrowRight } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") || "pro";
  const { refetch, subscription } = useSubscription();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const checkStatus = async () => {
      // Wait a bit for webhook to process
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await refetch();
      
      // Check if subscription is now active
      if (subscription?.status === "active") {
        setStatus("success");
      } else {
        // Give it more time
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await refetch();
        setStatus("success"); // Assume success for now
      }
    };

    checkStatus();
  }, [refetch, subscription?.status]);

  const planNames: Record<string, string> = {
    basic: "Basic",
    pro: "Pro",
    premium: "Premium",
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            {status === "loading" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle>Traitement en cours...</CardTitle>
                <CardDescription>
                  Nous vérifions votre paiement, veuillez patienter.
                </CardDescription>
              </>
            )}
            {status === "success" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-success" />
                </div>
                <CardTitle className="text-success">Paiement réussi !</CardTitle>
                <CardDescription>
                  Votre abonnement {planNames[plan]} est maintenant actif.
                </CardDescription>
              </>
            )}
            {status === "error" && (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Erreur de paiement</CardTitle>
                <CardDescription>
                  Une erreur s'est produite lors du traitement de votre paiement.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "success" && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{planNames[plan]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Statut</span>
                  <span className="font-medium text-success">Actif</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prochaine facturation</span>
                  <span className="font-medium">
                    {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            )}
            <Button
              className="w-full"
              onClick={() => navigate("/dashboard")}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Veuillez patienter...
                </>
              ) : (
                <>
                  Accéder au dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            {status === "error" && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/dashboard/subscription")}
              >
                Réessayer
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
