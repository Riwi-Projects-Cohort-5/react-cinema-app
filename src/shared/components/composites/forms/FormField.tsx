import React from "react";

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required = false,
  children,
  className = "",
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            label: label || (child.props as any).label,
            error: error || (child.props as any).error,
            helperText: helperText || (child.props as any).helperText,
            required: required || (child.props as any).required,
          } as any);
        }
        return child;
      })}
    </div>
  );
};

FormField.displayName = "FormField";
