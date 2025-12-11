import { useTodayStats } from "@/hooks/useTodayStats";
import { Receipt, ChefHat, CheckCircle, Banknote } from "lucide-react";

export function TodayStatsBar() {
  const { stats, loading } = useTodayStats();

  if (loading) {
    return (
      <div className="flex gap-4 p-3 bg-muted/50 rounded-xl animate-pulse">
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="h-8 w-24 bg-muted rounded" />
        <div className="h-8 w-24 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 md:gap-6 p-3 bg-muted/30 rounded-xl border border-border">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Receipt className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Commandes</p>
          <p className="font-bold text-lg leading-none">{stats.ordersCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-orange-500" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">En cuisine</p>
          <p className="font-bold text-lg leading-none">{stats.inKitchenCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Prêtes</p>
          <p className="font-bold text-lg leading-none">{stats.readyCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Banknote className="w-4 h-4 text-emerald-500" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Recette du jour</p>
          <p className="font-bold text-lg leading-none text-emerald-600">
            {stats.totalRevenue.toLocaleString()} <span className="text-xs font-normal">CFA</span>
          </p>
        </div>
      </div>
    </div>
  );
}
