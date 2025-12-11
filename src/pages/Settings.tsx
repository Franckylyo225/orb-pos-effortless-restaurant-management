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
  Check,
  Upload,
  ImageIcon,
  Trash2
} from "lucide-react";

export default function Settings() {
  const { restaurant, loading } = useRestaurant();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [savingMenu, setSavingMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Menu customization state
  const [menuSettings, setMenuSettings] = useState({
    menu_primary_color: "#ea580c",
    menu_bg_style: "light",
    menu_show_logo: true,
    menu_show_address: true,
    menu_show_phone: true,
    menu_welcome_message: "",
    menu_cover_image: "",
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  
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
      // Load logo URL
      setLogoUrl(restaurant.logo_url || "");
      // Load menu settings from restaurant data
      setMenuSettings({
        menu_primary_color: (restaurant as any).menu_primary_color || "#ea580c",
        menu_bg_style: (restaurant as any).menu_bg_style || "light",
        menu_show_logo: (restaurant as any).menu_show_logo ?? true,
        menu_show_address: (restaurant as any).menu_show_address ?? true,
        menu_show_phone: (restaurant as any).menu_show_phone ?? true,
        menu_welcome_message: (restaurant as any).menu_welcome_message || "",
        menu_cover_image: (restaurant as any).menu_cover_image || "",
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !restaurant) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fichier invalide",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Le logo ne doit pas dépasser 2 Mo.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/logo.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('menu-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-assets')
        .getPublicUrl(fileName);

      // Update state
      setLogoUrl(publicUrl);

      // Save to database
      await supabase
        .from("restaurants")
        .update({ logo_url: publicUrl })
        .eq("id", restaurant.id);

      toast({
        title: "Logo téléchargé",
        description: "Le logo du restaurant a été mis à jour.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le logo.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!restaurant) return;

    try {
      // Remove from database
      await supabase
        .from("restaurants")
        .update({ logo_url: null })
        .eq("id", restaurant.id);

      setLogoUrl("");

      toast({
        title: "Logo supprimé",
        description: "Le logo du restaurant a été retiré.",
      });
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le logo.",
        variant: "destructive",
      });
    }
  };


    if (!restaurant) return;
    
    setSavingMenu(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          menu_primary_color: menuSettings.menu_primary_color,
          menu_bg_style: menuSettings.menu_bg_style,
          menu_show_logo: menuSettings.menu_show_logo,
          menu_show_address: menuSettings.menu_show_address,
          menu_show_phone: menuSettings.menu_show_phone,
          menu_welcome_message: menuSettings.menu_welcome_message || null,
          menu_cover_image: menuSettings.menu_cover_image || null,
        })
        .eq("id", restaurant.id);

      if (error) throw error;

      toast({
        title: "Apparence mise à jour",
        description: "Les paramètres du menu public ont été enregistrés.",
      });
    } catch (error) {
      console.error("Error saving menu settings:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    } finally {
      setSavingMenu(false);
    }
  };

  const handleCoverImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !restaurant) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Fichier invalide",
        description: "Veuillez sélectionner une image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "L'image ne doit pas dépasser 5 Mo.",
        variant: "destructive",
      });
      return;
    }

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/cover.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('menu-assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-assets')
        .getPublicUrl(fileName);

      // Update state
      setMenuSettings({ ...menuSettings, menu_cover_image: publicUrl });

      // Save to database
      await supabase
        .from("restaurants")
        .update({ menu_cover_image: publicUrl })
        .eq("id", restaurant.id);

      toast({
        title: "Image téléchargée",
        description: "L'image de couverture a été mise à jour.",
      });
    } catch (error) {
      console.error("Error uploading cover:", error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image.",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleRemoveCoverImage = async () => {
    if (!restaurant) return;

    try {
      // Remove from database
      await supabase
        .from("restaurants")
        .update({ menu_cover_image: null })
        .eq("id", restaurant.id);

      setMenuSettings({ ...menuSettings, menu_cover_image: "" });

      toast({
        title: "Image supprimée",
        description: "L'image de couverture a été retirée.",
      });
    } catch (error) {
      console.error("Error removing cover:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image.",
        variant: "destructive",
      });
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
          <TabsContent value="general" className="space-y-6">
            {/* Logo Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Logo du restaurant
                </CardTitle>
                <CardDescription>
                  Ajoutez ou modifiez le logo de votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  {/* Logo Preview */}
                  <div className="relative">
                    {logoUrl ? (
                      <div className="relative group">
                        <img
                          src={logoUrl}
                          alt="Logo du restaurant"
                          className="w-32 h-32 rounded-xl object-cover border border-border shadow-sm"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              disabled={uploadingLogo}
                            />
                            <div className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                              <Upload className="h-5 w-5 text-white" />
                            </div>
                          </label>
                          <button
                            onClick={handleRemoveLogo}
                            className="p-2 bg-white/20 rounded-lg hover:bg-destructive/80 transition-colors"
                          >
                            <Trash2 className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                        <div className="w-32 h-32 rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors">
                          {uploadingLogo ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Ajouter</span>
                            </>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                  
                  {/* Logo Instructions */}
                  <div className="flex-1 space-y-2">
                    <h4 className="font-medium">Recommandations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Format carré recommandé (ex: 512x512 pixels)</li>
                      <li>• Formats acceptés : JPG, PNG, WebP</li>
                      <li>• Taille maximale : 2 Mo</li>
                      <li>• Fond transparent recommandé (PNG)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restaurant Info */}
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

                {/* Customization Section */}
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Personnalisation de l'apparence</CardTitle>
                    <CardDescription>
                      Adaptez le design du menu à votre marque
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Cover Image Upload */}
                    <div className="space-y-3">
                      <Label>Image de couverture</Label>
                      <p className="text-sm text-muted-foreground">
                        Une belle image en haut de votre menu (recommandé: 1200x400px)
                      </p>
                      
                      {menuSettings.menu_cover_image ? (
                        <div className="relative rounded-xl overflow-hidden border border-border">
                          <img
                            src={menuSettings.menu_cover_image}
                            alt="Cover"
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverImageUpload}
                                className="hidden"
                              />
                              <Button variant="secondary" size="sm" asChild>
                                <span>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Changer
                                </span>
                              </Button>
                            </label>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleRemoveCoverImage}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                            className="hidden"
                            disabled={uploadingCover}
                          />
                          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors">
                            {uploadingCover ? (
                              <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Téléchargement...</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <span className="text-sm font-medium">Cliquez pour ajouter une image</span>
                                <span className="text-xs text-muted-foreground">PNG, JPG jusqu'à 5 Mo</span>
                              </div>
                            )}
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Color Picker */}
                    <div className="space-y-3">
                      <Label>Couleur principale</Label>
                      <div className="flex gap-3 flex-wrap">
                        {[
                          { color: "#ea580c", name: "Orange" },
                          { color: "#16a34a", name: "Vert" },
                          { color: "#2563eb", name: "Bleu" },
                          { color: "#dc2626", name: "Rouge" },
                          { color: "#7c3aed", name: "Violet" },
                          { color: "#0891b2", name: "Cyan" },
                          { color: "#ca8a04", name: "Or" },
                          { color: "#be185d", name: "Rose" },
                        ].map((item) => (
                          <button
                            key={item.color}
                            onClick={() => setMenuSettings({ ...menuSettings, menu_primary_color: item.color })}
                            className={`w-10 h-10 rounded-xl border-2 transition-all ${
                              menuSettings.menu_primary_color === item.color
                                ? "border-foreground scale-110 shadow-lg"
                                : "border-transparent hover:scale-105"
                            }`}
                            style={{ backgroundColor: item.color }}
                            title={item.name}
                          />
                        ))}
                        <div className="flex items-center gap-2">
                          <Input
                            type="color"
                            value={menuSettings.menu_primary_color}
                            onChange={(e) => setMenuSettings({ ...menuSettings, menu_primary_color: e.target.value })}
                            className="w-10 h-10 p-1 cursor-pointer"
                          />
                          <span className="text-sm text-muted-foreground">Personnalisé</span>
                        </div>
                      </div>
                    </div>

                    {/* Background Style */}
                    <div className="space-y-3">
                      <Label>Style de fond</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "light", label: "Clair", icon: "☀️" },
                          { value: "dark", label: "Sombre", icon: "🌙" },
                          { value: "warm", label: "Chaleureux", icon: "🔥" },
                        ].map((style) => (
                          <button
                            key={style.value}
                            onClick={() => setMenuSettings({ ...menuSettings, menu_bg_style: style.value })}
                            className={`p-4 rounded-xl border-2 transition-all text-center ${
                              menuSettings.menu_bg_style === style.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="text-2xl block mb-1">{style.icon}</span>
                            <span className="text-sm font-medium">{style.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-4">
                      <Label>Options d'affichage</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">Afficher le logo</p>
                            <p className="text-sm text-muted-foreground">Votre logo apparaît en haut du menu</p>
                          </div>
                          <Switch
                            checked={menuSettings.menu_show_logo}
                            onCheckedChange={(checked) => setMenuSettings({ ...menuSettings, menu_show_logo: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">Afficher l'adresse</p>
                            <p className="text-sm text-muted-foreground">L'adresse du restaurant est visible</p>
                          </div>
                          <Switch
                            checked={menuSettings.menu_show_address}
                            onCheckedChange={(checked) => setMenuSettings({ ...menuSettings, menu_show_address: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">Afficher le téléphone</p>
                            <p className="text-sm text-muted-foreground">Les clients peuvent vous appeler</p>
                          </div>
                          <Switch
                            checked={menuSettings.menu_show_phone}
                            onCheckedChange={(checked) => setMenuSettings({ ...menuSettings, menu_show_phone: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Welcome Message */}
                    <div className="space-y-2">
                      <Label htmlFor="welcome">Message de bienvenue (optionnel)</Label>
                      <Textarea
                        id="welcome"
                        value={menuSettings.menu_welcome_message}
                        onChange={(e) => setMenuSettings({ ...menuSettings, menu_welcome_message: e.target.value })}
                        placeholder="Bienvenue chez nous ! Découvrez nos spécialités..."
                        rows={2}
                      />
                    </div>

                    <Button onClick={handleSaveMenuSettings} disabled={savingMenu} className="w-full gap-2">
                      {savingMenu ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Enregistrer l'apparence
                    </Button>
                  </CardContent>
                </Card>
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
