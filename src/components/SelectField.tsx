import React, { ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options?: SelectOption[];
  children?: ReactNode;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  selectedId?: string;
  target?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  children,
  placeholder = 'Select an option',
  required = false,
  error,
  disabled = false,
}: SelectFieldProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-heading">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-field"
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {children || options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive m-0">{error}</p>}
    </div>
  );
}