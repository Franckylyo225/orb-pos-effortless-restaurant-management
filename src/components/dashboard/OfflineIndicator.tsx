import { Wifi, WifiOff, RefreshCw, CloudOff, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface OfflineIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActionsCount: number;
  lastSyncTime: Date | null;
  onSync: () => void;
}

export function OfflineIndicator({
  isOnline,
  isSyncing,
  pendingActionsCount,
  lastSyncTime,
  onSync,
}: OfflineIndicatorProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={!isOnline || isSyncing}
            className={cn(
              "gap-2 transition-all",
              !isOnline && "text-destructive hover:text-destructive",
              isSyncing && "animate-pulse"
            )}
          >
            {isSyncing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : isOnline ? (
              pendingActionsCount > 0 ? (
                <CloudOff className="h-4 w-4 text-warning" />
              ) : (
                <Check className="h-4 w-4 text-success" />
              )
            ) : (
              <WifiOff className="h-4 w-4" />
            )}
            <span className="hidden md:inline text-xs">
              {isSyncing
                ? "Sync..."
                : isOnline
                ? pendingActionsCount > 0
                  ? `${pendingActionsCount} en attente`
                  : "Synchronisé"
                : "Hors-ligne"}
            </span>
            {pendingActionsCount > 0 && !isSyncing && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning text-warning-foreground text-xs font-medium">
                {pendingActionsCount}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              <span className="font-medium">
                {isOnline ? "En ligne" : "Hors-ligne"}
              </span>
            </div>
            {pendingActionsCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {pendingActionsCount} action(s) en attente de synchronisation
              </p>
            )}
            {lastSyncTime && (
              <p className="text-xs text-muted-foreground">
                Dernière sync:{" "}
                {formatDistanceToNow(lastSyncTime, {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>
            )}
            {!isOnline && (
              <p className="text-xs text-muted-foreground">
                Les données sont sauvegardées localement et seront synchronisées
                automatiquement.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
