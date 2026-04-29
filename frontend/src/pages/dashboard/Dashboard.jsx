import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import RadialOrbitalTimeline from '../../components/ui/radial-orbital-timeline';
import { GlowCard } from '../../components/ui/glow-card';
import { Users, CheckSquare, MessageSquare, FolderOpen, Bell, LayoutDashboard } from 'lucide-react';

const TIMELINE_DATA = [
  { id: 1, title: 'Dashboard',     date: 'Core',   content: 'Central hub for all your UniHub activity and stats.',      icon: LayoutDashboard, relatedIds: [2, 3, 4, 5, 6], status: 'completed',   energy: 100, link: '/dashboard'                },
  { id: 2, title: 'Teams',         date: 'Collab', content: 'Create teams, assign roles, and invite members.',          icon: Users,           relatedIds: [3, 4],          status: 'completed',   energy: 85,  link: '/dashboard/teams'           },
  { id: 3, title: 'Tasks',         date: 'Manage', content: 'Kanban board with drag-and-drop task management.',        icon: CheckSquare,     relatedIds: [2, 5],          status: 'in-progress', energy: 70,  link: '/dashboard/tasks'           },
  { id: 4, title: 'Messages',      date: 'Chat',   content: 'Real-time team messaging powered by Socket.io.',         icon: MessageSquare,   relatedIds: [2],             status: 'in-progress', energy: 60,  link: '/dashboard/messages'        },
  { id: 5, title: 'Resources',     date: 'Files',  content: 'Upload, organize and share files with your team.',        icon: FolderOpen,      relatedIds: [2, 3],          status: 'pending',     energy: 40,  link: '/dashboard/resources'       },
  { id: 6, title: 'Notifications', date: 'Alerts', content: 'Real-time alerts and updates across all your teams.',     icon: Bell,            relatedIds: [1],             status: 'pending',     energy: 50,  link: '/dashboard/notifications'   },
];

const StatCard = ({ icon, label, value, accent }) => (
  <div className="rounded-lg border p-6 flex items-center gap-4 shadow-sm transition-shadow hover:shadow-md"
    style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: accent + '20' }}>
      {icon}
    </div>
    <div>
      <div className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</div>
      <div className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
    </div>
  </div>
);

const QuickAction = ({ icon, label, onClick }) => (
  <button onClick={onClick}
    className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:scale-105 cursor-pointer w-full"
    style={{ background: 'var(--accent)', borderColor: 'var(--border)', color: 'var(--accent-foreground)' }}>
    <span className="text-2xl">{icon}</span>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ teams: 0, notifications: 0 });
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/teams'),
      api.get('/notifications'),
    ]).then(([teamsRes, notifRes]) => {
      const myTeams = teamsRes.data.teams || [];
      setTeams(myTeams.slice(0, 3));
      setStats({ teams: myTeams.length, notifications: notifRes.data.unreadCount || 0 });
    }).catch(() => {});
  }, []);

  return (
    <div className="fade-up space-y-8" style={{ color: 'var(--foreground)' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          <img src="/logo.png" alt="UniHub" className="w-4 h-4 object-contain" /> UniHub
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" label="My Teams"      value={stats.teams}         accent="#3b82f6" />
        <StatCard icon="🔔" label="Notifications" value={stats.notifications} accent="#f59e0b" />
        <StatCard icon="📋" label="Active Tasks"  value="—"                   accent="#10b981" />
        <StatCard icon="💬" label="Messages"      value="—"                   accent="#8b5cf6" />
      </div>

      {/* Platform Overview */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        <div className="px-5 py-4" style={{ background: 'var(--card)' }}>
          <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Platform Overview</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Click any node to explore features</p>
        </div>
        <div style={{ height: 480 }}>
          <RadialOrbitalTimeline timelineData={TIMELINE_DATA} onNavigate={navigate} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: '👥', label: 'New Team',     path: '/dashboard/teams',     glowColor: 'orange' },
            { icon: '📋', label: 'Add Task',     path: '/dashboard/tasks',     glowColor: 'blue'   },
            { icon: '💬', label: 'Send Message', path: '/dashboard/messages',  glowColor: 'purple' },
            { icon: '📁', label: 'Upload File',  path: '/dashboard/resources', glowColor: 'green'  },
          ].map(({ icon, label, path, glowColor }) => (
            <GlowCard
              key={label}
              glowColor={glowColor}
              customSize
              className="cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigate(path)}
            >
              <div className="flex flex-col items-center justify-center gap-3 py-4 h-full">
                <span className="text-4xl">{icon}</span>
                <span className="text-sm font-semibold text-white/80">{label}</span>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>

      {/* My Teams */}
      <div className="rounded-xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>My Teams</h2>
          <button onClick={() => navigate('/teams')}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            View All
          </button>
        </div>
        {teams.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--muted-foreground)' }}>
            <div className="text-4xl mb-2">👥</div>
            <p className="text-sm">
              No teams yet.{' '}
              <span className="font-semibold cursor-pointer hover:underline"
                style={{ color: 'var(--primary)' }}
                onClick={() => navigate('/dashboard/teams')}>
                Create or join a team
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teams.map(team => (
              <div key={team._id} onClick={() => navigate('/teams')}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
                style={{ borderColor: 'var(--border)', borderLeft: `4px solid ${team.color || '#f59e0b'}`, background: 'var(--accent)' }}>
                <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{team.name}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                  {team.members?.length || 0} members
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
