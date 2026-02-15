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
    <div className="space-y-1">
      {label && (
        <label className="block text-heading">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="textarea-field"
        disabled={disabled}
      />
      {showCharCount && maxLength && (
        <p className="text-xs text-muted m-0 text-right">
          {value.length} / {maxLength}
        </p>
      )}
      {error && <p className="text-xs text-destructive m-0">{error}</p>}
    </div>
  );
}