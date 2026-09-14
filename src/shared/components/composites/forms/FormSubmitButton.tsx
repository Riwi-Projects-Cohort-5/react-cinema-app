import React from "react";
import Button from "@/shared/components/primitives/Button";

interface FormSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  isValid?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const FormSubmitButton = React.forwardRef<HTMLButtonElement, FormSubmitButtonProps>(
  ({
    isSubmitting = false,
    isValid = true,
    loadingText = "Enviando...",
    children,
    disabled = false,
    className = "",
    ...props
  }) => {
    const isDisabled = isSubmitting || disabled || !isValid;

    return (
      <Button
        type="submit"
        variant="primary"
        size="md"
        state={isSubmitting ? "loading" : isDisabled ? "disabled" : "default"}
        disabled={isDisabled}
        className={className}
        {...props}
      >
        {isSubmitting ? loadingText : children}
      </Button>
    );
  }
);

FormSubmitButton.displayName = "FormSubmitButton";
