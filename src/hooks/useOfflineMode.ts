import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface PendingAction {
  id: string;
  action: string;
  table: string;
  data: any;
  timestamp: number;
}

const STORAGE_KEY = "resto_offline_data";
const PENDING_ACTIONS_KEY = "resto_pending_actions";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const syncCallbacksRef = useRef<Map<string, () => Promise<void>>>(new Map());

  // Détecter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connexion rétablie",
        description: "Synchronisation en cours...",
      });
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Mode hors-ligne activé",
        description: "Vos données sont sauvegardées localement",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Charger le nombre d'actions en attente
    updatePendingCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Mettre à jour le compteur d'actions en attente
  const updatePendingCount = useCallback(() => {
    const pending = getPendingActions();
    setPendingActionsCount(pending.length);
  }, []);

  // Sauvegarder des données localement
  const saveToLocal = useCallback((key: string, data: any) => {
    try {
      const storage = getLocalStorage();
      storage[key] = {
        key,
        data,
        timestamp: Date.now(),
        synced: isOnline,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
      return true;
    } catch (error) {
      console.error("Erreur sauvegarde locale:", error);
      return false;
    }
  }, [isOnline]);

  // Récupérer des données locales
  const getFromLocal = useCallback(<T>(key: string): T | null => {
    try {
      const storage = getLocalStorage();
      const item = storage[key] as OfflineData | undefined;
      
      if (!item) return null;
      
      // Vérifier si le cache est expiré
      if (Date.now() - item.timestamp > CACHE_DURATION) {
        delete storage[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
        return null;
      }
      
      return item.data as T;
    } catch (error) {
      console.error("Erreur lecture locale:", error);
      return null;
    }
  }, []);

  // Ajouter une action en attente de synchronisation
  const addPendingAction = useCallback((action: string, table: string, data: any) => {
    try {
      const pending = getPendingActions();
      pending.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        table,
        data,
        timestamp: Date.now(),
      });
      localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pending));
      updatePendingCount();
      return true;
    } catch (error) {
      console.error("Erreur ajout action:", error);
      return false;
    }
  }, [updatePendingCount]);

  // Récupérer les actions en attente
  const getPendingActions = (): PendingAction[] => {
    try {
      const data = localStorage.getItem(PENDING_ACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  // Récupérer le stockage local
  const getLocalStorage = (): Record<string, OfflineData> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  // Enregistrer un callback de synchronisation
  const registerSyncCallback = useCallback((key: string, callback: () => Promise<void>) => {
    syncCallbacksRef.current.set(key, callback);
  }, []);

  // Synchroniser les actions en attente
  const syncPendingActions = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      // Exécuter tous les callbacks de synchronisation
      const callbacks = Array.from(syncCallbacksRef.current.values());
      await Promise.all(callbacks.map(cb => cb().catch(console.error)));
      
      // Vider les actions en attente après synchronisation réussie
      localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify([]));
      updatePendingCount();
      setLastSyncTime(new Date());
      
      toast({
        title: "Synchronisation réussie",
        description: "Toutes vos données sont à jour",
      });
    } catch (error) {
      console.error("Erreur synchronisation:", error);
      toast({
        title: "Erreur de synchronisation",
        description: "Certaines données n'ont pas pu être synchronisées",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, toast, updatePendingCount]);

  // Nettoyer le cache expiré
  const clearExpiredCache = useCallback(() => {
    try {
      const storage = getLocalStorage();
      const now = Date.now();
      let hasChanges = false;
      
      Object.keys(storage).forEach(key => {
        if (now - storage[key].timestamp > CACHE_DURATION) {
          delete storage[key];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
      }
    } catch (error) {
      console.error("Erreur nettoyage cache:", error);
    }
  }, []);

  // Nettoyer périodiquement
  useEffect(() => {
    clearExpiredCache();
    const interval = setInterval(clearExpiredCache, 60 * 60 * 1000); // Toutes les heures
    return () => clearInterval(interval);
  }, [clearExpiredCache]);

  return {
    isOnline,
    isSyncing,
    pendingActionsCount,
    lastSyncTime,
    saveToLocal,
    getFromLocal,
    addPendingAction,
    registerSyncCallback,
    syncPendingActions,
  };
}
