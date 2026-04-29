import { cn } from '@/lib/utils';

export function MenuToggle({ open, onOpenChange, className, strokeWidth = 2 }) {
  return (
    <button
      onClick={() => onOpenChange(!open)}
      className={cn('flex flex-col justify-center items-center gap-[5px]', className)}
      aria-label="Toggle menu"
    >
      <span
        style={{ transitionDuration: '300ms', transformOrigin: 'center', strokeWidth }}
        className={cn('block h-0.5 w-5 bg-current transition-all', open && 'translate-y-[7px] rotate-45')}
      />
      <span
        style={{ transitionDuration: '300ms' }}
        className={cn('block h-0.5 w-5 bg-current transition-all', open && 'opacity-0 scale-x-0')}
      />
      <span
        style={{ transitionDuration: '300ms', transformOrigin: 'center' }}
        className={cn('block h-0.5 w-5 bg-current transition-all', open && '-translate-y-[7px] -rotate-45')}
      />
    </button>
  );
}
