import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
  logo_url: string | null;
  cuisine_type: string | null;
  team_size: number | null;
  subscription_plan: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  restaurant_id: string | null;
}

interface UserRestaurant {
  id: string;
  user_id: string;
  restaurant_id: string;
  is_owner: boolean;
  is_active: boolean;
  restaurant: Restaurant;
}

const SUBSCRIPTION_LIMITS: Record<string, number> = {
  basic: 1,
  pro: 3,
  premium: 999,
};

export function useRestaurant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [restaurants, setRestaurants] = useState<UserRestaurant[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoad = useRef(true);

  const activateRestaurant = async (userId: string, restaurantId: string) => {
    // Deactivate all restaurants
    await supabase
      .from("user_restaurants")
      .update({ is_active: false })
      .eq("user_id", userId);

    // Activate selected restaurant
    await supabase
      .from("user_restaurants")
      .update({ is_active: true })
      .eq("user_id", userId)
      .eq("restaurant_id", restaurantId);

    // Update profile restaurant_id for backward compatibility
    await supabase
      .from("profiles")
      .update({ restaurant_id: restaurantId })
      .eq("id", userId);
  };

  const fetchData = useCallback(async () => {
    if (!user) {
      setRestaurant(null);
      setRestaurants([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user's restaurants
      const { data: userRestaurants, error: restaurantsError } = await supabase
        .from("user_restaurants")
        .select(`
          id,
          user_id,
          restaurant_id,
          is_owner,
          is_active,
          restaurant:restaurants(*)
        `)
        .eq("user_id", user.id);

      if (restaurantsError) {
        console.error("Error fetching user restaurants:", restaurantsError);
        setLoading(false);
        return;
      }

      if (userRestaurants && userRestaurants.length > 0) {
        const formattedRestaurants = userRestaurants.map((ur: any) => ({
          ...ur,
          restaurant: ur.restaurant as Restaurant,
        }));
        setRestaurants(formattedRestaurants);

        // Set active restaurant
        const activeRestaurant = formattedRestaurants.find((r) => r.is_active);
        if (activeRestaurant) {
          setRestaurant(activeRestaurant.restaurant);
        } else {
          // If no active, set first one as active
          setRestaurant(formattedRestaurants[0].restaurant);
          if (isInitialLoad.current) {
            await activateRestaurant(user.id, formattedRestaurants[0].restaurant_id);
          }
        }
      } else {
        setRestaurants([]);
        setRestaurant(null);
      }
    } catch (error) {
      console.error("Error in fetchData:", error);
    }

    isInitialLoad.current = false;
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getRestaurantLimit = useCallback((): number => {
    if (!restaurant?.subscription_plan) return 1;
    return SUBSCRIPTION_LIMITS[restaurant.subscription_plan] || 1;
  }, [restaurant?.subscription_plan]);

  const canCreateNewRestaurant = useCallback((): boolean => {
    const ownedRestaurants = restaurants.filter((r) => r.is_owner);
    const limit = getRestaurantLimit();
    return ownedRestaurants.length < limit;
  }, [restaurants, getRestaurantLimit]);

  const createRestaurant = async (restaurantData: {
    name: string;
    cuisine_type?: string;
    team_size?: number;
    address?: string;
    logo_url?: string;
  }) => {
    if (!user) return { error: new Error("User not authenticated") };

    // Check if user can create more restaurants
    const ownedCount = restaurants.filter((r) => r.is_owner).length;
    const limit = getRestaurantLimit();

    if (ownedCount >= limit && ownedCount > 0) {
      return {
        error: new Error("UPGRADE_REQUIRED"),
        upgradeRequired: true,
      };
    }

    // Create restaurant
    const { data: newRestaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .insert({
        name: restaurantData.name,
        cuisine_type: restaurantData.cuisine_type,
        team_size: restaurantData.team_size,
        address: restaurantData.address,
        logo_url: restaurantData.logo_url,
      })
      .select()
      .single();

    if (restaurantError) {
      console.error("Restaurant creation error:", restaurantError);
      let errorMessage = "Impossible de créer le restaurant";
      
      if (restaurantError.code === "42501" || restaurantError.message?.includes("row-level security")) {
        errorMessage = "Erreur de permission: vous n'êtes pas autorisé à créer un restaurant. Veuillez vous reconnecter.";
      } else if (restaurantError.code === "23505") {
        errorMessage = "Un restaurant avec ce nom existe déjà.";
      } else if (restaurantError.message) {
        errorMessage = `Erreur: ${restaurantError.message}`;
      }
      
      return { error: new Error(errorMessage), details: restaurantError };
    }

    // Deactivate all other restaurants for this user
    await supabase
      .from("user_restaurants")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // Create user_restaurant association
    const { error: assocError } = await supabase
      .from("user_restaurants")
      .insert({
        user_id: user.id,
        restaurant_id: newRestaurant.id,
        is_owner: true,
        is_active: true,
      });

    if (assocError) {
      console.error("Error creating restaurant association:", assocError);
      return { 
        error: new Error(`Erreur lors de l'association au restaurant: ${assocError.message}`),
        details: assocError 
      };
    }

    // Update profile with restaurant_id (for backward compatibility)
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ restaurant_id: newRestaurant.id })
      .eq("id", user.id);

    if (profileError) {
      console.error("Error updating profile:", profileError);
    }

    // Add admin role for this user
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: user.id,
      role: "admin" as const,
      restaurant_id: newRestaurant.id,
    });

    if (roleError) {
      console.error("Error adding admin role:", roleError);
    }

    // Refresh data
    await fetchData();

    return { error: null, restaurant: newRestaurant };
  };

  const switchRestaurant = async (restaurantId: string) => {
    if (!user) return { error: new Error("User not authenticated") };

    try {
      await activateRestaurant(user.id, restaurantId);

      // Refresh data
      await fetchData();

      toast({
        title: "Restaurant changé",
        description: "Vous travaillez maintenant sur un autre restaurant",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de changer de restaurant",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    restaurant,
    restaurants,
    profile,
    loading,
    createRestaurant,
    switchRestaurant,
    canCreateNewRestaurant,
    getRestaurantLimit,
    refetch: fetchData,
  };
}
