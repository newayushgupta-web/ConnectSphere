import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, FileText, ArrowRight, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

// Password strength calculation
const calculateStrength = (pass = '') => {
  if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 10) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    case 2:
      return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    case 3:
      return { score: 3, label: 'Good', color: 'bg-sky-500' };
    case 4:
      return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
    default:
      return { score: 0, label: '', color: 'bg-slate-200' };
  }
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account | ConnectSphere';
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const strength = calculateStrength(formData.password);
  const passwordsMatch =
    formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  const validateForm = () => {
    const errs = {};
    if (!formData.username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username.trim())) {
      errs.username = 'Username must be 3-30 letters, numbers, or underscores';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
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
      const result = await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        bio: formData.bio.trim(),
      });

      if (result.success) {
        showToast('Account created successfully! Welcome to ConnectSphere.', 'success');
        navigate('/');
      } else {
        setErrors({ form: result.message || 'Registration failed' });
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrors({ form: msg });
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join ConnectSphere to start sharing stories and connecting with creators."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {errors.form}
          </div>
        )}

        {/* Username */}
        <Input
          label="Username"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="e.g. tech_explorer"
          icon={User}
          error={errors.username}
          helperText="3 to 30 characters (letters, numbers, underscores)"
          required
        />

        {/* Email */}
        <Input
          label="Email address"
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email}
          required
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
            icon={Lock}
            error={errors.password}
            required
          />

          {/* Password Strength Meter */}
          {formData.password && (
            <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Password strength:
                </span>
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  {strength.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <Input
            label="Confirm password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            icon={Lock}
            error={errors.confirmPassword}
            required
          />
          {formData.confirmPassword && (
            <div className="mt-1 text-[11px] flex items-center gap-1 font-medium">
              {passwordsMatch ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </span>
              ) : passwordsMismatch ? (
                <span className="text-rose-500 dark:text-rose-400 flex items-center gap-1">
                  <X className="w-3 h-3" /> Passwords do not match
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Bio (Optional) */}
        <div className="space-y-1.5">
          <label
            htmlFor="bio"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 select-none flex items-center justify-between"
          >
            <span>Bio (optional)</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {formData.bio.length}/160
            </span>
          </label>
          <div className="relative">
            <textarea
              id="bio"
              name="bio"
              rows={2}
              maxLength={160}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others a little about what you build or create..."
              className="w-full text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full mt-2"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Sign in instead
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
