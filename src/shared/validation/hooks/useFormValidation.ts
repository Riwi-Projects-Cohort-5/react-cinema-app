import { useState } from "react";
import type { ZodType, ZodError } from "zod";

interface UseFormValidationReturn<T> {
  errors: Record<string, string>;
  isSubmitting: boolean;
  validateField: (
    fieldName: string,
    value: unknown,
    fieldSchema: ZodType<unknown>
  ) => Promise<boolean>;
  validateForm: (data: T) => Promise<boolean>;
  clearErrors: () => void;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function useFormValidation<T>(schema: ZodType<unknown>): UseFormValidationReturn<T> {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = async (
    fieldName: string,
    value: unknown,
    fieldSchema: ZodType<unknown>
  ): Promise<boolean> => {
    try {
      await fieldSchema.parseAsync(value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    } catch (error) {
      const zodError = error as ZodError;
      const issues = zodError.issues;

      if (issues && issues.length > 0) {
        const firstIssue = issues[0];

        if (firstIssue) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: firstIssue.message,
          }));
        }
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
    } catch (error) {
      const newErrors: Record<string, string> = {};
      if (error instanceof Error && "issues" in error) {
        const zodError = error as ZodError;
        if (zodError.issues) {
          zodError.issues.forEach((err) => {
            const fieldKey = String(err.path[0]);
            newErrors[fieldKey] = err.message;
          });
        }
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
