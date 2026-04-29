import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

// Context
const PromptInputContext = createContext({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
});

function usePromptInput() {
  const context = useContext(PromptInputContext);
  if (!context) throw new Error("usePromptInput must be used within a PromptInput");
  return context;
}

// Textarea
const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex w-full rounded-md border-none bg-transparent px-3 py-2.5 text-sm text-gray-100 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] resize-none",
      className
    )}
    rows={1}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// Tooltip primitives
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border border-[#333] bg-[#1F2023] px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = "TooltipContent";

// PromptInput
function PromptInput({ className, isLoading = false, maxHeight = 240, value, onValueChange, onSubmit, children, disabled = false }) {
  const [internalValue, setInternalValue] = useState(value || "");
  const handleChange = (newValue) => { setInternalValue(newValue); onValueChange?.(newValue); };

  return (
    <TooltipProvider>
      <PromptInputContext.Provider value={{ isLoading, value: value ?? internalValue, setValue: onValueChange ?? handleChange, maxHeight, onSubmit, disabled }}>
        <div className={cn("border border-[#444444] bg-[#1F2023] rounded-3xl p-2 shadow-xs", className)}>
          {children}
        </div>
      </PromptInputContext.Provider>
    </TooltipProvider>
  );
}

// PromptInputTextarea
function PromptInputTextarea({ className, onKeyDown, disableAutosize = false, ...props }) {
  const { value, setValue, maxHeight, onSubmit, disabled } = usePromptInput();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (disableAutosize || !textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height =
      typeof maxHeight === "number"
        ? `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`
        : `min(${textareaRef.current.scrollHeight}px, ${maxHeight})`;
  }, [value, maxHeight, disableAutosize]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit?.(); }
    onKeyDown?.(e);
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className={cn("min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0", className)}
      disabled={disabled}
      {...props}
    />
  );
}

// PromptInputActions
function PromptInputActions({ children, className, ...props }) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

// PromptInputAction
function PromptInputAction({ tooltip, children, className, side = "top", ...props }) {
  const { disabled } = usePromptInput();
  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled}>{children}</TooltipTrigger>
      <TooltipContent side={side} className={className}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export { PromptInput, PromptInputTextarea, PromptInputActions, PromptInputAction, usePromptInput };
