import React from "react";
import { FormFieldContext, type FormFieldContextValue } from "./useFormField";

interface FormFieldProps extends FormFieldContextValue {
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
}) => (
  <FormFieldContext.Provider value={{ label, error, helperText, required }}>
    <div className={className}>{children}</div>
  </FormFieldContext.Provider>
);

FormField.displayName = "FormField";
