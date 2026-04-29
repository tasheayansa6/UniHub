import { cn } from "@/lib/utils";

const variants = {
  default:     "bg-primary text-primary-foreground hover:bg-primary/90",
  outline:     "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost:       "bg-transparent hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizes = {
  default: "h-10 px-4 py-2 text-sm",
  sm:      "h-8 px-3 text-xs",
  lg:      "h-12 px-6 text-base",
  icon:    "h-9 w-9",
};

export function buttonVariants({ variant = "default", size = "default", className = "" } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );
}

export function Button({ className, variant = "default", size = "default", children, ...props }) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
