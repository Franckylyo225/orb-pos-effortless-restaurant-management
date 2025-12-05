import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

export function useRestaurant() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRestaurant(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
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

      // Fetch restaurant if profile has restaurant_id
      if (profileData?.restaurant_id) {
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", profileData.restaurant_id)
          .maybeSingle();

        if (restaurantError) {
          console.error("Error fetching restaurant:", restaurantError);
        } else {
          setRestaurant(restaurantData);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const createRestaurant = async (restaurantData: {
    name: string;
    cuisine_type?: string;
    team_size?: number;
  }) => {
    if (!user) return { error: new Error("User not authenticated") };

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

    // Update profile with restaurant_id
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ restaurant_id: newRestaurant.id })
      .eq("id", user.id);

    if (profileError) {
      return { error: profileError };
    }

    // Add admin role for this user
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: user.id,
        role: "admin" as const,
        restaurant_id: newRestaurant.id,
      });

    if (roleError) {
      console.error("Error adding admin role:", roleError);
    }

    setRestaurant(newRestaurant);
    return { error: null, restaurant: newRestaurant };
  };

  return { restaurant, profile, loading, createRestaurant };
}
