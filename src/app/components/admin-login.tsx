import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Demo credentials
  const ADMIN_EMAIL = 'admin@grazel.com';
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors mb-8"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
          <span className="text-[14px]">Back to Store</span>
        </button>

        {/* Login Card */}
        <div className="bg-white p-8 border border-gray-200 shadow-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[var(--crimson)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-white" />
            </div>
            <h1 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
              Admin Access
            </h1>
            <p className="text-[14px] text-gray-500">
              Enter your credentials to access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-[14px] rounded">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@grazel.com"
                className="w-full h-12 px-4 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-12 px-4 pr-12 border border-gray-200 text-[14px] focus:outline-none focus:border-[var(--crimson)] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--charcoal)]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] font-medium tracking-wide hover:opacity-90 transition-opacity"
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-[12px] text-gray-500 text-center mb-2">Demo Credentials:</p>
            <p className="text-[13px] text-[var(--charcoal)] text-center">
              Email: <span className="font-medium">admin@grazel.com</span>
            </p>
            <p className="text-[13px] text-[var(--charcoal)] text-center">
              Password: <span className="font-medium">admin123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-gray-400 mt-6">
          This area is restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
}
