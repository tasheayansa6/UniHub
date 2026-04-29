// notifications

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell, CheckCheck, Check, Trash2, Filter,
  CheckSquare, Users, MessageSquare, FolderOpen, Info, X
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  task:     { icon: CheckSquare,  color: '#3b82f6', bg: '#3b82f615', label: 'Task'     },
  team:     { icon: Users,        color: '#f59e0b', bg: '#f59e0b15', label: 'Team'     },
  message:  { icon: MessageSquare,color: '#8b5cf6', bg: '#8b5cf615', label: 'Message'  },
  resource: { icon: FolderOpen,   color: '#10b981', bg: '#10b98115', label: 'Resource' },
  system:   { icon: Info,         color: '#64748b', bg: '#64748b15', label: 'System'   },
};

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Avatar({ user }) {
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : '?';
  const colors = ['#3b82f6','#f59e0b','#10b981','#8b5cf6','#ef4444','#ec4899'];
  const idx = (user?.firstName?.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
      style={{ background: colors[idx] }}>
      {initials}
    </div>
  );
}

// ─── Notification Card ─────────────────────────────────────────────────────────

function NotificationCard({ notif, onMarkRead }) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="relative rounded-2xl border p-4 transition-all hover:shadow-md"
      style={{
        background: notif.read ? 'var(--card)' : cfg.bg,
        borderColor: notif.read ? 'var(--border)' : cfg.color + '40',
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full" style={{ background: cfg.color }} />
      )}

      <div className="flex items-start gap-3">
        {/* Icon badge */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
          <Icon size={16} style={{ color: cfg.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
              style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {timeAgo(notif.createdAt)}
            </span>
          </div>

          <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
            {notif.title}
          </p>

          {/* Message bubble */}
          <div className="mt-2 rounded-xl rounded-tl-none px-3 py-2 text-sm"
            style={{ background: 'var(--background)', color: 'var(--muted-foreground)' }}>
            {notif.message}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {notif.read ? (
                <><Check size={12} className="text-green-400" /><span className="text-green-400">Read</span></>
              ) : (
                <span style={{ color: cfg.color }}>Unread</span>
              )}
            </div>
            {!notif.read && (
              <button onClick={() => onMarkRead(notif._id)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                style={{ background: cfg.color + '20', color: cfg.color }}>
                <Check size={11} /> Mark read
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | unread | task | team | message | resource

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data.notifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const FILTERS = [
    { id: 'all',      label: 'All'      },
    { id: 'unread',   label: 'Unread'   },
    { id: 'task',     label: 'Tasks'    },
    { id: 'team',     label: 'Teams'    },
    { id: 'message',  label: 'Messages' },
    { id: 'resource', label: 'Files'    },
  ];

  return (
    <div className="space-y-6 fade-up max-w-2xl" style={{ color: 'var(--foreground)' }}>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={22} className="text-blue-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm px-2 py-0.5 rounded-full font-bold"
                style={{ background: '#ef444420', color: '#ef4444' }}>
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Stay up to date with your team activity
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: '#10b98120', color: '#10b981' }}>
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',    value: notifications.length,                                    color: '#3b82f6' },
          { label: 'Unread',   value: unreadCount,                                             color: '#ef4444' },
          { label: 'Tasks',    value: notifications.filter(n => n.type === 'task').length,     color: '#f59e0b' },
          { label: 'Teams',    value: notifications.filter(n => n.type === 'team').length,     color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border p-4"
            style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
        {FILTERS.map(f => {
          const cfg = TYPE_CONFIG[f.id];
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background: active ? (cfg?.bg ?? '#3b82f620') : 'transparent',
                borderColor: active ? (cfg?.color ?? '#3b82f6') : 'var(--border)',
                color: active ? (cfg?.color ?? '#3b82f6') : 'var(--muted-foreground)',
              }}>
              {f.label}
              {f.id === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#ef444430', color: '#ef4444' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border p-16 text-center" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <Bell size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'var(--muted-foreground)' }} />
          <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {filter === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.map(n => (
              <NotificationCard key={n._id} notif={n} onMarkRead={handleMarkRead} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
