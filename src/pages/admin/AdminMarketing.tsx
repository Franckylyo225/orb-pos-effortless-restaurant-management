import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Tag, Trash2, Copy, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  applicable_plans: string[];
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminMarketing = () => {
  const { user } = useAdminAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [newCode, setNewCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const fetchPromoCodes = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPromoCodes(data as PromoCode[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(code);
  };

  const handleCreatePromoCode = async () => {
    if (!newCode.trim() || !discountValue) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsCreating(true);

    const { error } = await supabase
      .from('promo_codes')
      .insert({
        code: newCode.toUpperCase().trim(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue),
        max_uses: maxUses ? parseInt(maxUses) : null,
        valid_until: validUntil || null,
        created_by: user?.id,
      });

    if (error) {
      if (error.code === '23505') {
        toast.error('Ce code promo existe déjà');
      } else {
        toast.error('Erreur lors de la création');
      }
      setIsCreating(false);
      return;
    }

    toast.success('Code promo créé avec succès');
    setDialogOpen(false);
    resetForm();
    fetchPromoCodes();
    setIsCreating(false);
  };

  const resetForm = () => {
    setNewCode('');
    setDescription('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMaxUses('');
    setValidUntil('');
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('promo_codes')
      .update({ is_active: !isActive })
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      return;
    }

    fetchPromoCodes();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
      return;
    }

    toast.success('Code promo supprimé');
    fetchPromoCodes();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié!');
  };

  if (isLoading) {
    return (
      <AdminLayout title="Marketing" description="Gestion des promotions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Marketing" description="Gestion des codes promo et promotions">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Codes Promo ({promoCodes.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Créez et gérez les codes de réduction pour les abonnements
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau code
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Créer un code promo</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Définissez les paramètres de votre code promotionnel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Code *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="PROMO2024"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      className="bg-slate-700/50 border-slate-600 text-white uppercase"
                    />
                    <Button variant="outline" onClick={generateCode} className="border-slate-600 text-slate-300">
                      Générer
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Input
                    placeholder="Description du code promo"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Type de réduction *</Label>
                    <Select value={discountType} onValueChange={(v: 'percentage' | 'fixed') => setDiscountType(v)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                        <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Valeur *</Label>
                    <Input
                      type="number"
                      placeholder={discountType === 'percentage' ? '10' : '5000'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Utilisations max</Label>
                    <Input
                      type="number"
                      placeholder="Illimité"
                      value={maxUses}
                      onChange={(e) => setMaxUses(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Expire le</Label>
                    <Input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-slate-600 text-slate-300">
                  Annuler
                </Button>
                <Button onClick={handleCreatePromoCode} disabled={isCreating}>
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Créer
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
                  <TableHead className="text-slate-300">Code</TableHead>
                  <TableHead className="text-slate-300">Réduction</TableHead>
                  <TableHead className="text-slate-300">Utilisations</TableHead>
                  <TableHead className="text-slate-300">Validité</TableHead>
                  <TableHead className="text-slate-300">Statut</TableHead>
                  <TableHead className="text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.map((promo) => (
                  <TableRow key={promo.id} className="border-slate-700 hover:bg-slate-700/50">
                    <TableCell className="font-mono font-medium text-white">
                      <div className="flex items-center gap-2">
                        {promo.code}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-slate-400 hover:text-white"
                          onClick={() => copyCode(promo.code)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      {promo.description && (
                        <div className="text-xs text-slate-500 mt-1">{promo.description}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {promo.discount_type === 'percentage' 
                        ? `${promo.discount_value}%`
                        : `${promo.discount_value.toLocaleString()} FCFA`
                      }
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {promo.current_uses}{promo.max_uses ? `/${promo.max_uses}` : ''}
                    </TableCell>
                    <TableCell className="text-slate-400 text-sm">
                      {promo.valid_until 
                        ? format(new Date(promo.valid_until), 'dd MMM yyyy', { locale: fr })
                        : 'Illimité'
                      }
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={promo.is_active}
                        onCheckedChange={() => handleToggleActive(promo.id, promo.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(promo.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {promoCodes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      Aucun code promo créé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminMarketing;
