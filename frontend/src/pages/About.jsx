import { useNavigate } from 'react-router-dom';
import { SimpleHeader } from '../components/ui/simple-header';
import { GitBranch, Users } from 'lucide-react';

const team = [
  { name: 'Frontend Team',    count: 5,  desc: 'UI/UX, Components, Routing, API Integration',        color: '#3b82f6', icon: '🎨' },
  { name: 'Backend Team',     count: 4,  desc: 'Server Setup, Authentication, APIs, Middleware',      color: '#f59e0b', icon: '⚙️' },
  { name: 'Database Team',    count: 2,  desc: 'Schema Design, Implementation, Optimization',         color: '#10b981', icon: '🗄️' },
  { name: 'Testing Team',     count: 2,  desc: 'Functional Testing, Bug Tracking',                    color: '#8b5cf6', icon: '🧪' },
  { name: 'Integration Lead', count: 1,  desc: 'Coordination, Code Review, Merging',                  color: '#ef4444', icon: '🔗' },
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#030303]">
      <SimpleHeader />
      <div className="max-w-4xl mx-auto px-4 py-20">

        {/* Hero */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-white/60 mb-6">
            🎓 About UniHub
          </span>
          <h1 className="text-5xl font-bold text-white mb-4">Built by Students,<br />for Students</h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            UniHub is a smart university collaboration platform designed to improve how student teams
            collaborate, manage projects, and share knowledge — simulating a real-world software development environment.
          </p>
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 mb-12">
          <h2 className="text-white font-bold text-2xl mb-4">Our Mission</h2>
          <p className="text-white/60 leading-relaxed">
            We believe collaboration should be effortless. UniHub brings together task management,
            real-time communication, file sharing, and team coordination into a single cohesive experience —
            empowering student teams to work like professional software engineers.
          </p>
        </div>

        {/* Team */}
        <div className="mb-12">
          <h2 className="text-white font-bold text-2xl mb-6 flex items-center gap-2">
            <Users className="w-6 h-6" /> The Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((t) => (
              <div key={t.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: t.color + '20' }}>
                  {t.icon}
                </div>
                <div>
                  <div className="text-white font-semibold">{t.name}
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: t.color + '20', color: t.color }}>
                      {t.count} {t.count === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <div className="text-white/50 text-sm mt-1">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 mb-12">
          <h2 className="text-white font-bold text-2xl mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'React',      color: '#61dafb' },
              { label: 'Node.js',    color: '#68a063' },
              { label: 'MongoDB',    color: '#47a248' },
              { label: 'Socket.io',  color: '#ffffff' },
              { label: 'Tailwind',   color: '#38bdf8' },
              { label: 'JWT Auth',   color: '#f59e0b' },
              { label: 'Express',    color: '#888888' },
              { label: 'Vite',       color: '#646cff' },
            ].map((t) => (
              <div key={t.label} className="rounded-lg border border-white/[0.08] px-3 py-2 text-center text-sm font-medium"
                style={{ color: t.color }}>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/register')}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity">
            Join UniHub →
          </button>
          <a href="https://github.com/tasheayansa6/UniHub" target="_blank" rel="noreferrer"
            className="px-8 py-3 rounded-xl border border-white/[0.08] text-white/70 font-semibold text-sm hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2">
            <GitBranch className="w-4 h-4" /> View on GitHub
          </a>
        </div>

      </div>
    </div>
  );
}
