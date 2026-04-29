import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HeroGeometric } from '../../components/ui/hero-geometric';
import { SimpleHeader } from '../../components/ui/simple-header';
import { AnimatedForm } from '../../components/ui/auth-components';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fields = [
    { label: 'email',    type: 'email',    required: true, placeholder: 'Enter your email',    onChange: e => setForm(f => ({ ...f, email: e.target.value })) },
    { label: 'password', type: 'password', required: true, placeholder: 'Enter your password', onChange: e => setForm(f => ({ ...f, password: e.target.value })) },
  ];

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SimpleHeader />
      <HeroGeometric badge="UniHub" title1="Welcome Back" title2="Sign in to continue" light>
        <div className="w-full max-w-sm mx-auto mt-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
          <AnimatedForm
            header="Sign In"
            subHeader="Welcome back to UniHub"
            fields={fields}
            submitButton={loading ? 'Signing in...' : 'Sign In'}
            errorField={error}
            googleLogin="Login with Google"
            textVariantButton="Don't have an account? Register"
            goTo={() => navigate('/register')}
            onSubmit={handleSubmit}
          />
        </div>
      </HeroGeometric>
    </div>
  );
}
