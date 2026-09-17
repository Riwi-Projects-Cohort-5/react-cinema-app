import { useFormValidation } from "@/shared/validation";
import React, { useState, useCallback } from "react";
import type { ZodType } from "zod";

export interface FormContextValue<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  setFieldValue: (fieldName: string, value: unknown) => void;
  setFieldError: (fieldName: string, error: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  register: (
    fieldName: string,
    fieldSchema: ZodType<unknown>
  ) => React.InputHTMLAttributes<HTMLInputElement>;
}

interface FormWrapperProps<T> {
  schema: ZodType<unknown>;
  onSubmit: (data: T) => Promise<void> | void;
  initialValues?: Partial<T>;
  children: (context: FormContextValue<T>) => React.ReactNode;
  className?: string;
}

function FormWrapperInner<T>(
  { schema, onSubmit, initialValues = {}, children, className = "" }: FormWrapperProps<T>,
  ref: React.ForwardedRef<HTMLFormElement>
) {
  const { errors, validateField, validateForm, setErrors, clearErrors } = useFormValidation(schema);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [values, setValues] = useState<Record<string, unknown>>(
    initialValues as Record<string, unknown>
  );

  // Actualizar valor de un campo
  const setFieldValue = useCallback((fieldName: string, value: unknown) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  // Establecer error manual en un campo
  const setFieldError = useCallback(
    (fieldName: string, error: string) => {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    [setErrors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearErrors();
      setIsSubmitting(true);

      try {
        const isValid = await validateForm(values as unknown);

        if (isValid) {
          try {
            await onSubmit(values as unknown as T);
          } catch (error) {
            console.error("Error al enviar formulario:", error);
            if (error instanceof Error) {
              setErrors((prev) => ({
                ...prev,
                _form: error.message || "Error al enviar el formulario",
              }));
            }
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit, setErrors, clearErrors]
  );

  const register = useCallback(
    (fieldName: string, fieldSchema: ZodType<unknown>) => ({
      name: fieldName,
      value: (values[fieldName] ?? "") as string | number | readonly string[] | undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(fieldName, e.target.value);
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        const currentValue = e.target.value;
        void validateField(fieldName, currentValue, fieldSchema);
      },
    }),
    [values, setFieldValue, validateField]
  );

  const context: FormContextValue<T> = {
    values: values as T,
    errors,
    isSubmitting,
    setFieldValue,
    setFieldError,
    handleSubmit,
    register,
  };

  return (
    <form ref={ref} onSubmit={handleSubmit} className={className} noValidate>
      {children(context)}
    </form>
  );
}

export const FormWrapper = React.forwardRef(FormWrapperInner) as <T>(
  props: FormWrapperProps<T> & { ref?: React.ForwardedRef<HTMLFormElement> }
) => React.ReactElement;

(FormWrapper as { displayName?: string }).displayName = "FormWrapper";
