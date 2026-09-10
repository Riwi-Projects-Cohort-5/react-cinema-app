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
        if (
          React.isValidElement<{
            label?: string;
            error?: string;
            helperText?: string;
            required?: boolean;
          }>(child)
        ) {
          return React.cloneElement(child, {
            label: label || child.props.label,
            error: error || child.props.error,
            helperText: helperText || child.props.helperText,
            required: required || child.props.required,
          });
        }
        return child;
      })}
    </div>
  );
};

FormField.displayName = "FormField";
