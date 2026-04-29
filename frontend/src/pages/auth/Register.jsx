import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HeroGeometric } from '../../components/ui/hero-geometric';
import { SimpleHeader } from '../../components/ui/simple-header';
import { AnimatedForm } from '../../components/ui/auth-components';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fields = [
    { label: 'firstName', type: 'text',     required: true, placeholder: 'First name',          onChange: e => setForm(f => ({ ...f, firstName: e.target.value })) },
    { label: 'lastName',  type: 'text',     required: true, placeholder: 'Last name',           onChange: e => setForm(f => ({ ...f, lastName: e.target.value })) },
    { label: 'email',     type: 'email',    required: true, placeholder: 'Enter your email',    onChange: e => setForm(f => ({ ...f, email: e.target.value })) },
    { label: 'password',  type: 'password', required: true, placeholder: 'Enter your password', onChange: e => setForm(f => ({ ...f, password: e.target.value })) },
  ];

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      await register(form.firstName, form.lastName, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SimpleHeader />
      <HeroGeometric badge="UniHub" title1="Join UniHub" title2="Start collaborating today" light>
        <div className="w-full max-w-sm mx-auto mt-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
          <AnimatedForm
            header="Create Account"
            subHeader="Join UniHub and start collaborating"
            fields={fields}
            submitButton={loading ? 'Creating account...' : 'Create Account'}
            errorField={error}
            googleLogin="Sign up with Google"
            textVariantButton="Already have an account? Sign in"
            goTo={() => navigate('/login')}
            onSubmit={handleSubmit}
            fieldPerRow={2}
          />
        </div>
      </HeroGeometric>
    </div>
  );
}
