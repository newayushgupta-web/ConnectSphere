import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../components/auth/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    document.title = 'Reset Password | ConnectSphere';
  }, []);

  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const strength = calculateStrength(password);

  const validateForm = () => {
    const errs = {};
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
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
      const res = await resetPassword(token, password);
      if (res.success) {
        setIsSuccess(true);
        showToast('Password updated successfully! Redirecting...', 'success');
      } else {
        if (res.message && res.message.toLowerCase().includes('expired')) {
          setIsExpired(true);
        } else {
          setErrors({ form: res.message || 'Failed to reset password.' });
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Password reset failed.';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setIsExpired(true);
      } else {
        setErrors({ form: msg });
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isSuccess ? 'Password Reset Complete' : isExpired ? 'Link Expired' : 'Set New Password'}
      subtitle={
        isSuccess
          ? 'Your password has been changed securely.'
          : isExpired
          ? 'This password reset link is invalid or has expired.'
          : 'Please choose a strong password for your ConnectSphere account.'
      }
    >
      {isSuccess ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                You&apos;re all set!
              </p>
              <p className="mt-0.5">
                Your password has been updated. You will be redirected to the sign in page in {countdown} seconds.
              </p>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
          >
            <span>Sign In Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : isExpired ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Link is no longer valid
              </p>
              <p className="mt-0.5">
                Password reset links are single-use and expire after 15 minutes for your security. Please request a new link.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              to="/forgot-password"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Request New Link</span>
            </Link>

            <Link
              to="/login"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 font-medium animate-in fade-in duration-150">
              {errors.form}
            </div>
          )}

          <div>
            <Input
              label="New password"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="At least 6 characters"
              icon={Lock}
              error={errors.password}
              required
            />

            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                  <span>Strength:</span>
                  <span className="font-bold">{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full transition-all duration-300 ${
                        step <= strength.score ? strength.color : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm new password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }}
            placeholder="Re-enter your new password"
            icon={Lock}
            error={errors.confirmPassword}
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
            Reset Password
          </Button>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
