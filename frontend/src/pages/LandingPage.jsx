import { useNavigate } from 'react-router-dom';
import { Users, CheckSquare, MessageSquare, FolderOpen, Bell, LayoutDashboard, ArrowRight, Check, GitBranch } from 'lucide-react';
import { HoverSlider, TextStaggerHover, HoverSliderImageWrap, HoverSliderImage } from '../components/ui/hover-slider';
import { Boxes } from '../components/ui/boxes';
import { LocationTag } from '../components/ui/location-tag';
import { CalendarCard } from '../components/ui/calendar-card';
import { HeroSection } from '../components/ui/hero-section';

const heroSlides = [
  { text: 'Collaborate',  imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' },
  { text: 'Communicate',  imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80' },
  { text: 'Create',       imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80' },
];

const features = [
  { title: 'Smart Dashboard',     desc: 'Central hub with real-time stats and quick actions.',     color: '#3b82f6', Icon: LayoutDashboard },
  { title: 'Team Collaboration',  desc: 'Create teams, assign roles, and invite members.',         color: '#f59e0b', Icon: Users           },
  { title: 'Task Management',     desc: 'Kanban board with drag-and-drop and progress tracking.',  color: '#10b981', Icon: CheckSquare     },
  { title: 'Real-Time Chat',      desc: 'Instant messaging powered by Socket.io.',                 color: '#8b5cf6', Icon: MessageSquare   },
  { title: 'Resource Sharing',    desc: 'Upload and share files across your teams.',               color: '#ef4444', Icon: FolderOpen      },
  { title: 'Notifications',       desc: 'Real-time alerts for all team activity.',                 color: '#ec4899', Icon: Bell            },
];

const plans = [
  { name: 'Free',       price: '$0',  period: 'forever',   color: '#3b82f6', features: ['Up to 3 teams', '5 members/team', 'Basic tasks', 'Team chat', '1GB storage'],                                          cta: 'Get Started' },
  { name: 'Pro',        price: '$9',  period: 'per month', color: '#f59e0b', features: ['Unlimited teams', '25 members/team', 'Advanced Kanban', 'File sharing', '20GB storage', 'Priority alerts'], popular: true, cta: 'Start Free Trial' },
  { name: 'University', price: '$29', period: 'per month', color: '#10b981', features: ['Unlimited everything', 'Admin panel', 'Analytics', 'SSO', '100GB storage', 'Dedicated support'],                        cta: 'Contact Us' },
];

const team = [
  { name: 'Frontend Team',    count: 5, desc: 'UI/UX, Components, Routing',       color: '#3b82f6', icon: '🎨' },
  { name: 'Backend Team',     count: 4, desc: 'Server, Auth, APIs, Middleware',    color: '#f59e0b', icon: '⚙️' },
  { name: 'Database Team',    count: 2, desc: 'Schema Design, Optimization',       color: '#10b981', icon: '🗄️' },
  { name: 'Testing Team',     count: 2, desc: 'Functional Testing, Bug Tracking',  color: '#8b5cf6', icon: '🧪' },
  { name: 'Integration Lead', count: 1, desc: 'Coordination, Code Review',         color: '#ef4444', icon: '🔗' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030303] text-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030303]/90 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="text-2xl">🎓</span> UniHub
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[['Features', '#features'], ['Pricing', '#pricing'], ['About', '#about']].map(([label, href]) => (
              <a key={label} href={href}
                className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all">
                {label}
              </a>
            ))}
            <div className="ml-2">
              <LocationTag city="Haramaya" country="ET" timezone="EAT" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-opacity hover:opacity-80"
              style={{ background: '#f59e0b', color: '#000' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero — Three.js immersive scene */}
      <HeroSection />

      {/* Feature preview strip */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <HoverSlider>
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-white/60 mb-6">
                🎓 Smart University Collaboration
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">
                {heroSlides.map((slide, i) => (
                  <span key={slide.text} className="block">
                    <TextStaggerHover
                      text={slide.text}
                      index={i}
                      className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300"
                    />
                  </span>
                ))}
                <span className="block text-white/80 text-3xl md:text-4xl mt-2">Like Professionals</span>
              </h2>
              <p className="text-white/50 text-lg max-w-xl mb-8 leading-relaxed">
                UniHub brings together task management, real-time chat, file sharing, and team coordination.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                <button onClick={() => navigate('/register')}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
                  style={{ background: '#f59e0b', color: '#000' }}>
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => navigate('/login')}
                  className="px-8 py-3.5 rounded-xl font-semibold text-sm border border-white/[0.08] text-white/70 hover:bg-white/[0.05] transition-all">
                  Sign In
                </button>
              </div>
            </div>
            <div className="flex-1 w-full max-w-lg">
              <HoverSliderImageWrap className="rounded-2xl overflow-hidden aspect-[4/3] border border-white/[0.08]">
                {heroSlides.map((slide, i) => (
                  <HoverSliderImage key={slide.text} index={i} imageUrl={slide.imageUrl} alt={slide.text} />
                ))}
              </HoverSliderImageWrap>
            </div>
          </div>
        </HoverSlider>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-white/60 mb-4">
            ✨ Everything you need
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-white/50 max-w-xl mx-auto">All the tools your team needs to collaborate effectively.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ title, desc, color, Icon }) => (
            <div key={title} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 hover:bg-white/[0.06] transition-all">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: color + '20', color }}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-white/60 mb-4">
            💰 Simple pricing
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">Plans for Every Team</h2>
          <p className="text-white/50 max-w-xl mx-auto">Start free, scale as your team grows.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name}
              className={`rounded-2xl border p-6 flex flex-col transition-all ${plan.popular ? 'border-[#f59e0b]/50 bg-[#f59e0b]/[0.05] scale-105' : 'border-white/[0.08] bg-white/[0.03]'}`}>
              {plan.popular && (
                <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-3" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                  Most Popular
                </span>
              )}
              <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-white/40 text-sm mb-1">/{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('/register')}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
                style={{ background: plan.color, color: '#000' }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-5xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-white/60 mb-4">
            🎓 About UniHub
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">Built by Students, for Students</h2>
          <p className="text-white/50 max-w-2xl mx-auto leading-relaxed">
            UniHub simulates a real-world software development environment while solving genuine collaboration challenges faced by student teams.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {team.map((t) => (
            <div key={t.name} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: t.color + '20' }}>
                {t.icon}
              </div>
              <div>
                <div className="text-white font-semibold text-sm">
                  {t.name}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: t.color + '20', color: t.color }}>
                    {t.count} {t.count === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <div className="text-white/50 text-xs mt-1">{t.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar card */}
        <div className="mb-12">
          <CalendarCard bookingLink="https://github.com/tasheayansa6/UniHub" />
        </div>

        {/* Tech stack */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 mb-12">
          <h3 className="text-white font-bold text-xl mb-4">Tech Stack</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'React', color: '#61dafb' }, { label: 'Node.js', color: '#68a063' },
              { label: 'MongoDB', color: '#47a248' }, { label: 'Socket.io', color: '#ffffff' },
              { label: 'Tailwind', color: '#38bdf8' }, { label: 'JWT Auth', color: '#f59e0b' },
              { label: 'Express', color: '#888888' }, { label: 'Vite', color: '#646cff' },
            ].map((t) => (
              <div key={t.label} className="rounded-lg border border-white/[0.08] px-3 py-2 text-center text-sm font-medium" style={{ color: t.color }}>
                {t.label}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/register')}
            className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ background: '#f59e0b', color: '#000' }}>
            Join UniHub →
          </button>
          <a href="https://github.com/tasheayansa6/UniHub" target="_blank" rel="noreferrer"
            className="px-8 py-3 rounded-xl border border-white/[0.08] text-white/70 font-semibold text-sm hover:bg-white/[0.05] transition-all flex items-center justify-center gap-2">
            <GitBranch className="w-4 h-4" /> View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-white/[0.08] bg-[#030303]">
        {/* Animated boxes background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <Boxes />
        </div>

        {/* Overlay to darken boxes */}
        <div className="absolute inset-0 bg-[#030303]/80 z-10" />

        {/* Footer content */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl mb-3">
                <span className="text-2xl">🎓</span>
                <span className="text-white">UniHub</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                Empowering student teams with real-world collaboration tools — tasks, chat, files, and more in one place.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <a href="https://github.com/tasheayansa6/UniHub" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-white/50 text-xs font-medium hover:bg-white/[0.05] hover:text-white transition-all">
                  <GitBranch className="w-3.5 h-3.5" /> GitHub
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-2.5">
                {[['Features', '#features'], ['Pricing', '#pricing'], ['About', '#about']].map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-white/40 text-sm hover:text-white transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Platform</p>
              <ul className="space-y-2.5">
                {['Dashboard', 'Teams', 'Tasks', 'Messages', 'Resources'].map(label => (
                  <li key={label}>
                    <span className="text-white/40 text-sm">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/25 text-xs">
              © {new Date().getFullYear()} UniHub — Built by students, for students.
            </p>
            <div className="flex items-center gap-4">
              {['React', 'Node.js', 'MongoDB', 'Socket.io'].map(t => (
                <span key={t} className="text-white/20 text-xs">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
