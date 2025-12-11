import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  Trash2,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Loader2,
  Truck,
} from "lucide-react";
import { useStock } from "@/hooks/useStock";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FeatureGate } from "@/components/subscription";
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures";

function StockContent() {
  const { suppliers, products, lowStockProducts, loading, addSupplier, addProduct, addStockMovement, deleteProduct } = useStock();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    unit: "kg",
    current_stock: "",
    min_stock_threshold: "5",
    cost_per_unit: "",
    supplier_id: "",
  });

  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [stockMovement, setStockMovement] = useState({
    quantity: "",
    type: "in" as "in" | "out" | "adjustment",
    notes: "",
  });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.unit) return;

    setIsSubmitting(true);
    await addProduct({
      name: newProduct.name,
      unit: newProduct.unit,
      current_stock: newProduct.current_stock ? parseFloat(newProduct.current_stock) : 0,
      min_stock_threshold: parseFloat(newProduct.min_stock_threshold),
      cost_per_unit: newProduct.cost_per_unit ? parseFloat(newProduct.cost_per_unit) : 0,
      supplier_id: newProduct.supplier_id || undefined,
    });

    setNewProduct({ name: "", unit: "kg", current_stock: "", min_stock_threshold: "5", cost_per_unit: "", supplier_id: "" });
    setShowAddProduct(false);
    setIsSubmitting(false);
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) return;

    setIsSubmitting(true);
    await addSupplier(newSupplier);
    setNewSupplier({ name: "", contact_name: "", phone: "", email: "", address: "" });
    setShowAddSupplier(false);
    setIsSubmitting(false);
  };

  const handleAddStockMovement = async () => {
    if (!selectedProduct || !stockMovement.quantity) return;

    setIsSubmitting(true);
    await addStockMovement(
      selectedProduct,
      parseFloat(stockMovement.quantity),
      stockMovement.type,
      stockMovement.notes
    );

    setStockMovement({ quantity: "", type: "in", notes: "" });
    setShowAddStock(false);
    setSelectedProduct("");
    setIsSubmitting(false);
  };

  const units = ["kg", "L", "unité", "pièce", "g", "mL", "carton", "sac"];

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
            <h1 className="font-display text-2xl md:text-3xl font-bold">Stock & Inventaire</h1>
            <p className="text-muted-foreground mt-1">
              {products.length} produits • {suppliers.length} fournisseurs
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Truck size={20} className="mr-2" />
                  Fournisseur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau fournisseur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      placeholder="Ex: Marché Adjamé"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact</Label>
                    <Input
                      placeholder="Nom du contact"
                      value={newSupplier.contact_name}
                      onChange={(e) => setNewSupplier({ ...newSupplier, contact_name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        placeholder="+225 XX XX XX XX"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleAddSupplier} disabled={isSubmitting || !newSupplier.name}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus size={20} className="mr-2" />
                  Nouveau produit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nouveau produit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Nom du produit *</Label>
                    <Input
                      placeholder="Ex: Huile de palme"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Unité *</Label>
                      <Select
                        value={newProduct.unit}
                        onValueChange={(value) => setNewProduct({ ...newProduct, unit: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Stock initial</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newProduct.current_stock}
                        onChange={(e) => setNewProduct({ ...newProduct, current_stock: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Seuil d'alerte</Label>
                      <Input
                        type="number"
                        placeholder="5"
                        value={newProduct.min_stock_threshold}
                        onChange={(e) => setNewProduct({ ...newProduct, min_stock_threshold: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Coût unitaire</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newProduct.cost_per_unit}
                        onChange={(e) => setNewProduct({ ...newProduct, cost_per_unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Fournisseur</Label>
                    <Select
                      value={newProduct.supplier_id}
                      onValueChange={(value) => setNewProduct({ ...newProduct, supplier_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fournisseur" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleAddProduct} disabled={isSubmitting || !newProduct.name}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Ajouter le produit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-destructive/20 text-destructive flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-destructive">Stock faible</h3>
              <p className="text-sm text-muted-foreground">
                {lowStockProducts.length} produit(s) en dessous du seuil d'alerte: {lowStockProducts.map(p => p.name).join(", ")}
              </p>
            </div>
          </div>
        )}

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Empty State */}
            {products.length === 0 && (
              <div className="text-center py-16 bg-muted/30 rounded-2xl">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucun produit</h3>
                <p className="text-muted-foreground mb-4">Ajoutez des produits pour gérer votre stock</p>
                <Button variant="hero" onClick={() => setShowAddProduct(true)}>
                  <Plus size={20} className="mr-2" />
                  Ajouter un produit
                </Button>
              </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const isLow = product.current_stock <= product.min_stock_threshold;
                return (
                  <div
                    key={product.id}
                    className={`bg-card rounded-2xl border overflow-hidden transition-all hover:shadow-medium ${
                      isLow ? "border-destructive/50" : "border-border/50"
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.supplier?.name || "Pas de fournisseur"}
                          </p>
                        </div>
                        {isLow && (
                          <div className="w-8 h-8 rounded-full bg-destructive/20 text-destructive flex items-center justify-center">
                            <AlertTriangle size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className={`text-3xl font-bold ${isLow ? "text-destructive" : "text-foreground"}`}>
                            {Number(product.current_stock).toFixed(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.unit} • Seuil: {product.min_stock_threshold}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-success"
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setStockMovement({ ...stockMovement, type: "in" });
                              setShowAddStock(true);
                            }}
                          >
                            <TrendingUp size={18} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-warning"
                            onClick={() => {
                              setSelectedProduct(product.id);
                              setStockMovement({ ...stockMovement, type: "out" });
                              setShowAddStock(true);
                            }}
                          >
                            <TrendingDown size={18} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-4">
            {/* Empty State */}
            {suppliers.length === 0 && (
              <div className="text-center py-16 bg-muted/30 rounded-2xl">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Aucun fournisseur</h3>
                <p className="text-muted-foreground mb-4">Ajoutez vos fournisseurs pour les associer aux produits</p>
                <Button variant="hero" onClick={() => setShowAddSupplier(true)}>
                  <Plus size={20} className="mr-2" />
                  Ajouter un fournisseur
                </Button>
              </div>
            )}

            {/* Suppliers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="bg-card rounded-2xl border border-border/50 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{supplier.name}</h3>
                      {supplier.contact_name && (
                        <p className="text-sm text-muted-foreground">{supplier.contact_name}</p>
                      )}
                    </div>
                  </div>
                  {supplier.phone && (
                    <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                  )}
                  {supplier.email && (
                    <p className="text-sm text-muted-foreground">{supplier.email}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Stock Movement Dialog */}
        <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {stockMovement.type === "in" ? "Entrée de stock" : "Sortie de stock"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Quantité</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={stockMovement.quantity}
                  onChange={(e) => setStockMovement({ ...stockMovement, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Input
                  placeholder="Ex: Livraison fournisseur"
                  value={stockMovement.notes}
                  onChange={(e) => setStockMovement({ ...stockMovement, notes: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleAddStockMovement} disabled={isSubmitting || !stockMovement.quantity}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Valider
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default function Stock() {
  return (
    <FeatureGate feature="stock_management">
      <StockContent />
    </FeatureGate>
  );
}
