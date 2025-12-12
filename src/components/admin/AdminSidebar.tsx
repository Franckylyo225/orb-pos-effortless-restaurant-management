import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, LogOut, BarChart3, Store, CreditCard, Users, 
  Tag, Settings, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { title: 'Analytics', href: '/admin', icon: BarChart3 },
  { title: 'Restaurants', href: '/admin/restaurants', icon: Store },
  { title: 'Abonnements', href: '/admin/subscriptions', icon: CreditCard },
  { title: 'Marketing', href: '/admin/marketing', icon: Tag },
  { title: 'Super Admins', href: '/admin/admins', icon: Users },
  { title: 'Paramètres', href: '/admin/settings', icon: Settings },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-slate-900 border-r border-slate-700 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-white">Admin SaaS</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Button
                key={item.href}
                variant="ghost"
                onClick={() => navigate(item.href)}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  collapsed && "justify-center px-2",
                  isActive 
                    ? "bg-primary text-white hover:bg-primary/90" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-900/20",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
