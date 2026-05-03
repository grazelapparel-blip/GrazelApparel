import { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import { signUpUser, signInUser, resetPassword, signInWithGoogle, handleAuthRedirect } from '../../lib/firebase';
import { useAppStore } from '../store/app-store';

interface UserAuthProps {
  onSuccess: () => void;
}

type AuthStep = 'form' | 'signup-success' | 'forgot-password' | 'reset-sent';

export function UserAuth({ onSuccess }: UserAuthProps) {
  const { setCurrentUser } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check for redirect from Google OAuth on component mount
  useEffect(() => {
    const checkRedirect = async () => {
      const result = await handleAuthRedirect();
      if (result.isRedirectAuth && result.user) {
        const newUser = {
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || 'User',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setCurrentUser(newUser);
        onSuccess();
      }
    };
    checkRedirect();
  }, [setCurrentUser, onSuccess]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Handle Sign Up - creates account
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { user } = await signUpUser(formData.email, formData.password, formData.name);

      if (user) {
        // Account created - show success and prompt to login
        setStep('signup-success');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.message?.includes('rate limit')) {
        setError('Email rate limit exceeded. Please wait 1 hour or try a different email address.');
      } else if (err.message?.includes('already registered') || err.message?.includes('email-already-in-use')) {
        setError('Email already registered. Please login instead.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth (uses redirect flow)
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      // This will redirect to Google and back - no need to wait for response
      await signInWithGoogle();
      // If we get here, there was an error (redirect didn't happen)
      setError('Unable to start Google sign-in. Please try again.');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err?.message || 'Google sign-in failed. Please try again or use email/password.');
      setLoading(false);
    }
  };

  // Handle Login - with email and password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!formData.email || !formData.password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      const { user } = await signInUser(formData.email, formData.password);

      if (user) {
        const newUser = {
          id: user.uid,
          email: user.email || formData.email,
          name: user.displayName || formData.name || 'User',
          joinedDate: new Date().toISOString().split('T')[0]
        };
        
        setCurrentUser(newUser);
        onSuccess();
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('auth/invalid-credential')) {
        setError('Invalid email or password');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please check your email to confirm your account first.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setStep('form');
    setError('');
    setMessage('');
    // Keep email for login
    setFormData(prev => ({ ...prev, name: '', confirmPassword: '' }));
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(formData.email);
      setStep('reset-sent');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      if (err.message?.includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else {
        setError(err.message || 'Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo/Brand */}
      <div className="text-center mb-8">
        <h1 className="font-[var(--font-serif)] text-3xl text-[var(--charcoal)] mb-2">Grazelapparel</h1>
        <p className="text-gray-600 text-sm tracking-wide">Old Money Luxury Apparel</p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-lg p-6">
          
          {/* Signup Success Step */}
          {step === 'signup-success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Your account has been created successfully. Please login with your email and password.
              </p>
              <button
                onClick={switchToLogin}
                className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Go to Login
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Forgot Password Step */}
          {step === 'forgot-password' && (
            <div>
              <h2 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  <ArrowRight size={18} />
                </button>
              </form>

              <button
                onClick={switchToLogin}
                className="w-full text-sm text-gray-600 hover:text-[var(--crimson)] mt-4"
              >
                Back to Login
              </button>
            </div>
          )}

          {/* Reset Email Sent Step */}
          {step === 'reset-sent' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-green-600" size={32} />
              </div>
              <h2 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                We've sent a password reset link to <strong>{formData.email}</strong>. Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={switchToLogin}
                className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Back to Login
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* Form Step */}
          {step === 'form' && (
            <>
              {/* Tab Switch */}
              <div className="flex gap-2 mb-8 bg-gray-50 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setMessage('');
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    isLogin
                      ? 'bg-[var(--crimson)] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setMessage('');
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                  }}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    !isLogin
                      ? 'bg-[var(--crimson)] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Title */}
              <h2 className="font-[var(--font-serif)] text-2xl text-[var(--charcoal)] mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                {isLogin 
                  ? 'Sign in with your email and password' 
                  : 'Create your account to start shopping'}
              </p>

              {/* OAuth Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-[12px] font-semibold">G</span>
                  <span className="text-sm">Continue with Google</span>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-600">{message}</p>
                </div>
              )}

              {/* Login Form */}
              {isLogin && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('forgot-password')}
                      className="text-sm text-[var(--crimson)] hover:underline mt-2"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-6"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}

              {/* Sign Up Form */}
              {!isLogin && (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min 6 characters"
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--crimson)] text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[var(--crimson)] text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 mt-6"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                    <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Your personal shopping history and fit profile are saved securely
        </p>
      </div>
  );
}
