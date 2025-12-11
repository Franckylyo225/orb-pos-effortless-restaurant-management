import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useMobileMoneyProviders } from "@/hooks/useMobileMoneyProviders";
import { Smartphone, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function MobileMoneyProvidersCard() {
  const { providers, loading, toggleProvider, addProvider, deleteProvider } = useMobileMoneyProviders();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderCode, setNewProviderCode] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddProvider = async () => {
    if (!newProviderName.trim()) return;
    
    setIsAdding(true);
    const code = newProviderCode.trim() || newProviderName.toLowerCase().replace(/\s+/g, "_");
    await addProvider(newProviderName.trim(), code);
    setNewProviderName("");
    setNewProviderCode("");
    setIsAddDialogOpen(false);
    setIsAdding(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Options Mobile Money
            </CardTitle>
            <CardDescription>
              Configurez les fournisseurs de Mobile Money disponibles au paiement
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un fournisseur</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau moyen de paiement Mobile Money
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="provider-name">Nom du fournisseur</Label>
                  <Input
                    id="provider-name"
                    placeholder="Ex: M-Pesa"
                    value={newProviderName}
                    onChange={(e) => setNewProviderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider-code">Code (optionnel)</Label>
                  <Input
                    id="provider-code"
                    placeholder="Ex: m_pesa"
                    value={newProviderCode}
                    onChange={(e) => setNewProviderCode(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Laissez vide pour générer automatiquement
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddProvider} disabled={isAdding || !newProviderName.trim()}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {providers.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Aucun fournisseur configuré
            </p>
          ) : (
            providers.map((provider) => (
              <div
                key={provider.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-xs text-muted-foreground">{provider.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={provider.is_enabled}
                    onCheckedChange={(checked) => toggleProvider(provider.id, checked)}
                  />
                  <button
                    onClick={() => deleteProvider(provider.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
