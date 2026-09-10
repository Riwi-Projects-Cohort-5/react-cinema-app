import { useFormValidation } from "@/shared/validation";
import React, { useState, useCallback } from "react";
import type { ZodType } from "zod";

export interface FormContextValue<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  setFieldValue: (fieldName: string, value: unknown) => void; // ← string
  setFieldError: (fieldName: string, error: string) => void; // ← string
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  register: (
    fieldName: string,
    fieldSchema: ZodType<unknown>
  ) => {
    name: string;
    value: unknown;
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    onBlur: (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => Promise<void>;
  };
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
  const { errors, isSubmitting, validateField, validateForm, setErrors, clearErrors } =
    useFormValidation(schema);

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

  // Manejar envío del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearErrors();

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
    },
    [values, validateForm, onSubmit, setErrors, clearErrors]
  );

  // Registrar un campo (retorna props para Input)
  const register = useCallback(
    (fieldName: string, fieldSchema: ZodType<unknown>) => ({
      name: fieldName,
      value: values[fieldName] ?? "",
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        setFieldValue(fieldName, e.target.value);
      },
      onBlur: async (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => {
        const currentValue = e.target.value;
        await validateField(fieldName, currentValue, fieldSchema);
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

// ============================================================================
// EXPORTACIÓN CON TIPADO GENÉRICO
// ============================================================================

export const FormWrapper = React.forwardRef(FormWrapperInner) as <T>(
  props: FormWrapperProps<T> & { ref?: React.ForwardedRef<HTMLFormElement> }
) => React.ReactElement;

(FormWrapper as { displayName?: string }).displayName = "FormWrapper";
