import { useState, useEffect, useCallback } from "react";
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

  const fetchData = useCallback(async () => {
    if (!user) {
      setRestaurant(null);
      setRestaurants([]);
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

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
    } else if (userRestaurants) {
      const formattedRestaurants = userRestaurants.map((ur: any) => ({
        ...ur,
        restaurant: ur.restaurant as Restaurant,
      }));
      setRestaurants(formattedRestaurants);

      // Set active restaurant
      const activeRestaurant = formattedRestaurants.find((r) => r.is_active);
      if (activeRestaurant) {
        setRestaurant(activeRestaurant.restaurant);
      } else if (formattedRestaurants.length > 0) {
        // If no active, set first one as active
        setRestaurant(formattedRestaurants[0].restaurant);
        await switchRestaurant(formattedRestaurants[0].restaurant_id);
      }
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getRestaurantLimit = (): number => {
    if (!restaurant?.subscription_plan) return 1;
    return SUBSCRIPTION_LIMITS[restaurant.subscription_plan] || 1;
  };

  const canCreateNewRestaurant = (): boolean => {
    const ownedRestaurants = restaurants.filter((r) => r.is_owner);
    const limit = getRestaurantLimit();
    return ownedRestaurants.length < limit;
  };

  const createRestaurant = async (restaurantData: {
    name: string;
    cuisine_type?: string;
    team_size?: number;
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
      })
      .select()
      .single();

    if (restaurantError) {
      return { error: restaurantError };
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
      return { error: assocError };
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

    // Deactivate all restaurants
    await supabase
      .from("user_restaurants")
      .update({ is_active: false })
      .eq("user_id", user.id);

    // Activate selected restaurant
    const { error } = await supabase
      .from("user_restaurants")
      .update({ is_active: true })
      .eq("user_id", user.id)
      .eq("restaurant_id", restaurantId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de changer de restaurant",
        variant: "destructive",
      });
      return { error };
    }

    // Update profile restaurant_id for backward compatibility
    await supabase
      .from("profiles")
      .update({ restaurant_id: restaurantId })
      .eq("id", user.id);

    // Refresh data
    await fetchData();

    toast({
      title: "Restaurant changé",
      description: "Vous travaillez maintenant sur un autre restaurant",
    });

    return { error: null };
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
