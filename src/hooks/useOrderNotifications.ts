import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type NotificationType = "kitchen" | "pos";

export function useOrderNotifications(type: NotificationType) {
  const { toast } = useToast();
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = (frequency: number = 800, duration: number = 0.3) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // Play a second beep for emphasis
      setTimeout(() => {
        const oscillator2 = ctx.createOscillator();
        const gainNode2 = ctx.createGain();
        oscillator2.connect(gainNode2);
        gainNode2.connect(ctx.destination);
        oscillator2.frequency.value = frequency * 1.2;
        oscillator2.type = "sine";
        gainNode2.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        oscillator2.start(ctx.currentTime);
        oscillator2.stop(ctx.currentTime + duration);
      }, 150);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  useEffect(() => {
    const targetStatus = type === "kitchen" ? "in_kitchen" : "ready";
    const notificationMessage = type === "kitchen" 
      ? "Nouvelle commande en cuisine!" 
      : "Commande prête pour paiement!";

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
            playNotificationSound(type === "kitchen" ? 600 : 800);
            toast({
              title: notificationMessage,
              description: `Commande #${payload.new?.order_number}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [type, toast]);

  return { playNotificationSound };
}
