import { useNavigate } from 'react-router-dom';
import { SimpleHeader } from '../components/ui/simple-header';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for small student teams getting started.',
    color: '#3b82f6',
    features: ['Up to 3 teams', '5 members per team', 'Basic task management', 'Team chat', '1GB file storage'],
    cta: 'Get Started',
    route: '/register',
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    desc: 'For growing teams that need more power.',
    color: '#f59e0b',
    features: ['Unlimited teams', '25 members per team', 'Advanced Kanban board', 'Real-time chat + file sharing', '20GB file storage', 'Priority notifications'],
    cta: 'Start Free Trial',
    route: '/register',
    popular: true,
  },
  {
    name: 'University',
    price: '$29',
    period: 'per month',
    desc: 'For entire departments and institutions.',
    color: '#10b981',
    features: ['Unlimited everything', 'Admin panel', 'Analytics dashboard', 'SSO integration', '100GB file storage', 'Dedicated support'],
    cta: 'Contact Us',
    route: '/about',
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#030303]">
      <SimpleHeader />
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-sm text-white/60 mb-6">
            💰 Simple pricing
          </span>
          <h1 className="text-5xl font-bold text-white mb-4">Plans for Every Team</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Start free, scale as your team grows. No hidden fees.
          </p>
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
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-white/40 text-sm mb-1">/{plan.period}</span>
              </div>
              <p className="text-white/50 text-sm mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="w-4 h-4 flex-shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(plan.route)}
                className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
                style={{ background: plan.color, color: '#000' }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
