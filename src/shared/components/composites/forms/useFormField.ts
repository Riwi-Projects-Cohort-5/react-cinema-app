import { createContext, useContext } from "react";

export interface FormFieldContextValue {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue>({});

export const useFormField = () => useContext(FormFieldContext);

export { FormFieldContext };
