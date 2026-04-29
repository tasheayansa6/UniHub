import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(formData.firstName, formData.lastName, formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Left Panel */}
        <div className="flex-1 relative overflow-hidden md:block hidden">
          <div className="absolute top-6 left-6 z-10">
            <button onClick={() => navigate('/')}
              className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/30 transition-all">
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop"
              alt="Team collaboration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/60" />
            <div className="absolute bottom-10 left-8 right-8 text-white">
              <h2 className="text-3xl font-bold mb-2">Join UniHub</h2>
              <p className="text-white/70 text-sm">Collaborate with your team, manage tasks, and share resources — all in one place.</p>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
            <p className="text-gray-600">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[['firstName', 'First Name', 'John'], ['lastName', 'Last Name', 'Doe']].map(([name, label, placeholder]) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                  <input type="text" id={name} name={name} value={formData[name]}
                    onChange={handleInputChange} placeholder={placeholder} required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                </div>
              ))}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email}
                onChange={handleInputChange} placeholder="Email Address" required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} onChange={handleInputChange} placeholder="Password" required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input type="checkbox" id="agreeToTerms" name="agreeToTerms"
                checked={formData.agreeToTerms} onChange={handleInputChange} required
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                I agree to the{' '}
                <button type="button" className="text-black font-medium hover:underline">Terms & Conditions</button>
              </label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
