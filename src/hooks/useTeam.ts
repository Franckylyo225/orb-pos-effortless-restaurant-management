import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRestaurant } from "./useRestaurant";
import { useToast } from "./use-toast";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

export interface TeamMember {
  id: string;
  user_id: string;
  role: AppRole;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const SUBSCRIPTION_TEAM_LIMITS: Record<string, number> = {
  basic: 3,
  pro: 10,
  premium: 999,
};

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { restaurant } = useRestaurant();
  const { toast } = useToast();

  const getTeamLimit = useCallback(() => {
    const plan = restaurant?.subscription_plan || "basic";
    return SUBSCRIPTION_TEAM_LIMITS[plan] || 3;
  }, [restaurant]);

  const canAddMember = useCallback(() => {
    return members.length < getTeamLimit();
  }, [members.length, getTeamLimit]);

  const fetchTeamMembers = useCallback(async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);

      // Get all user roles for this restaurant
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, restaurant_id")
        .eq("restaurant_id", restaurant.id);

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setMembers([]);
        return;
      }

      // Get profiles for all users
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, created_at")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine roles with profiles
      const teamMembers: TeamMember[] = roles.map((role) => {
        const profile = profiles?.find((p) => p.id === role.user_id);
        return {
          id: role.id,
          user_id: role.user_id,
          role: role.role,
          email: profile?.email || "",
          full_name: profile?.full_name || null,
          avatar_url: profile?.avatar_url || null,
          created_at: profile?.created_at || "",
        };
      });

      setMembers(teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de l'équipe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id, toast]);

  const updateMemberRole = async (memberId: string, newRole: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );

      toast({
        title: "Rôle mis à jour",
        description: "Le rôle du membre a été modifié avec succès",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string, userId: string) => {
    try {
      // Remove from user_roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", memberId);

      if (roleError) throw roleError;

      // Remove from user_restaurants
      const { error: restError } = await supabase
        .from("user_restaurants")
        .delete()
        .eq("user_id", userId)
        .eq("restaurant_id", restaurant?.id);

      if (restError) throw restError;

      setMembers((prev) => prev.filter((m) => m.id !== memberId));

      toast({
        title: "Membre retiré",
        description: "Le membre a été retiré de l'équipe",
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le membre",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return {
    members,
    loading,
    getTeamLimit,
    canAddMember,
    updateMemberRole,
    removeMember,
    refetch: fetchTeamMembers,
  };
}
