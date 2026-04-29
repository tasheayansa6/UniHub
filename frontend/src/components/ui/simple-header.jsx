import React from 'react';
import { Grid2x2Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { MenuToggle } from '@/components/ui/menu-toggle';
import { cn } from '@/lib/utils';

const links = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing',  href: '/pricing'  },
  { label: 'About',    href: '/about'    },
];

export function SimpleHeader() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b" style={{ background: '#ffffff', borderColor: '#e5e7eb' }}>
      <nav className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
          <Grid2x2Plus className="size-6" />
          <p className="font-mono text-lg font-bold">UniHub</p>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-2 lg:flex text-gray-900">
          {links.map((link) => (
            <a key={link.label} className={buttonVariants({ variant: 'ghost' })} href={link.href}>
              {link.label}
            </a>
          ))}
          <Button variant="outline" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/register')}>Get Started</Button>
        </div>

        {/* Mobile sheet */}
        <Sheet open={open} onOpenChange={setOpen}>
          <div className="lg:hidden border border-input rounded-md p-1 cursor-pointer hover:bg-accent">
            <MenuToggle strokeWidth={2.5} open={open} onOpenChange={setOpen} className="size-6 text-white" />
          </div>
          <SheetContent
            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
            showClose={false}
            side="left"
          >
            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
              {links.map((link) => (
                <a key={link.label}
                  className={buttonVariants({ variant: 'ghost', className: 'justify-start' })}
                  href={link.href}
                  onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              ))}
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => { setOpen(false); navigate('/login'); }}>Sign In</Button>
              <Button onClick={() => { setOpen(false); navigate('/register'); }}>Get Started</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

      </nav>
    </header>
  );
}
