import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Trash2,
  Percent,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  Search,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", name: "Tout", emoji: "🍽️" },
  { id: "entrees", name: "Entrées", emoji: "🥗" },
  { id: "plats", name: "Plats", emoji: "🍛" },
  { id: "grillades", name: "Grillades", emoji: "🍗" },
  { id: "accompagnements", name: "Accomp.", emoji: "🍚" },
  { id: "boissons", name: "Boissons", emoji: "🥤" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
];

const products = [
  { id: 1, name: "Poulet braisé", price: 6500, category: "grillades", emoji: "🍗" },
  { id: 2, name: "Attieke poisson", price: 6000, category: "plats", emoji: "🐟" },
  { id: 3, name: "Alloco", price: 3000, category: "accompagnements", emoji: "🍌" },
  { id: 4, name: "Riz sauce arachide", price: 4500, category: "plats", emoji: "🥜" },
  { id: 5, name: "Jus de bissap", price: 1500, category: "boissons", emoji: "🍹" },
  { id: 6, name: "Jus de gingembre", price: 1500, category: "boissons", emoji: "🧃" },
  { id: 7, name: "Salade composée", price: 3500, category: "entrees", emoji: "🥗" },
  { id: 8, name: "Brochettes boeuf", price: 5500, category: "grillades", emoji: "🥩" },
  { id: 9, name: "Capitaine braisé", price: 12000, category: "grillades", emoji: "🐠" },
  { id: 10, name: "Thieboudienne", price: 5000, category: "plats", emoji: "🍲" },
  { id: 11, name: "Coca-Cola", price: 1000, category: "boissons", emoji: "🥤" },
  { id: 12, name: "Eau minérale", price: 500, category: "boissons", emoji: "💧" },
  { id: 13, name: "Frites", price: 2000, category: "accompagnements", emoji: "🍟" },
  { id: 14, name: "Banane braisée", price: 1500, category: "desserts", emoji: "🍌" },
  { id: 15, name: "Gâteau chocolat", price: 3000, category: "desserts", emoji: "🍫" },
  { id: 16, name: "Kedjenou poulet", price: 7000, category: "plats", emoji: "🍲" },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export default function POS() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: typeof products[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const handlePayment = (method: string) => {
    toast({
      title: "Paiement validé ✓",
      description: `${total.toLocaleString()} CFA payés par ${method}`,
    });
    setCart([]);
    setDiscount(0);
    setShowPayment(false);
  };

  const sendToKitchen = () => {
    toast({
      title: "Commande envoyée en cuisine 🍳",
      description: `${cart.length} articles pour un total de ${total.toLocaleString()} CFA`,
    });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-0px)] flex">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Categories */}
          <div className="p-4 md:p-6 border-b border-border bg-card space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <span>{category.emoji}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="pos-button flex flex-col items-center justify-center gap-2 bg-card border-2 border-border hover:border-primary/50 hover:shadow-medium p-4"
                >
                  <span className="text-3xl md:text-4xl">{product.emoji}</span>
                  <span className="font-medium text-sm md:text-base text-center line-clamp-2">
                    {product.name}
                  </span>
                  <span className="text-primary font-bold">
                    {product.price.toLocaleString()} CFA
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full md:w-96 bg-card border-l border-border flex flex-col">
          {/* Cart Header */}
          <div className="p-4 md:p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">
                Commande en cours
              </h2>
              <span className="text-muted-foreground text-sm">
                Table 5
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Receipt size={48} className="mb-4 opacity-50" />
                <p>Panier vide</p>
                <p className="text-sm">Sélectionnez des produits</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.price.toLocaleString()} CFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="border-t border-border p-4 space-y-4">
              {/* Discount */}
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Remise %"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-10"
                  min={0}
                  max={100}
                />
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span>{subtotal.toLocaleString()} CFA</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Remise ({discount}%)</span>
                    <span>-{discountAmount.toLocaleString()} CFA</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>{total.toLocaleString()} CFA</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-14"
                  onClick={sendToKitchen}
                >
                  <Send size={18} className="mr-2" />
                  Cuisine
                </Button>
                <Button
                  variant="pos-success"
                  className="h-14"
                  onClick={() => setShowPayment(true)}
                >
                  <CreditCard size={18} className="mr-2" />
                  Payer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl shadow-large w-full max-w-md animate-scale-in">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-display font-bold text-xl">
                  Mode de paiement
                </h2>
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center mb-6">
                  <p className="text-muted-foreground">Total à payer</p>
                  <p className="text-4xl font-bold text-primary">
                    {total.toLocaleString()} CFA
                  </p>
                </div>
                <Button
                  variant="pos"
                  className="w-full"
                  onClick={() => handlePayment("Espèces")}
                >
                  <Banknote size={24} className="mr-3" />
                  Espèces
                </Button>
                <Button
                  variant="pos"
                  className="w-full"
                  onClick={() => handlePayment("Carte bancaire")}
                >
                  <CreditCard size={24} className="mr-3" />
                  Carte bancaire
                </Button>
                <Button
                  variant="pos"
                  className="w-full"
                  onClick={() => handlePayment("Mobile Money")}
                >
                  <Smartphone size={24} className="mr-3" />
                  Mobile Money
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
