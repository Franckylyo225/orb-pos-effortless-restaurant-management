import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  emoji: string;
}

const menuItems: MenuItem[] = [
  { id: 1, name: "Poulet braisé", description: "Poulet fermier mariné et grillé au feu de bois", price: 6500, category: "Grillades", available: true, emoji: "🍗" },
  { id: 2, name: "Attieke poisson", description: "Attieke frais avec poisson braisé et légumes", price: 6000, category: "Plats", available: true, emoji: "🐟" },
  { id: 3, name: "Alloco", description: "Bananes plantain frites dorées", price: 3000, category: "Accompagnements", available: true, emoji: "🍌" },
  { id: 4, name: "Riz sauce arachide", description: "Riz parfumé avec sauce arachide maison", price: 4500, category: "Plats", available: true, emoji: "🥜" },
  { id: 5, name: "Jus de bissap", description: "Jus d'hibiscus frais maison", price: 1500, category: "Boissons", available: true, emoji: "🍹" },
  { id: 6, name: "Capitaine braisé", description: "Poisson capitaine entier braisé", price: 12000, category: "Grillades", available: false, emoji: "🐠" },
  { id: 7, name: "Thieboudienne", description: "Riz au poisson sénégalais traditionnel", price: 5000, category: "Plats", available: true, emoji: "🍲" },
  { id: 8, name: "Brochettes boeuf", description: "6 brochettes de boeuf mariné grillé", price: 5500, category: "Grillades", available: true, emoji: "🥩" },
];

const categories = ["Tout", "Entrées", "Plats", "Grillades", "Accompagnements", "Boissons", "Desserts"];

export default function Menu() {
  const [items, setItems] = useState(menuItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tout" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAvailability = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">Menu</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos plats et boissons
            </p>
          </div>
          <Button variant="hero">
            <Plus size={20} className="mr-2" />
            Ajouter un plat
          </Button>
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
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-card rounded-2xl border border-border/50 overflow-hidden transition-all hover:shadow-medium ${
                !item.available ? "opacity-60" : ""
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{item.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    {item.price.toLocaleString()} CFA
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleAvailability(item.id)}
                      className={item.available ? "text-success" : "text-muted-foreground"}
                    >
                      {item.available ? <Eye size={18} /> : <EyeOff size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
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
