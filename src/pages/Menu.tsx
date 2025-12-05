import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
} from "lucide-react";
import { useMenu } from "@/hooks/useMenu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const foodEmojis = ["🍗", "🐟", "🍌", "🥜", "🍹", "🐠", "🍲", "🥩", "🥗", "🍕", "🍔", "🌮", "🍰", "☕", "🍺"];

export default function Menu() {
  const { categories, menuItems, loading, addCategory, addMenuItem, toggleAvailability, deleteMenuItem } = useMenu();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    cost_price: "",
    emoji: "🍽️",
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    
    setIsSubmitting(true);
    await addMenuItem({
      name: newItem.name,
      description: newItem.description,
      price: parseFloat(newItem.price),
      category_id: newItem.category_id || undefined,
      cost_price: newItem.cost_price ? parseFloat(newItem.cost_price) : 0,
    });
    
    setNewItem({ name: "", description: "", price: "", category_id: "", cost_price: "", emoji: "🍽️" });
    setShowAddItem(false);
    setIsSubmitting(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    
    setIsSubmitting(true);
    await addCategory(newCategory);
    setNewCategory({ name: "", description: "" });
    setShowAddCategory(false);
    setIsSubmitting(false);
  };

  const getItemEmoji = (item: typeof menuItems[0]) => {
    const categoryName = item.category?.name?.toLowerCase() || "";
    if (categoryName.includes("grill") || categoryName.includes("viande")) return "🍗";
    if (categoryName.includes("poisson")) return "🐟";
    if (categoryName.includes("boisson")) return "🍹";
    if (categoryName.includes("dessert")) return "🍰";
    if (categoryName.includes("entrée") || categoryName.includes("salade")) return "🥗";
    return "🍽️";
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Menu</h1>
            <p className="text-muted-foreground mt-1">
              {menuItems.length} plats • {categories.length} catégories
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus size={20} className="mr-2" />
                  Catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvelle catégorie</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      placeholder="Ex: Grillades"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (optionnel)</Label>
                    <Textarea
                      placeholder="Description de la catégorie"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddCategory} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus size={20} className="mr-2" />
                  Ajouter un plat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nouveau plat</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nom du plat *</Label>
                    <Input
                      placeholder="Ex: Poulet braisé"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Description du plat"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Prix (CFA) *</Label>
                      <Input
                        type="number"
                        placeholder="6500"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Coût matière</Label>
                      <Input
                        type="number"
                        placeholder="3000"
                        value={newItem.cost_price}
                        onChange={(e) => setNewItem({ ...newItem, cost_price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={newItem.category_id}
                      onValueChange={(value) => setNewItem({ ...newItem, category_id: value })}
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
                  <Button className="w-full" onClick={handleAddItem} disabled={isSubmitting || !newItem.name || !newItem.price}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ajouter le plat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Tout
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {menuItems.length === 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <p className="text-4xl mb-4">🍽️</p>
            <h3 className="font-semibold text-lg mb-2">Aucun plat</h3>
            <p className="text-muted-foreground mb-4">Commencez par ajouter des catégories puis des plats</p>
            <Button variant="hero" onClick={() => setShowAddCategory(true)}>
              <Plus size={20} className="mr-2" />
              Créer une catégorie
            </Button>
          </div>
        )}

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-2xl border border-border/50 overflow-hidden transition-all hover:shadow-medium ${
                !item.is_available ? "opacity-60" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getItemEmoji(item)}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {item.category && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {item.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {Number(item.price).toLocaleString()} CFA
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleAvailability(item.id, !item.is_available)}
                      className={item.is_available ? "text-success" : "text-muted-foreground"}
                    >
                      {item.is_available ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMenuItem(item.id)}>
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
