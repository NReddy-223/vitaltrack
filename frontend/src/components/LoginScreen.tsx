import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiLogin, apiRegister } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

export default function LoginScreen() {
  const { login, setCurrentScreen, refreshFromApi } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const resetFields = () => {
    setEmail(''); setPassword(''); setConfirm(''); setFullName('');
    setError(null);
  };

  const switchMode = (next: 'login' | 'register') => {
    resetFields();
    setMode(next);
  };

  // ── validation ──────────────────────────────────────────────────────────────

  const validate = (): string | null => {
    if (!email.trim())    return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address';
    if (!password.trim()) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (mode === 'register') {
      if (!fullName.trim()) return 'Full name is required';
      if (password !== confirm) return 'Passwords do not match';
    }
    return null;
  };

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError(null);
    try {
      const res = mode === 'login'
        ? await apiLogin(email, password)
        : await apiRegister(email, password, fullName);

      login(res.access_token, res.user_id, res.full_name);
      await refreshFromApi();
      setCurrentScreen('dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-4 shadow-glow-teal">
            <Activity className="w-10 h-10 text-navy" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">VitalTrack</h1>
          <p className="text-text-secondary">Your daily health companion</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card p-6 space-y-5"
        >
          {/* Mode tabs */}
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-300 capitalize
                  ${mode === m
                    ? 'bg-gradient-primary text-navy'
                    : 'text-text-secondary hover:text-white'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Full name - register only */}
              {mode === 'register' && (
                <div>
                  <label className="label-text">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => { setFullName(e.target.value); setError(null); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Your full name"
                    className="input-field"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="label-text">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  onKeyDown={handleKeyDown}
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              {/* Password */}
              <div>
                <label className="label-text">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Min. 6 characters"
                  className="input-field"
                />
              </div>

              {/* Confirm password - register only */}
              {mode === 'register' && (
                <div>
                  <label className="label-text">
                    <Lock className="w-4 h-4" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(null); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Repeat password"
                    className="input-field"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="error-text"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="gradient-btn w-full text-lg flex items-center justify-center gap-2"
              >
                {loading
                  ? <><LoadingSpinner size="sm" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                  : mode === 'login' ? 'Sign In' : 'Create Account'
                }
              </button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
