import { useState } from "react";
import type { ZodType } from "zod";

interface UseFormValidationReturn<T> {
  errors: Record<string, string>;
  isSubmitting: boolean;
  validateField: (fieldName: string, value: any, fieldSchema: ZodType) => Promise<boolean>;
  validateForm: (data: T) => Promise<boolean>;
  clearErrors: () => void;
  setErrors: (errors: Record<string, string>) => void;
}

export function useFormValidation<T>(schema: ZodType): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = async (
    fieldName: string,
    value: any,
    fieldSchema: ZodType
  ): Promise<boolean> => {
    try {
      await fieldSchema.parseAsync(value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error: any) {
      if (error.issues?.[0]) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: error.issues[0].message,
        }));
      }
      return false;
    }
  };

  const validateForm = async (data: T): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await schema.parseAsync(data);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message;
        });
      }
      setErrors(newErrors);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearErrors = () => setErrors({});

  return {
    errors,
    isSubmitting,
    validateField,
    validateForm,
    clearErrors,
    setErrors,
  };
}
