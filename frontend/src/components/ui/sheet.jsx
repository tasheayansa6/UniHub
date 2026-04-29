import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const sideClasses = {
  top:    'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
  left:   'inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm',
  right:  'inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm',
};

function SheetOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  );
}

function SheetContent({ className, children, side = 'right', showClose = true, ...props }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500',
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
        {showClose && (
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
            ✕
          </SheetClose>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

function SheetFooter({ className, ...props }) {
  return (
    <div className={cn('flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end', className)} {...props} />
  );
}

function SheetHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1.5 p-4', className)} {...props} />;
}

function SheetTitle({ className, ...props }) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold', className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle };
