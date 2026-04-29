import { cn } from "@/lib/utils";

export function MenuToggleIcon({ open, className, duration = 300 }) {
  const style = { transition: `transform ${duration}ms ease, opacity ${duration}ms ease` };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"
      className={cn("size-5", className)}>
      <line x1="4" y1="7"  x2="20" y2="7"
        style={{ ...style, transform: open ? "rotate(45deg) translate(3.5px, 3.5px)" : "none", transformOrigin: "center" }} />
      <line x1="4" y1="12" x2="20" y2="12"
        style={{ ...style, opacity: open ? 0 : 1 }} />
      <line x1="4" y1="17" x2="20" y2="17"
        style={{ ...style, transform: open ? "rotate(-45deg) translate(3.5px, -3.5px)" : "none", transformOrigin: "center" }} />
    </svg>
  );
}
