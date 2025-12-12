import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TodayStatsBar } from "@/components/dashboard/TodayStatsBar";
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
  Loader2,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMenu, MenuItem } from "@/hooks/useMenu";
import { useOrders, OrderItem } from "@/hooks/useOrders";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useMobileMoneyProviders } from "@/hooks/useMobileMoneyProviders";
import { PaymentSuccessModal } from "@/components/pos/PaymentSuccessModal";
import { VariantSelectionModal } from "@/components/pos/VariantSelectionModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Variant {
  name: string;
  price: number;
}

interface CartItem extends OrderItem {
  emoji: string;
  variant?: string;
}

interface PaymentSuccessData {
  orderNumber: number;
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  paymentMethod: string;
  tableName?: string;
}

export default function POS() {
  const { categories, menuItems, loading: menuLoading } = useMenu();
  const { orders, tables, createOrder, updateOrderStatus, processPayment, loading: ordersLoading } = useOrders();
  const { restaurant } = useRestaurant();
  const { enabledProviders, loading: providersLoading } = useMobileMoneyProviders();
  useOrderNotifications("pos");
  
  // Filter ready orders for payment
  const readyOrders = orders.filter((order) => order.status === "ready");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [showMobileMoneyOptions, setShowMobileMoneyOptions] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentSuccessData | null>(null);
  const [variantModalItem, setVariantModalItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();

  const loading = menuLoading || ordersLoading;

  const filteredProducts = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.is_available;
  });

  const getItemDisplay = (item: typeof menuItems[0]) => {
    // Check if image_url is an emoji format
    if (item.image_url?.startsWith("emoji:")) {
      const emoji = item.image_url.replace("emoji:", "");
      return { type: "emoji" as const, value: emoji };
    }
    
    // Real image URL
    if (item.image_url && !item.image_url.startsWith("emoji:")) {
      return { type: "image" as const, value: item.image_url };
    }
    
    // Fallback to emoji based on category
    const categoryName = item.category?.name?.toLowerCase() || "";
    let emoji = "🍽️";
    if (categoryName.includes("grill") || categoryName.includes("viande")) emoji = "🍗";
    else if (categoryName.includes("poisson")) emoji = "🐟";
    else if (categoryName.includes("boisson")) emoji = "🍹";
    else if (categoryName.includes("dessert")) emoji = "🍰";
    else if (categoryName.includes("entrée") || categoryName.includes("salade")) emoji = "🥗";
    else if (categoryName.includes("accomp")) emoji = "🍚";
    
    return { type: "emoji" as const, value: emoji };
  };

  const hasVariants = (item: MenuItem): boolean => {
    const variants = item.variants as unknown as Variant[];
    return Array.isArray(variants) && variants.some(v => v.name && v.price > 0);
  };

  const handleProductClick = (item: MenuItem) => {
    if (hasVariants(item)) {
      setVariantModalItem(item);
    } else {
      addToCart(item, Number(item.price));
    }
  };

  const addToCart = (item: MenuItem, price: number, variantName?: string) => {
    const display = getItemDisplay(item);
    const cartKey = variantName ? `${item.id}-${variantName}` : item.id;
    const displayName = variantName ? `${item.name} (${variantName})` : item.name;
    
    setCart((prev) => {
      const existing = prev.find((cartItem) => 
        cartItem.menu_item_id === item.id && cartItem.variant === variantName
      );
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.menu_item_id === item.id && cartItem.variant === variantName
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          menu_item_id: item.id,
          name: displayName,
          price: price,
          quantity: 1,
          emoji: display.value,
          variant: variantName,
        },
      ];
    });
  };

  const handleSelectVariant = (item: MenuItem, variant: Variant) => {
    addToCart(item, variant.price, variant.name);
  };

  const handleSelectBase = (item: MenuItem) => {
    addToCart(item, Number(item.price));
  };

  const updateQuantity = (menuItemId: string, variant: string | undefined, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.menu_item_id === menuItemId && item.variant === variant
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (menuItemId: string, variant: string | undefined) => {
    setCart((prev) => prev.filter((item) => !(item.menu_item_id === menuItemId && item.variant === variant)));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  const sendToKitchen = async () => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    const { error, order } = await createOrder(
      cart.map((item) => ({
        menu_item_id: item.menu_item_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      selectedTable && selectedTable !== "counter" ? selectedTable : null,
      discount
    );

    if (!error && order) {
      setCurrentOrderId(order.id);
      await updateOrderStatus(order.id, "in_kitchen");
      toast({
        title: "Commande envoyée en cuisine 🍳",
        description: `Commande #${order.order_number} • ${cart.length} articles`,
      });
      setCart([]);
      setDiscount(0);
      setSelectedTable("");
    }
    setIsProcessing(false);
  };

  const handlePayment = async (method: "cash" | "card" | "mobile_money", providerName?: string) => {
    if (cart.length === 0 && !currentOrderId) return;

    setIsProcessing(true);

    let orderId = currentOrderId;
    let orderNumber = 0;

    // Create order if not already created
    if (!orderId) {
      const { error, order } = await createOrder(
        cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        selectedTable && selectedTable !== "counter" ? selectedTable : null,
        discount
      );

      if (error || !order) {
        setIsProcessing(false);
        return;
      }
      orderId = order.id;
      orderNumber = order.order_number;
    } else {
      // Get order number from existing order
      const existingOrder = orders.find((o) => o.id === orderId);
      orderNumber = existingOrder?.order_number || 0;
    }

    // Process payment
    await processPayment(orderId, total, method);

    // Get table name for receipt
    const selectedTableObj = tables.find((t) => t.id === selectedTable);
    const tableName = selectedTableObj?.name || (selectedTable === "counter" ? "Comptoir" : undefined);

    // Build payment method display name
    const paymentMethodDisplay = method === "mobile_money" && providerName 
      ? providerName 
      : method;

    // Show success modal with receipt option
    setPaymentSuccess({
      orderNumber,
      total,
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      discountPercent: discount,
      discountAmount,
      paymentMethod: paymentMethodDisplay,
      tableName,
    });

    setCart([]);
    setDiscount(0);
    setSelectedTable("");
    setShowPayment(false);
    setShowMobileMoneyOptions(false);
    setCurrentOrderId(null);
    setIsProcessing(false);
  };

  const freeTables = tables.filter((t) => t.status === "free");

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
      <div className="h-[calc(100vh-0px)] flex">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Today Stats */}
          <div className="p-4 md:px-6 md:pt-6 md:pb-0">
            <TodayStatsBar />
          </div>

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
              <button
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                🍽️ Tout
              </button>
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
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🍽️</p>
                <p className="text-muted-foreground">Aucun produit disponible</p>
                <p className="text-sm text-muted-foreground">Ajoutez des plats dans le menu</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filteredProducts.map((item) => {
                  const display = getItemDisplay(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleProductClick(item)}
                      className="pos-button flex flex-col items-center justify-center gap-1.5 bg-card border-2 border-border hover:border-primary/50 hover:shadow-medium p-3 md:p-4"
                    >
                      {display.type === "image" ? (
                        <img src={display.value} alt={item.name} className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover" />
                      ) : (
                        <span className="text-2xl md:text-3xl">{display.value}</span>
                      )}
                      <span className="font-semibold text-sm md:text-base text-center line-clamp-2 leading-tight">
                        {item.name}
                      </span>
                      <span className="text-primary font-bold text-sm md:text-base">
                        {Number(item.price).toLocaleString()} CFA
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-full md:w-96 bg-card border-l border-border flex flex-col">
          {/* Ready Orders for Payment */}
          {readyOrders.length > 0 && (
            <div className="p-4 border-b border-border bg-accent/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-accent-success" size={18} />
                <h3 className="font-semibold text-sm">Commandes prêtes ({readyOrders.length})</h3>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {readyOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => {
                      setCurrentOrderId(order.id);
                      // Load order items into cart for payment
                      const cartItems: CartItem[] = (order.items || []).map((item) => ({
                        menu_item_id: item.menu_item_id || undefined,
                        name: item.name,
                        price: Number(item.price),
                        quantity: item.quantity,
                        emoji: "🍽️",
                      }));
                      setCart(cartItems);
                      setDiscount(Number(order.discount_percent) || 0);
                      setShowPayment(true);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-card hover:bg-primary/10 border border-border hover:border-primary transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">#{order.order_number}</span>
                      <span className="text-sm text-muted-foreground">
                        {order.table?.name || "Comptoir"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{Number(order.total).toLocaleString()} CFA</span>
                      <CreditCard size={16} className="text-primary" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cart Header */}
          <div className="p-4 md:p-6 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">Commande en cours</h2>
            </div>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une table (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="counter">Comptoir</SelectItem>
                {freeTables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                {cart.map((item, index) => (
                  <div
                    key={`${item.menu_item_id}-${item.variant || 'base'}-${index}`}
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
                        onClick={() => updateQuantity(item.menu_item_id!, item.variant, -1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.menu_item_id!, item.variant, 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={() => removeItem(item.menu_item_id!, item.variant)}
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
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 size={18} className="mr-2 animate-spin" />
                  ) : (
                    <Send size={18} className="mr-2" />
                  )}
                  Cuisine
                </Button>
                <Button
                  variant="pos-success"
                  className="h-14"
                  onClick={() => setShowPayment(true)}
                  disabled={isProcessing}
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
                {showMobileMoneyOptions ? (
                  <>
                    <button
                      onClick={() => setShowMobileMoneyOptions(false)}
                      className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h2 className="font-display font-bold text-xl">Choisir Mobile Money</h2>
                  </>
                ) : (
                  <h2 className="font-display font-bold text-xl">Mode de paiement</h2>
                )}
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setShowMobileMoneyOptions(false);
                  }}
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

                {showMobileMoneyOptions ? (
                  // Mobile Money Provider Selection
                  <div className="space-y-3">
                    {enabledProviders.length === 0 ? (
                      <div className="text-center py-6">
                        <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">Aucun fournisseur Mobile Money configuré</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configurez-les dans Paramètres → Paiements
                        </p>
                      </div>
                    ) : (
                      enabledProviders.map((provider) => (
                        <Button
                          key={provider.id}
                          variant="pos"
                          className="w-full justify-start"
                          onClick={() => handlePayment("mobile_money", provider.name)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 size={24} className="mr-3 animate-spin" />
                          ) : (
                            <Smartphone size={24} className="mr-3" />
                          )}
                          {provider.name}
                        </Button>
                      ))
                    )}
                  </div>
                ) : (
                  // Main Payment Methods
                  <>
                    <Button
                      variant="pos"
                      className="w-full"
                      onClick={() => handlePayment("cash")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 size={24} className="mr-3 animate-spin" />
                      ) : (
                        <Banknote size={24} className="mr-3" />
                      )}
                      Espèces
                    </Button>
                    <Button
                      variant="pos"
                      className="w-full"
                      onClick={() => handlePayment("card")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 size={24} className="mr-3 animate-spin" />
                      ) : (
                        <CreditCard size={24} className="mr-3" />
                      )}
                      Carte bancaire
                    </Button>
                    <Button
                      variant="pos"
                      className="w-full"
                      onClick={() => {
                        if (enabledProviders.length === 1) {
                          // If only one provider, pay directly
                          handlePayment("mobile_money", enabledProviders[0].name);
                        } else {
                          // Show provider selection
                          setShowMobileMoneyOptions(true);
                        }
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 size={24} className="mr-3 animate-spin" />
                      ) : (
                        <Smartphone size={24} className="mr-3" />
                      )}
                      Mobile Money
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Success Modal with Receipt */}
        {paymentSuccess && (
          <PaymentSuccessModal
            open={!!paymentSuccess}
            onClose={() => setPaymentSuccess(null)}
            orderNumber={paymentSuccess.orderNumber}
            total={paymentSuccess.total}
            items={paymentSuccess.items}
            subtotal={paymentSuccess.subtotal}
            discountPercent={paymentSuccess.discountPercent}
            discountAmount={paymentSuccess.discountAmount}
            paymentMethod={paymentSuccess.paymentMethod}
            tableName={paymentSuccess.tableName}
            restaurantName={restaurant?.name || "Restaurant"}
            restaurantAddress={restaurant?.address || undefined}
            restaurantPhone={restaurant?.phone || undefined}
          />
        )}

        {/* Variant Selection Modal */}
        <VariantSelectionModal
          open={!!variantModalItem}
          onClose={() => setVariantModalItem(null)}
          item={variantModalItem}
          onSelectVariant={handleSelectVariant}
          onSelectBase={handleSelectBase}
          itemDisplay={variantModalItem ? getItemDisplay(variantModalItem) : null}
        />
      </div>
    </DashboardLayout>
  );
}
