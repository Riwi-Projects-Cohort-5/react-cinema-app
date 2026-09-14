import React from "react";
import { FormFieldContext, type FormFieldContextValue } from "./useFormField";

interface FormFieldProps extends FormFieldContextValue {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  children,
  id,
  className = "",
}) => (
  <FormFieldContext.Provider value={{ label, error, helperText, required }}>
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-overline font-medium uppercase text-text-secondary"
        >
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && <p className="mt-1 text-caption text-text-secondary">{helperText}</p>}
      {error && (
        <p id={id ? `${id}-error` : undefined} className="mt-1 text-caption text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  </FormFieldContext.Provider>
);

FormField.displayName = "FormField";
