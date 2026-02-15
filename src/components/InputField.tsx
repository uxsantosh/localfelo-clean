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
}: InputFieldProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-heading">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field"
        disabled={disabled}
      />
      {error && <p className="text-xs text-destructive m-0">{error}</p>}
    </div>
  );
}