import React from "react";

import Input, { type InputProps } from "@/shared/components/primitives/Input/Input";
import { useFormField } from "./useFormField";

export const FormInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputProps
>((props, ref) => {
  const field = useFormField();

  const resolvedLabel = props.label ?? field.label;
  const resolvedError = props.error ?? field.error;
  const resolvedHelperText = props.helperText ?? field.helperText;
  const resolvedRequired = props.required ?? field.required ?? false;

  return (
    <Input
      {...props}
      ref={ref}
      label={resolvedLabel}
      error={resolvedError}
      helperText={resolvedHelperText}
      required={resolvedRequired}
      showLabel={false}
      showMessage={false}
    />
  );
});

FormInput.displayName = "FormInput";
