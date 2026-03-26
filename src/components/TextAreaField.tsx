import React from 'react';

interface TextAreaFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  rows?: number;
  maxLength?: number;
  showCharCount?: boolean;
  disabled?: boolean;
}

export function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  error,
  rows = 4,
  maxLength,
  showCharCount = false,
  disabled = false,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-black">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-black placeholder-gray-400 transition-all focus:outline-none resize-none ${
          error 
            ? 'border-red-300 focus:border-red-500' 
            : 'border-gray-200 focus:border-[#CDFF00]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
      />
      {showCharCount && maxLength && (
        <p className="text-xs text-gray-500 text-right">
          {value.length} / {maxLength}
        </p>
      )}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
