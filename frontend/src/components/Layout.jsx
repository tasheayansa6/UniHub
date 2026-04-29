import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from './ui/dropdown-menu';
import {
  ChevronsUpDown, LayoutDashboard, CheckSquare, MessageSquare,
  FolderOpen, Bell, User, LogOut, Settings, Users,
  UserCog, Blocks, Plus, GraduationCap, FileClock,
} from 'lucide-react';

// ─── Motion variants ──────────────────────────────────────────────────────────

const sidebarVariants = {
  open:   { width: '15rem' },
  closed: { width: '3.05rem' },
};

const transitionProps = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

const labelVariants = {
  open:   { x: 0,   opacity: 1, display: 'block', transition: { x: { stiffness: 1000, velocity: -100 } } },
  closed: { x: -10, opacity: 0, display: 'none',  transition: { x: { stiffness: 100 } } },
};

// ─── Nav structure ────────────────────────────────────────────────────────────

const NAV_MAIN = [
  { to: '/dashboard',               label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/dashboard/tasks',         label: 'Tasks',        icon: CheckSquare     },
  { to: '/dashboard/messages',      label: 'Messages',     icon: MessageSquare, badge: 'LIVE' },
];

const NAV_MANAGE = [
  { to: '/dashboard/teams',         label: 'Teams',        icon: Users           },
  { to: '/dashboard/resources',     label: 'Resources',    icon: FolderOpen      },
  { to: '/dashboard/notifications', label: 'Notifications',icon: Bell            },
];

const NAV_BOTTOM = [
  { to: '/dashboard/profile',       label: 'Profile',      icon: User            },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function UserAvatar({ user, className }) {
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';
  const colors = ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899'];
  const bg = colors[(user?.firstName?.charCodeAt(0) ?? 0) % colors.length];
  return (
    <Avatar className={className}>
      {user?.avatar && (
        <AvatarImage src={`http://localhost:5000${user.avatar}`} alt={user.firstName} />
      )}
      <AvatarFallback style={{ background: bg, color: '#fff', fontSize: 11, fontWeight: 700 }}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function NavItem({ to, label, icon: Icon, badge, isCollapsed }) {
  const location = useLocation();
  const isActive = to === '/dashboard'
    ? location.pathname === '/dashboard'
    : location.pathname.startsWith(to);

  return (
    <NavLink to={to} className="block">
      <div className={cn(
        'flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition-colors',
        'hover:bg-white/[0.06] hover:text-white',
        isActive && 'bg-white/[0.08] text-blue-400',
        !isActive && 'text-white/50',
      )}>
        <Icon className="h-4 w-4 shrink-0" />
        <motion.span
          variants={labelVariants}
          className="ml-2 flex items-center gap-2 text-sm font-medium whitespace-nowrap overflow-hidden"
        >
          {label}
          {badge && (
            <span className="rounded border-none bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400">
              {badge}
            </span>
          )}
        </motion.span>
      </div>
    </NavLink>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const animState = isCollapsed ? 'closed' : 'open';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>

      {/* ── Sidebar ── */}
      <motion.aside
        className="sidebar fixed left-0 z-40 h-full shrink-0 border-r"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        initial="closed"
        animate={animState}
        variants={sidebarVariants}
        transition={transitionProps}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <motion.div
          className="relative z-40 flex h-full shrink-0 flex-col text-white/70"
          style={{ background: 'linear-gradient(180deg, #0c1220 0%, #0a0f1a 100%)' }}
          animate={animState}
        >
          <motion.ul className="flex h-full flex-col" animate={animState}>

            {/* ── Org header ── */}
            <div className="flex h-[54px] w-full shrink-0 items-center border-b px-2"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.06] outline-none">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md overflow-hidden"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' }}>
                      <img src="/logo.png" alt="UniHub" className="w-full h-full object-contain p-0.5" />
                    </div>
                    <motion.span
                      variants={labelVariants}
                      className="flex items-center gap-1.5 text-sm font-semibold text-white whitespace-nowrap overflow-hidden"
                    >
                      UniHub
                      <ChevronsUpDown className="h-3.5 w-3.5 text-white/30" />
                    </motion.span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={8}>
                  <DropdownMenuLabel>Workspace</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => navigate('/dashboard/teams')}
                  >
                    <UserCog className="h-4 w-4" /> Manage Teams
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => navigate('/dashboard/resources')}
                  >
                    <Blocks className="h-4 w-4" /> Resources
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => navigate('/dashboard/teams')}
                  >
                    <Plus className="h-4 w-4" /> Create or join a team
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ── Nav links ── */}
            <div className="flex h-full w-full flex-col overflow-hidden">
              <div className="flex grow flex-col gap-2">
                <ScrollArea className="grow p-2">
                  <div className="flex w-full flex-col gap-0.5">

                    {/* Main */}
                    {NAV_MAIN.map(item => (
                      <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
                    ))}

                    <Separator className="my-1" />

                    {/* Manage */}
                    {NAV_MANAGE.map(item => (
                      <NavItem key={item.to} {...item} isCollapsed={isCollapsed} />
                    ))}

                    <Separator className="my-1" />

                    {/* Knowledge / extras */}
                    <NavItem
                      to="/dashboard"
                      label="Knowledge Base"
                      icon={GraduationCap}
                      isCollapsed={isCollapsed}
                    />
                    <NavItem
                      to="/dashboard/notifications"
                      label="Activity Log"
                      icon={FileClock}
                      isCollapsed={isCollapsed}
                    />

                  </div>
                </ScrollArea>
              </div>

              {/* ── Bottom: settings + user ── */}
              <div className="flex flex-col gap-0.5 p-2 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

                {/* Settings */}
                <NavItem
                  to="/dashboard/profile"
                  label="Settings"
                  icon={Settings}
                  isCollapsed={isCollapsed}
                />

                {/* User dropdown */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/[0.06] outline-none">
                      <UserAvatar user={user} className="size-4 shrink-0" />
                      <motion.span
                        variants={labelVariants}
                        className="flex w-full items-center gap-1.5 overflow-hidden"
                      >
                        <span className="text-sm font-medium text-white/80 truncate">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-white/30" />
                      </motion.span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent sideOffset={8} align="start">
                    {/* User info header */}
                    <div className="flex flex-row items-center gap-2.5 px-2.5 py-2">
                      <UserAvatar user={user} className="size-7 shrink-0" />
                      <div className="flex flex-col text-left min-w-0">
                        <span className="text-sm font-semibold text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="text-xs text-white/40 truncate">{user?.email}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => navigate('/dashboard/profile')}
                    >
                      <User className="h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-red-400 hover:text-red-300 focus:text-red-300"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </div>

          </motion.ul>
        </motion.div>
      </motion.aside>

      {/* ── Main content — offset by collapsed sidebar width ── */}
      <div className="flex-1 flex flex-col min-w-0" style={{ marginLeft: '3.05rem' }}>
        <main className="flex-1 overflow-auto p-6 md:p-8" style={{ background: 'var(--background)' }}>
          <Outlet />
        </main>
      </div>

    </div>
  );
}
