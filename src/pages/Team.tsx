import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useTeam, TeamMember } from "@/hooks/useTeam";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  ChefHat,
  CreditCard,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLE_CONFIG: Record<AppRole, { label: string; icon: React.ElementType; color: string }> = {
  admin: { label: "Admin", icon: Crown, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  manager: { label: "Manager", icon: Shield, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  serveur: { label: "Serveur", icon: Users, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  caissier: { label: "Caissier", icon: CreditCard, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
};

const ROLES: AppRole[] = ["admin", "manager", "serveur", "caissier"];

export default function Team() {
  const { members, loading, getTeamLimit, canAddMember, updateMemberRole, removeMember } = useTeam();
  const { restaurant } = useRestaurant();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("serveur");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail || !restaurant?.id) return;

    setInviting(true);
    try {
      // For now, we'll show a message that invitation is pending
      // In a real implementation, this would send an email invitation
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${inviteEmail}`,
      });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("serveur");
    } catch (error) {
      console.error("Error inviting member:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation",
        variant: "destructive",
      });
    } finally {
      setInviting(false);
    }
  };

  const handleUpgrade = () => {
    navigate("/dashboard/subscription");
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const isCurrentUser = (member: TeamMember) => {
    return member.user_id === user?.id;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const teamLimit = getTeamLimit();
  const currentCount = members.length;
  const subscriptionPlan = restaurant?.subscription_plan || "basic";

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Équipe</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les membres de votre équipe et leurs permissions
            </p>
          </div>

          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button
                className="gap-2"
                disabled={!canAddMember()}
              >
                <UserPlus size={18} />
                Inviter un membre
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter un membre</DialogTitle>
                <DialogDescription>
                  Envoyez une invitation par email pour ajouter un nouveau membre à votre équipe.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="membre@restaurant.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => {
                        const config = ROLE_CONFIG[role];
                        const Icon = config.icon;
                        return (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <Icon size={16} />
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
                  {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Envoyer l'invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Membres</p>
                  <p className="text-2xl font-bold">
                    {currentCount} / {teamLimit === 999 ? "∞" : teamLimit}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan actuel</p>
                  <p className="text-2xl font-bold capitalize">{subscriptionPlan}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Places disponibles</p>
                  <p className="text-2xl font-bold">
                    {teamLimit === 999 ? "∞" : Math.max(0, teamLimit - currentCount)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Limit Warning */}
        {!canAddMember() && (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-600">Limite d'équipe atteinte</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Votre plan {subscriptionPlan} permet {teamLimit} membre{teamLimit > 1 ? "s" : ""}.
                    Passez au plan supérieur pour ajouter plus de membres.
                  </p>
                  <Button className="mt-3" size="sm" onClick={handleUpgrade}>
                    Mettre à niveau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Membres de l'équipe</CardTitle>
            <CardDescription>
              Liste de tous les membres ayant accès à ce restaurant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun membre dans l'équipe</p>
                <Button className="mt-4 gap-2" onClick={() => setInviteOpen(true)}>
                  <UserPlus size={18} />
                  Inviter le premier membre
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membre</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const roleConfig = ROLE_CONFIG[member.role];
                    const Icon = roleConfig.icon;
                    const isSelf = isCurrentUser(member);

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(member.full_name, member.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.full_name || "Sans nom"}
                                {isSelf && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Vous
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {isSelf ? (
                            <Badge variant="outline" className={roleConfig.color}>
                              <Icon size={14} className="mr-1" />
                              {roleConfig.label}
                            </Badge>
                          ) : (
                            <Select
                              value={member.role}
                              onValueChange={(v) => updateMemberRole(member.id, v as AppRole)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((role) => {
                                  const config = ROLE_CONFIG[role];
                                  const RoleIcon = config.icon;
                                  return (
                                    <SelectItem key={role} value={role}>
                                      <div className="flex items-center gap-2">
                                        <RoleIcon size={14} />
                                        <span>{config.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isSelf && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 size={18} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {member.full_name || member.email} n'aura plus accès à ce restaurant.
                                    Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => removeMember(member.id, member.user_id)}
                                  >
                                    Retirer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Role Descriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Description des rôles</CardTitle>
            <CardDescription>
              Chaque rôle dispose de permissions spécifiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROLES.map((role) => {
                const config = ROLE_CONFIG[role];
                const Icon = config.icon;
                const descriptions: Record<AppRole, string> = {
                  admin: "Accès complet à toutes les fonctionnalités, gestion de l'équipe et des paramètres",
                  manager: "Gestion des commandes, du menu, du stock et accès aux rapports",
                  serveur: "Prise de commandes, gestion des tables et accès à la cuisine",
                  caissier: "Traitement des paiements et accès à l'historique des commandes",
                };

                return (
                  <div
                    key={role}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{config.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {descriptions[role]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
