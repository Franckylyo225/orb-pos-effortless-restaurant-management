import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  UtensilsCrossed, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Leaf,
  Flame,
  Star
} from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  cuisine_type: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  sort_order: number | null;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean | null;
  variants: any;
}

export default function PublicMenu() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMenu() {
      if (!restaurantId) {
        setError("Restaurant non trouvé");
        setLoading(false);
        return;
      }

      try {
        // Fetch restaurant info (public access needed)
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("id, name, address, phone, email, logo_url, cuisine_type")
          .eq("id", restaurantId)
          .single();

        if (restaurantError) throw restaurantError;
        if (!restaurantData) {
          setError("Restaurant non trouvé");
          setLoading(false);
          return;
        }

        setRestaurant(restaurantData);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name, description, sort_order")
          .eq("restaurant_id", restaurantId)
          .eq("is_active", true)
          .order("sort_order", { ascending: true });

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        if (categoriesData && categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }

        // Fetch menu items
        const { data: menuData, error: menuError } = await supabase
          .from("menu_items")
          .select("id, name, description, price, image_url, category_id, is_available, variants")
          .eq("restaurant_id", restaurantId)
          .eq("is_available", true)
          .order("name");

        if (menuError) throw menuError;
        setMenuItems(menuData || []);
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError("Impossible de charger le menu");
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, [restaurantId]);

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter((item) => item.category_id === categoryId);
  };

  const uncategorizedItems = menuItems.filter((item) => !item.category_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
            ))}
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Menu non disponible</h1>
          <p className="text-muted-foreground">{error || "Ce restaurant n'existe pas ou le menu n'est pas disponible."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {restaurant.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt={restaurant.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="h-7 w-7 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-xl truncate">{restaurant.name}</h1>
              {restaurant.cuisine_type && (
                <Badge variant="secondary" className="mt-1">
                  {restaurant.cuisine_type}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Info */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {restaurant.address && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>{restaurant.address}</span>
              </div>
            )}
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone size={16} />
                <span>{restaurant.phone}</span>
              </a>
            )}
            {restaurant.email && (
              <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail size={16} />
                <span>{restaurant.email}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Categories Navigation */}
      {categories.length > 0 && (
        <div className="bg-card/50 backdrop-blur-sm sticky top-[73px] z-40 border-b border-border">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-3 no-scrollbar">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {uncategorizedItems.length > 0 && (
                <button
                  onClick={() => setActiveCategory("uncategorized")}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === "uncategorized"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }`}
                >
                  Autres
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {menuItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Menu en préparation</h2>
            <p className="text-muted-foreground">Le menu sera bientôt disponible.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const items = getItemsByCategory(category.id);
              if (items.length === 0) return null;
              
              const isActive = activeCategory === category.id;

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className={isActive ? "block" : "hidden"}
                >
                  <div className="mb-4">
                    <h2 className="font-display font-bold text-xl">{category.name}</h2>
                    {category.description && (
                      <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="grid gap-4">
                    {items.map((item) => (
                      <MenuItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}

            {uncategorizedItems.length > 0 && activeCategory === "uncategorized" && (
              <section>
                <div className="mb-4">
                  <h2 className="font-display font-bold text-xl">Autres</h2>
                </div>
                <div className="grid gap-4">
                  {uncategorizedItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Propulsé par <span className="font-semibold text-primary">ORBI POS</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              {item.description && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {hasVariants ? (
                item.variants.map((variant: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {variant.name}: {Number(variant.price).toLocaleString()} FCFA
                  </Badge>
                ))
              ) : (
                <span className="text-lg font-bold text-primary">
                  {Number(item.price).toLocaleString()} FCFA
                </span>
              )}
            </div>
          </div>
        </div>

        {item.image_url && (
          <div className="w-28 h-28 md:w-36 md:h-36 flex-shrink-0">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
}
