import React from "react";

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, helperText, required = false, children, className = "" }, ref) => {
    const isError = Boolean(error);

    return (
      <div ref={ref} className={`w-full space-y-1 ${className}`.trim()}>
        {label && (
          <label
            className={`block text-sm font-medium mb-2 ${
              isError ? "text-error" : "text-text-secondary"
            }`}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">{children}</div>

        {(error || helperText) && (
          <p className={`text-sm mt-1 ${isError ? "text-error" : "text-text-secondary"}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";
