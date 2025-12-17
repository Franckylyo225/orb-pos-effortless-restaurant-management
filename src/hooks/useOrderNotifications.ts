import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "kitchen" | "pos";

const BATCH_DELAY_MS = 3000; // 3 seconds to batch notifications

export function useOrderNotifications(type: NotificationType) {
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);
  const pendingOrdersRef = useRef<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playNotificationSound = useCallback((frequency: number = 800, duration: number = 0.3, repeat: number = 1) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      
      const playBeep = (delay: number, freq: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = "sine";
        
        const startTime = ctx.currentTime + delay;
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Play beeps based on repeat count (more orders = more beeps)
      for (let i = 0; i < Math.min(repeat, 3); i++) {
        playBeep(i * 0.2, frequency);
        playBeep(i * 0.2 + 0.15, frequency * 1.2);
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  const showBatchedNotification = useCallback(() => {
    const orders = pendingOrdersRef.current;
    if (orders.length === 0) return;

    const count = orders.length;
    const orderNumbers = orders.map(n => `#${n}`).join(', ');
    
    const isKitchen = type === "kitchen";
    const frequency = isKitchen ? 600 : 800;

    if (count === 1) {
      toast({
        title: isKitchen ? "Nouvelle commande en cuisine!" : "Commande prête pour paiement!",
        description: `Commande ${orderNumbers}`,
      });
    } else {
      toast({
        title: isKitchen 
          ? `${count} nouvelles commandes en cuisine!` 
          : `${count} commandes prêtes pour paiement!`,
        description: `Commandes ${orderNumbers}`,
      });
    }

    // Play sound with intensity based on order count
    playNotificationSound(frequency, 0.3, count);
    
    // Clear pending orders
    pendingOrdersRef.current = [];
  }, [type, toast, playNotificationSound]);

  useEffect(() => {
    const targetStatus = type === "kitchen" ? "in_kitchen" : "ready";

    const channel = supabase
      .channel(`order-notifications-${type}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const newStatus = payload.new?.status;
          const oldStatus = payload.old?.status;
          
          if (newStatus === targetStatus && oldStatus !== targetStatus) {
            const orderNumber = payload.new?.order_number;
            if (orderNumber) {
              // Add to pending orders
              pendingOrdersRef.current.push(orderNumber);
              
              // Clear existing timeout and set new one
              if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
              }
              
              // Show batched notification after delay
              timeoutRef.current = setTimeout(showBatchedNotification, BATCH_DELAY_MS);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [type, showBatchedNotification]);

  return { playNotificationSound };
}
