import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRestaurant } from "@/hooks/useRestaurant";
import { Loader2, ChefHat, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const cuisineTypes = [
  "Africaine",
  "Ivoirienne",
  "Sénégalaise",
  "Camerounaise",
  "Française",
  "Italienne",
  "Asiatique",
  "Fast-food",
  "Brasserie",
  "Autre",
];

const teamSizes = [
  { value: "1", label: "1 personne (solo)" },
  { value: "2", label: "2-5 personnes" },
  { value: "6", label: "6-10 personnes" },
  { value: "11", label: "11-20 personnes" },
  { value: "21", label: "Plus de 20 personnes" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { createRestaurant } = useRestaurant();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cuisine_type: "",
    team_size: "2",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du restaurant est requis",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await createRestaurant({
      name: formData.name,
      cuisine_type: formData.cuisine_type || undefined,
      team_size: parseInt(formData.team_size),
    });

    if (error) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le restaurant",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "Restaurant créé !",
      description: "Bienvenue sur votre tableau de bord",
    });

    // Redirect to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <ChefHat size={24} />
          </div>
          <span className="font-display font-bold text-xl">RestoFlow</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold mb-2">
              Configurez votre restaurant
            </h1>
            <p className="text-muted-foreground">
              Quelques informations pour personnaliser votre expérience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant *</Label>
              <Input
                id="name"
                placeholder="Ex: Chez Maman, La Bonne Table..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-12"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Type de cuisine</Label>
              <Select
                value={formData.cuisine_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, cuisine_type: value })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sélectionnez..." />
                </SelectTrigger>
                <SelectContent>
                  {cuisineTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Taille de l'équipe</Label>
              <Select
                value={formData.team_size}
                onValueChange={(value) =>
                  setFormData({ ...formData, team_size: value })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teamSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="hero"
              className="w-full h-14 text-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Commencer
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Vous pourrez modifier ces informations plus tard dans les paramètres
          </p>
        </div>
      </main>
    </div>
  );
}
