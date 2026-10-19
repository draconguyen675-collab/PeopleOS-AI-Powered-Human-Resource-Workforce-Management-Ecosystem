import type { ButtonHTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "button-primary",
      outline: "button-outline",
      ghost: "button-ghost",
    },
  },
  defaultVariants: { variant: "default" },
});
type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };
export function Button({
  className,
  variant,
  asChild = false,
  type = "button",
  ...props
}: Props) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, className }))}
      {...props}
    />
  );
}
