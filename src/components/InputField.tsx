import React from 'react';

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'tel' | 'email' | 'password' | 'url';
  required?: boolean;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  disabled = false,
  maxLength,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-black">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 bg-white border-2 rounded-xl text-black placeholder-gray-400 transition-all focus:outline-none ${
          error 
            ? 'border-red-300 focus:border-red-500' 
            : 'border-gray-200 focus:border-[#CDFF00]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={disabled}
        maxLength={maxLength}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
