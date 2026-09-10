import React from "react";

interface FormSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  isValid?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const FormSubmitButton = React.forwardRef<HTMLButtonElement, FormSubmitButtonProps>(
  (
    {
      isSubmitting = false,
      isValid = true,
      loadingText = "Enviando...",
      children,
      disabled = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = isSubmitting || disabled || !isValid;

    const baseClasses = `
      w-full px-4 py-2 rounded-md font-medium text-base
      transition-colors duration-base
      focus:outline-none focus:ring-2 focus:ring-offset-2
    `.trim();

    const stateClasses = isDisabled
      ? "bg-surface text-text-disabled cursor-not-allowed opacity-60"
      : "bg-primary text-white hover:bg-primary/90 focus:ring-primary/50 active:bg-primary/95";

    const finalClassName = `${baseClasses} ${stateClasses} ${className}`.trim();

    return (
      <button ref={ref} type="submit" disabled={isDisabled} className={finalClassName} {...props}>
        {isSubmitting ? loadingText : children}
      </button>
    );
  }
);

FormSubmitButton.displayName = "FormSubmitButton";
