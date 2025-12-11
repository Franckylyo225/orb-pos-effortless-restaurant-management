import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "./useRestaurant";
import { useToast } from "@/hooks/use-toast";

export interface MobileMoneyProvider {
  id: string;
  restaurant_id: string;
  name: string;
  code: string;
  is_enabled: boolean;
  sort_order: number;
  created_at: string;
}

// Default providers for African markets
export const DEFAULT_PROVIDERS = [
  { name: "Orange Money", code: "orange_money" },
  { name: "MTN Mobile Money", code: "mtn_momo" },
  { name: "Wave", code: "wave" },
  { name: "Moov Money", code: "moov_money" },
  { name: "Free Money", code: "free_money" },
  { name: "Airtel Money", code: "airtel_money" },
];

export function useMobileMoneyProviders() {
  const { restaurant } = useRestaurant();
  const { toast } = useToast();
  const [providers, setProviders] = useState<MobileMoneyProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    if (!restaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from("mobile_money_providers")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // If no providers exist, initialize with defaults
      if (!data || data.length === 0) {
        await initializeDefaultProviders();
      } else {
        setProviders(data);
      }
    } catch (error) {
      console.error("Error fetching mobile money providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultProviders = async () => {
    if (!restaurant?.id) return;

    try {
      const providersToInsert = DEFAULT_PROVIDERS.map((p, index) => ({
        restaurant_id: restaurant.id,
        name: p.name,
        code: p.code,
        is_enabled: true,
        sort_order: index,
      }));

      const { data, error } = await supabase
        .from("mobile_money_providers")
        .insert(providersToInsert)
        .select();

      if (error) throw error;

      setProviders(data || []);
    } catch (error) {
      console.error("Error initializing providers:", error);
    }
  };

  const toggleProvider = async (id: string, is_enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("mobile_money_providers")
        .update({ is_enabled })
        .eq("id", id);

      if (error) throw error;

      setProviders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_enabled } : p))
      );

      toast({
        title: is_enabled ? "Activé" : "Désactivé",
        description: `Le moyen de paiement a été ${is_enabled ? "activé" : "désactivé"}.`,
      });
    } catch (error) {
      console.error("Error toggling provider:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut.",
        variant: "destructive",
      });
    }
  };

  const addProvider = async (name: string, code: string) => {
    if (!restaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from("mobile_money_providers")
        .insert({
          restaurant_id: restaurant.id,
          name,
          code,
          is_enabled: true,
          sort_order: providers.length,
        })
        .select()
        .single();

      if (error) throw error;

      setProviders((prev) => [...prev, data]);

      toast({
        title: "Ajouté",
        description: `${name} a été ajouté.`,
      });
    } catch (error) {
      console.error("Error adding provider:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le moyen de paiement.",
        variant: "destructive",
      });
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      const { error } = await supabase
        .from("mobile_money_providers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setProviders((prev) => prev.filter((p) => p.id !== id));

      toast({
        title: "Supprimé",
        description: "Le moyen de paiement a été supprimé.",
      });
    } catch (error) {
      console.error("Error deleting provider:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [restaurant?.id]);

  const enabledProviders = providers.filter((p) => p.is_enabled);

  return {
    providers,
    enabledProviders,
    loading,
    toggleProvider,
    addProvider,
    deleteProvider,
    refetch: fetchProviders,
  };
}
