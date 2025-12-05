import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurant } from "@/hooks/useRestaurant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Plus, Crown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestaurantSwitcherProps {
  collapsed?: boolean;
}

export function RestaurantSwitcher({ collapsed = false }: RestaurantSwitcherProps) {
  const navigate = useNavigate();
  const {
    restaurant,
    restaurants,
    switchRestaurant,
    canCreateNewRestaurant,
    getRestaurantLimit,
  } = useRestaurant();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const handleAddRestaurant = () => {
    if (canCreateNewRestaurant()) {
      navigate("/onboarding");
    } else {
      setShowUpgradeDialog(true);
    }
  };

  const handleSwitch = async (restaurantId: string) => {
    if (restaurantId !== restaurant?.id) {
      await switchRestaurant(restaurantId);
    }
  };

  const ownedCount = restaurants.filter((r) => r.is_owner).length;
  const limit = getRestaurantLimit();

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors">
            <Building2 size={20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {restaurants.map((ur) => (
            <DropdownMenuItem
              key={ur.restaurant_id}
              onClick={() => handleSwitch(ur.restaurant_id)}
              className="flex items-center justify-between"
            >
              <span className="truncate">{ur.restaurant.name}</span>
              {ur.restaurant_id === restaurant?.id && (
                <Check size={16} className="text-primary ml-2" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAddRestaurant}>
            <Plus size={16} className="mr-2" />
            Nouveau restaurant
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors flex items-center justify-between group">
            <div className="text-left min-w-0">
              <p className="font-medium text-sm truncate">
                {restaurant?.name || "Sélectionner"}
              </p>
              <p className="text-xs text-muted-foreground">
                {ownedCount}/{limit === 999 ? "∞" : limit} restaurants
              </p>
            </div>
            <ChevronDown
              size={16}
              className="text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {restaurants.map((ur) => (
            <DropdownMenuItem
              key={ur.restaurant_id}
              onClick={() => handleSwitch(ur.restaurant_id)}
              className={cn(
                "flex items-center justify-between cursor-pointer",
                ur.restaurant_id === restaurant?.id && "bg-muted"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 size={16} className="flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{ur.restaurant.name}</span>
              </div>
              {ur.restaurant_id === restaurant?.id && (
                <Check size={16} className="text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleAddRestaurant}
            className="cursor-pointer"
          >
            <Plus size={16} className="mr-2" />
            Nouveau restaurant
            {!canCreateNewRestaurant() && (
              <Crown size={14} className="ml-auto text-warning" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="text-warning" size={24} />
              Limite atteinte
            </DialogTitle>
            <DialogDescription>
              Votre abonnement actuel ({restaurant?.subscription_plan || "basic"}) vous permet de gérer {limit} restaurant{limit > 1 ? "s" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <h4 className="font-semibold">Passez à un plan supérieur</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-success" />
                  <span><strong>Pro</strong> : jusqu'à 3 restaurants</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-success" />
                  <span><strong>Premium</strong> : restaurants illimités</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowUpgradeDialog(false)}
              >
                Plus tard
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={() => {
                  setShowUpgradeDialog(false);
                  navigate("/dashboard/subscription");
                }}
              >
                <Crown size={16} className="mr-2" />
                Voir les offres
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
