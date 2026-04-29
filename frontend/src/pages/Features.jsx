import { useNavigate } from 'react-router-dom';
import { SimpleHeader } from '../components/ui/simple-header';
import { Users, CheckSquare, MessageSquare, FolderOpen, Bell, LayoutDashboard } from 'lucide-react';

const featureData = [
  { title: 'Smart Dashboard',     desc: 'Central hub with real-time stats, activity feed, and quick actions.',      color: '#3b82f6', Icon: LayoutDashboard },
  { title: 'Team Collaboration',  desc: 'Create teams, assign roles, invite members, and manage permissions.',      color: '#f59e0b', Icon: Users           },
  { title: 'Task Management',     desc: 'Kanban board with drag-and-drop, priorities, deadlines, and tracking.',    color: '#10b981', Icon: CheckSquare     },
  { title: 'Real-Time Chat',      desc: 'Instant team messaging powered by Socket.io with file sharing.',           color: '#8b5cf6', Icon: MessageSquare   },
  { title: 'Resource Sharing',    desc: 'Upload, organize, and share files across your teams.',                     color: '#ef4444', Icon: FolderOpen      },
  { title: 'Smart Notifications', desc: 'Real-time alerts for task updates, messages, and team activity.',          color: '#ec4899', Icon: Bell            },
];

export default function Features() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#030303]">
      <SimpleHeader />
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-white/60 mb-6">
            ✨ Everything you need
          </span>
          <h1 className="text-5xl font-bold text-white mb-4">Powerful Features</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            UniHub brings together all the tools your team needs to collaborate effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {featureData.map(({ title, desc, color, Icon }) => (
            <div key={title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4" style={{ background: color + '20', color }}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button onClick={() => navigate('/register')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Get Started Free →
          </button>
        </div>
      </div>
    </div>
  );
}
