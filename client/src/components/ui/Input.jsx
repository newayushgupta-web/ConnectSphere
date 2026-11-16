import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(
  (
    {
      label,
      labelRight,
      type = 'text',
      id,
      name,
      value,
      onChange,
      placeholder,
      error,
      helperText,
      icon: Icon,
      required = false,
      disabled = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`w-full flex flex-col space-y-1.5 ${className}`}>
        {(label || labelRight) && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 select-none flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-rose-500 ml-1" aria-hidden="true">*</span>}
            </span>
            {labelRight && <div>{labelRight}</div>}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-500 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={computedType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`w-full text-sm rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 py-2.5 sm:py-3 ${
              Icon ? 'pl-10' : 'pl-4'
            } ${isPassword ? 'pr-11' : 'pr-4'} ${
              error
                ? 'border-rose-400 dark:border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100'
            } placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-950 focus:outline-none`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>

        {error ? (
          <p
            id={`${inputId}-error`}
            className="text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-150"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-slate-500 dark:text-slate-400 mt-1"
          >
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
