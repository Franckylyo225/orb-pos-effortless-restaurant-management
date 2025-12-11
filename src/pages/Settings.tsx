import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRestaurant } from "@/hooks/useRestaurant";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  CreditCard, 
  Bell, 
  Printer, 
  Receipt,
  Save,
  Loader2,
  QrCode,
  Copy,
  ExternalLink,
  Check
} from "lucide-react";

export default function Settings() {
  const { restaurant, loading } = useRestaurant();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Restaurant info state
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: restaurant?.name || "",
    address: restaurant?.address || "",
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    cuisine_type: restaurant?.cuisine_type || "",
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    card: true,
    mobile_money: true,
  });

  // Tax settings
  const [taxSettings, setTaxSettings] = useState({
    enabled: true,
    rate: 18,
  });

  // Update restaurant info when loaded
  useState(() => {
    if (restaurant) {
      setRestaurantInfo({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        cuisine_type: restaurant.cuisine_type || "",
      });
    }
  });

  const handleSaveRestaurantInfo = async () => {
    if (!restaurant) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: restaurantInfo.name,
          address: restaurantInfo.address,
          phone: restaurantInfo.phone,
          email: restaurantInfo.email,
          cuisine_type: restaurantInfo.cuisine_type,
        })
        .eq("id", restaurant.id);

      if (error) throw error;

      toast({
        title: "Paramètres enregistrés",
        description: "Les informations du restaurant ont été mises à jour.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Paramètres</h1>
          <p className="text-muted-foreground mt-1">
            Configurez votre restaurant et vos préférences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="general" className="gap-2">
              <Building2 size={16} />
              <span className="hidden sm:inline">Général</span>
            </TabsTrigger>
            <TabsTrigger value="menu-qr" className="gap-2">
              <QrCode size={16} />
              <span className="hidden sm:inline">Menu QR</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard size={16} />
              <span className="hidden sm:inline">Paiements</span>
            </TabsTrigger>
            <TabsTrigger value="taxes" className="gap-2">
              <Receipt size={16} />
              <span className="hidden sm:inline">Taxes</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell size={16} />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations du restaurant
                </CardTitle>
                <CardDescription>
                  Modifiez les informations générales de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du restaurant</Label>
                    <Input
                      id="name"
                      value={restaurantInfo.name}
                      onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                      placeholder="Mon Restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Type de cuisine</Label>
                    <Input
                      id="cuisine"
                      value={restaurantInfo.cuisine_type}
                      onChange={(e) => setRestaurantInfo({ ...restaurantInfo, cuisine_type: e.target.value })}
                      placeholder="Africaine, Française..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    value={restaurantInfo.address}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                    placeholder="123 Rue Example, Ville"
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={restaurantInfo.phone}
                      onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                      placeholder="+225 00 00 00 00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={restaurantInfo.email}
                      onChange={(e) => setRestaurantInfo({ ...restaurantInfo, email: e.target.value })}
                      placeholder="contact@restaurant.com"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveRestaurantInfo} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu QR Settings */}
          <TabsContent value="menu-qr">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Menu QR Code
                </CardTitle>
                <CardDescription>
                  Partagez votre menu en ligne avec vos clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border border-border bg-muted/30 p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Lien de votre menu</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Partagez ce lien avec vos clients ou générez un QR code à afficher dans votre restaurant.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={`${window.location.origin}/menu/${restaurant?.id}`}
                          className="flex-1 font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/menu/${restaurant?.id}`);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                            toast({
                              title: "Lien copié !",
                              description: "Le lien du menu a été copié dans le presse-papier.",
                            });
                          }}
                        >
                          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(`/menu/${restaurant?.id}`, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <QrCode className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">QR Code à imprimer</h4>
                        <p className="text-sm text-muted-foreground">Affichez le QR code sur vos tables</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        // Generate QR code using a free API
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`${window.location.origin}/menu/${restaurant?.id}`)}`;
                        window.open(qrUrl, "_blank");
                      }}
                    >
                      Télécharger le QR Code
                    </Button>
                  </div>

                  <div className="rounded-xl border border-border p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <span className="text-2xl">📱</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Partager via WhatsApp</h4>
                        <p className="text-sm text-muted-foreground">Envoyez le menu à vos clients</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        const message = `Découvrez notre menu : ${window.location.origin}/menu/${restaurant?.id}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
                      }}
                    >
                      Partager sur WhatsApp
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-medium mb-2">💡 Conseils</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Imprimez le QR code et placez-le sur chaque table de votre restaurant</li>
                    <li>• Ajoutez le lien à votre page Google My Business et réseaux sociaux</li>
                    <li>• Le menu se met à jour automatiquement quand vous modifiez vos plats</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Modes de paiement
                </CardTitle>
                <CardDescription>
                  Configurez les modes de paiement acceptés dans votre restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <span className="text-xl">💵</span>
                      </div>
                      <div>
                        <p className="font-medium">Espèces</p>
                        <p className="text-sm text-muted-foreground">Paiement en liquide</p>
                      </div>
                    </div>
                    <Switch
                      checked={paymentMethods.cash}
                      onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, cash: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xl">💳</span>
                      </div>
                      <div>
                        <p className="font-medium">Carte bancaire</p>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, etc.</p>
                      </div>
                    </div>
                    <Switch
                      checked={paymentMethods.card}
                      onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, card: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <span className="text-xl">📱</span>
                      </div>
                      <div>
                        <p className="font-medium">Mobile Money</p>
                        <p className="text-sm text-muted-foreground">Orange Money, MTN, Wave...</p>
                      </div>
                    </div>
                    <Switch
                      checked={paymentMethods.mobile_money}
                      onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, mobile_money: checked })}
                    />
                  </div>
                </div>

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Settings */}
          <TabsContent value="taxes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Configuration des taxes
                </CardTitle>
                <CardDescription>
                  Gérez les paramètres de TVA et taxes applicables
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <p className="font-medium">Appliquer la TVA</p>
                    <p className="text-sm text-muted-foreground">
                      Ajouter automatiquement la TVA aux commandes
                    </p>
                  </div>
                  <Switch
                    checked={taxSettings.enabled}
                    onCheckedChange={(checked) => setTaxSettings({ ...taxSettings, enabled: checked })}
                  />
                </div>

                {taxSettings.enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Taux de TVA (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxSettings.rate}
                      onChange={(e) => setTaxSettings({ ...taxSettings, rate: parseFloat(e.target.value) || 0 })}
                      min={0}
                      max={100}
                      className="w-32"
                    />
                  </div>
                )}

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configurez vos préférences de notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Alertes de stock</p>
                      <p className="text-sm text-muted-foreground">
                        Notification quand un produit est en rupture
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Nouvelles commandes</p>
                      <p className="text-sm text-muted-foreground">
                        Son et notification pour chaque commande
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Rapports quotidiens</p>
                      <p className="text-sm text-muted-foreground">
                        Email avec le résumé des ventes du jour
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Enregistrer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
