import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:shadow-medium hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/90",
        outline:
          "border-2 border-border bg-background hover:bg-muted hover:border-primary/30",
        secondary:
          "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-success text-success-foreground shadow-soft hover:bg-success/90",
        warning:
          "bg-warning text-warning-foreground shadow-soft hover:bg-warning/90",
        hero:
          "gradient-warm text-primary-foreground shadow-medium hover:shadow-glow hover:-translate-y-0.5",
        pos:
          "h-20 md:h-24 text-lg md:text-xl font-semibold rounded-2xl bg-card border-2 border-border hover:border-primary/50 hover:shadow-medium active:scale-95",
        "pos-primary":
          "h-20 md:h-24 text-lg md:text-xl font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-medium active:scale-95",
        "pos-secondary":
          "h-20 md:h-24 text-lg md:text-xl font-semibold rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft hover:shadow-medium active:scale-95",
        "pos-success":
          "h-16 md:h-20 text-base md:text-lg font-semibold rounded-xl bg-success text-success-foreground hover:bg-success/90 shadow-soft active:scale-95",
        "pos-destructive":
          "h-16 md:h-20 text-base md:text-lg font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft active:scale-95",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
