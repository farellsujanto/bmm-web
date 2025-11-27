import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function PrimaryInput({ 
  label, 
  error, 
  helperText,
  className = '', 
  ...props 
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? 'border-red-500 focus:border-red-600 focus:ring-red-600' 
            : 'border-gray-300 focus:border-red-600 focus:ring-red-600'
        } focus:ring-2 focus:outline-none transition text-gray-900 placeholder:text-gray-500 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-700 mt-1">{helperText}</p>
      )}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function PrimaryTextArea({ 
  label, 
  error, 
  helperText,
  className = '', 
  ...props 
}: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? 'border-red-500 focus:border-red-600 focus:ring-red-600' 
            : 'border-gray-300 focus:border-red-600 focus:ring-red-600'
        } focus:ring-2 focus:outline-none transition text-gray-900 placeholder:text-gray-500 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-700 mt-1">{helperText}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
}

export function PrimarySelect({ 
  label, 
  error, 
  helperText,
  options,
  className = '', 
  ...props 
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? 'border-red-500 focus:border-red-600 focus:ring-red-600' 
            : 'border-gray-300 focus:border-red-600 focus:ring-red-600'
        } focus:ring-2 focus:outline-none transition text-gray-900 bg-white ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-700 mt-1">{helperText}</p>
      )}
    </div>
  );
}
