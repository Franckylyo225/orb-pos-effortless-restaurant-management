import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface SuperAdmin {
  id: string;
  user_id: string;
  created_at: string;
  email?: string;
  full_name?: string;
}

const AdminAdmins = () => {
  const { user } = useAdminAuth();
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  const fetchSuperAdmins = async () => {
    const { data: adminsData, error: adminsError } = await supabase
      .from('super_admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (!adminsError && adminsData) {
      const adminsWithProfiles = await Promise.all(
        adminsData.map(async (admin) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name')
            .eq('id', admin.user_id)
            .maybeSingle();
          
          return {
            ...admin,
            email: profile?.email || 'Email non disponible',
            full_name: profile?.full_name || 'Nom non disponible',
          };
        })
      );
      setSuperAdmins(adminsWithProfiles);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSuperAdmins();
  }, []);

  const handleAddSuperAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Veuillez entrer un email');
      return;
    }

    setIsAddingAdmin(true);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', newAdminEmail.trim())
      .maybeSingle();

    if (profileError || !profile) {
      toast.error('Utilisateur non trouvé avec cet email');
      setIsAddingAdmin(false);
      return;
    }

    const { data: existingAdmin } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existingAdmin) {
      toast.error('Cet utilisateur est déjà super admin');
      setIsAddingAdmin(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('super_admins')
      .insert({ user_id: profile.id });

    if (insertError) {
      toast.error('Erreur lors de l\'ajout du super admin');
      setIsAddingAdmin(false);
      return;
    }

    toast.success(`${profile.full_name || profile.email} ajouté comme super admin`);
    setNewAdminEmail('');
    setDialogOpen(false);
    setIsAddingAdmin(false);
    fetchSuperAdmins();
  };

  const handleRemoveSuperAdmin = async (adminId: string, adminEmail: string) => {
    if (superAdmins.length <= 1) {
      toast.error('Impossible de supprimer le dernier super admin');
      return;
    }

    const { error } = await supabase
      .from('super_admins')
      .delete()
      .eq('id', adminId);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return;
    }

    toast.success(`${adminEmail} supprimé des super admins`);
    fetchSuperAdmins();
  };

  if (isLoading) {
    return (
      <AdminLayout title="Super Admins" description="Gestion des administrateurs">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Super Admins" description="Gestion des administrateurs de la plateforme">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Super Administrateurs ({superAdmins.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Utilisateurs ayant accès au dashboard admin
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Ajouter un admin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Ajouter un super admin</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Entrez l'email d'un utilisateur existant pour lui donner accès au dashboard admin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Email de l'utilisateur</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="utilisateur@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-slate-300">
                  Annuler
                </Button>
                <Button onClick={handleAddSuperAdmin} disabled={isAddingAdmin}>
                  {isAddingAdmin ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-700/50">
                  <TableHead className="text-slate-300">Nom</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Ajouté le</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {superAdmins.map((admin) => (
                  <TableRow key={admin.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        {admin.full_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{admin.email}</TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {format(new Date(admin.created_at), 'dd MMM yyyy', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSuperAdmin(admin.id, admin.email || '')}
                        disabled={superAdmins.length <= 1 || admin.user_id === user?.id}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminAdmins;
