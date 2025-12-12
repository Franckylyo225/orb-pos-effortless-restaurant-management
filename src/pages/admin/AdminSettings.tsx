import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Shield, Globe } from 'lucide-react';

const AdminSettings = () => {
  return (
    <AdminLayout title="Paramètres" description="Configuration de la plateforme">
      <div className="grid gap-6 max-w-3xl">
        {/* General Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Paramètres généraux
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configuration globale de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Nom de la plateforme</Label>
              <Input
                defaultValue="RestauPOS"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email de support</Label>
              <Input
                type="email"
                defaultValue="support@restaupos.com"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Notifications
            </CardTitle>
            <CardDescription className="text-slate-400">
              Gérez les notifications administrateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Nouvelles inscriptions</Label>
                <p className="text-sm text-slate-400">Recevoir un email pour chaque nouvelle inscription</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Alertes de paiement</Label>
                <p className="text-sm text-slate-400">Notification en cas d'échec de paiement</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Rapport hebdomadaire</Label>
                <p className="text-sm text-slate-400">Recevoir un résumé chaque semaine</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Configuration email
            </CardTitle>
            <CardDescription className="text-slate-400">
              Paramètres d'envoi d'emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-300">Email d'expédition</Label>
              <Input
                type="email"
                defaultValue="noreply@restaupos.com"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Nom d'expéditeur</Label>
              <Input
                defaultValue="RestauPOS"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Sécurité
            </CardTitle>
            <CardDescription className="text-slate-400">
              Options de sécurité de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Authentification à deux facteurs</Label>
                <p className="text-sm text-slate-400">Exiger 2FA pour les super admins</p>
              </div>
              <Switch />
            </div>
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Journalisation des actions</Label>
                <p className="text-sm text-slate-400">Enregistrer toutes les actions admin</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
