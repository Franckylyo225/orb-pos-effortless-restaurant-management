import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Category, MenuItem } from "@/hooks/useMenu";

const foodEmojis = [
  "🍽️", "🍗", "🐟", "🍌", "🥜", "🍹", "🐠", "🍲", "🥩", "🥗", 
  "🍕", "🍔", "🌮", "🍰", "☕", "🍺", "🍝", "🥘", "🍛", "🍜",
  "🌯", "🥪", "🍟", "🧆", "🥙", "🍖", "🦐", "🦞", "🍣", "🥧"
];

interface Variant {
  name: string;
  price: number;
}

interface MenuItemFormProps {
  categories: Category[];
  onSubmit: (data: {
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    cost_price?: number;
    image_url?: string | null;
    variants?: Variant[];
  }) => Promise<void>;
  onCancel: () => void;
  initialData?: MenuItem | null;
  isEditing?: boolean;
}

export function MenuItemForm({ 
  categories, 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false 
}: MenuItemFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Détecter si l'image_url est un emoji ou une vraie URL
  const isEmojiUrl = (url: string | null | undefined) => {
    if (!url) return false;
    return url.startsWith("emoji:") || foodEmojis.includes(url);
  };
  
  const getInitialEmoji = () => {
    if (initialData?.image_url?.startsWith("emoji:")) {
      return initialData.image_url.replace("emoji:", "");
    }
    if (initialData?.image_url && foodEmojis.includes(initialData.image_url)) {
      return initialData.image_url;
    }
    return "🍽️";
  };
  
  const getInitialImageUrl = () => {
    if (!initialData?.image_url) return "";
    if (isEmojiUrl(initialData.image_url)) return "";
    return initialData.image_url;
  };
  
  const getInitialVariants = (): Variant[] => {
    if (initialData?.variants && Array.isArray(initialData.variants)) {
      return (initialData.variants as unknown as Variant[]).filter(
        (v): v is Variant => typeof v === 'object' && v !== null && 'name' in v && 'price' in v
      );
    }
    return [];
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    category_id: initialData?.category_id || "",
    cost_price: initialData?.cost_price?.toString() || "",
    image_url: getInitialImageUrl(),
    emoji: getInitialEmoji(),
  });

  const [hasVariants, setHasVariants] = useState(getInitialVariants().length > 0);
  const [variants, setVariants] = useState<Variant[]>(
    getInitialVariants().length > 0 
      ? getInitialVariants() 
      : [{ name: "Petit", price: 0 }, { name: "Moyen", price: 0 }, { name: "Grand", price: 0 }]
  );

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", price: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    if (field === "price") {
      newVariants[index][field] = parseFloat(value as string) || 0;
    } else {
      newVariants[index][field] = value as string;
    }
    setVariants(newVariants);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Erreur", description: "Veuillez sélectionner une image", variant: "destructive" });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Erreur", description: "L'image ne doit pas dépasser 5MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `menu-items/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("menu-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("menu-assets")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: "Image téléchargée" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ title: "Erreur", description: "Échec du téléchargement", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const handleEmojiSelect = (emoji: string) => {
    setFormData(prev => ({ ...prev, emoji, image_url: `emoji:${emoji}` }));
    setShowEmojiPicker(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) return;
    
    setIsSubmitting(true);
    try {
      // Si pas d'image URL, utiliser l'emoji
      const finalImageUrl = formData.image_url || `emoji:${formData.emoji}`;
      
      // Filtrer les variantes vides
      const validVariants = hasVariants 
        ? variants.filter(v => v.name.trim() && v.price > 0)
        : [];
      
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category_id: formData.category_id || undefined,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : 0,
        image_url: finalImageUrl,
        variants: validVariants,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Image/Icon Section */}
      <div className="space-y-2">
        <Label>Image ou icône</Label>
        <div className="flex gap-4 items-start">
          {/* Image Preview / Upload */}
          <div 
            className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary transition-colors relative group"
            onClick={() => !formData.image_url && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : formData.image_url && !formData.image_url.startsWith("emoji:") ? (
              <>
                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <div className="text-center">
                <span className="text-4xl">{formData.emoji}</span>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload size={16} className="mr-2" />
              {isUploading ? "Téléchargement..." : "Télécharger image"}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <ImageIcon size={16} className="mr-2" />
              Choisir icône
            </Button>
          </div>
        </div>
        
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="grid grid-cols-10 gap-1 p-2 bg-muted rounded-xl mt-2">
            {foodEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`text-2xl p-2 rounded-lg hover:bg-background transition-colors ${
                  formData.emoji === emoji && !formData.image_url ? "bg-primary/20 ring-2 ring-primary" : ""
                }`}
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label>Nom du plat *</Label>
        <Input
          placeholder="Ex: Poulet braisé"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Description du plat"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Variants Section */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Variantes de taille</Label>
          <Switch
            checked={hasVariants}
            onCheckedChange={setHasVariants}
          />
        </div>
        
        {hasVariants && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Définissez les tailles disponibles et leurs prix
            </p>
            
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Taille (ex: Petit)"
                  value={variant.name}
                  onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Prix"
                  value={variant.price || ""}
                  onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                  className="w-28"
                />
                <span className="text-sm text-muted-foreground">CFA</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveVariant(index)}
                  className="shrink-0"
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVariant}
              className="w-full mt-2"
            >
              <Plus size={16} className="mr-2" />
              Ajouter une variante
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prix (CFA) *</Label>
          <Input
            type="number"
            placeholder="6500"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Coût matière</Label>
          <Input
            type="number"
            placeholder="3000"
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
          />
        </div>
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <Label>Catégorie</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Submit Button */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Annuler
        </Button>
        <Button 
          className="flex-1" 
          onClick={handleSubmit} 
          disabled={isSubmitting || !formData.name || !formData.price}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {isEditing ? "Enregistrer" : "Ajouter"}
        </Button>
      </div>
    </div>
  );
}
