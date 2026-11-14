import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';

const demoAccounts = [
  {
    username: 'alex_tech',
    name: 'Alex Rivera',
    role: 'Full Stack',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  },
  {
    username: 'maya_designer',
    name: 'Maya Lin',
    role: 'UI Designer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    username: 'dev_sam',
    name: 'Sam Patel',
    role: 'Backend Dev',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
];

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Sign In | ConnectSphere';
  }, []);

  const validateForm = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Email or username is required';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await login(identifier.trim(), password);
      if (result.success) {
        showToast('Welcome back to ConnectSphere!', 'success');
        navigate('/');
      } else {
        setErrors({ form: result.message || 'Invalid credentials' });
        showToast(result.message || 'Invalid credentials', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrors({ form: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (username) => {
    setIdentifier(username);
    setPassword('password123');
    setErrors({});
  };

  const showDemoChips = import.meta.env.VITE_SHOW_DEMO !== 'false';

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue exploring your sphere."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium animate-in fade-in duration-150">
            {errors.form}
          </div>
        )}

        <Input
          label="Email or username"
          id="identifier"
          name="identifier"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: null }));
          }}
          placeholder="e.g. alex_tech or alex@example.com"
          icon={User}
          error={errors.identifier}
          required
        />

        <Input
          label="Password"
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
          }}
          placeholder="Enter your password"
          icon={Lock}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full mt-2"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      {/* Demo Account Chips */}
      {showDemoChips && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 mb-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Try a demo account:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                type="button"
                onClick={() => handleSelectDemo(account.username)}
                className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all group"
              >
                <Avatar
                  src={account.avatar}
                  name={account.name}
                  size="xs"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {account.username}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {account.role}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Switch to Register */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account yet?{' '}
        <Link
          to="/register"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
