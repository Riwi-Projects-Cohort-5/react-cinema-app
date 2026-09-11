import React from "react";
import type { ZodType } from "zod";
import { useFormField } from "../composites/forms/useFormField";

type InputType =
  "text" | "email" | "password" | "number" | "tel" | "url" | "search" | "textarea" | "select";

type InputState = "idle" | "error" | "disabled";

interface SelectOption {
  value: string;
  label: string;
}

interface InputProps {
  // Variación y estado
  type?: InputType;
  state?: InputState;

  // Contenido y contexto
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;

  // Para selects
  options?: SelectOption[];
  selectPlaceholder?: string;

  // Para textarea
  rows?: number;

  // Validación
  fieldName?: string;
  fieldSchema?: ZodType<unknown>;
  error?: string;
  onBlurValidation?: (
    fieldName: string,
    value: unknown,
    fieldSchema: ZodType<unknown>
  ) => Promise<void>;

  // Para iconos
  icon?: {
    left?: React.ReactNode;
    right?: React.ReactNode;
  };

  // Funcionalidad estándar
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;

  // HTML nativo
  name?: string;
  id?: string;
  required?: boolean;

  // Personalización
  className?: string;
}

// ============================================================================
// CLASES POR ESTADO
// ============================================================================

const getStateClasses = (state: InputState): string => {
  const baseTransition = "transition-colors duration-base";

  const stateMap: Record<InputState, string> = {
    idle: `border-border text-text-primary focus:border-primary focus:ring-primary/50 ${baseTransition}`,
    error: `border-error text-error focus:border-error focus:ring-error/50 ${baseTransition}`,
    disabled: `opacity-40 cursor-not-allowed ${baseTransition}`,
  };

  return stateMap[state];
};

const getLabelClasses = (state: InputState): string => {
  const isError = state === "error";
  return `block text-sm font-medium mb-2 ${isError ? "text-error" : "text-text-secondary"}`;
};

const getBaseInputClasses = (state: InputState): string => {
  const isDisabled = state === "disabled";

  return `
    w-full px-4 py-2 rounded-md border-2 bg-[var(--color-surface)]
    font-secondary text-base
    focus:outline-none focus:ring-2 focus:ring-offset-2
    placeholder:text-text-disabled
    ${getStateClasses(state)}
    ${isDisabled ? "pointer-events-none" : ""}
  `.trim();
};

// ============================================================================
// COMPONENTES INTERNOS
// ============================================================================

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: Exclude<InputType, "textarea" | "select">;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, ...props }, ref) => <input ref={ref} className={className} {...props} />
);
TextInput.displayName = "TextInput";

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  rows?: number;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, rows = 4, ...props }, ref) => (
    <textarea ref={ref} className={className} rows={rows} {...props} />
  )
);
TextArea.displayName = "TextArea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  selectPlaceholder?: string;
}

const SelectInput = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, selectPlaceholder = "Selecciona una opción", ...props }, ref) => (
    <select ref={ref} className={className} {...props}>
      <option value="">{selectPlaceholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
);
SelectInput.displayName = "SelectInput";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  InputProps
>(
  (
    {
      type = "text",
      state = "idle",
      label,
      placeholder,
      helperText,
      errorMessage,
      options = [],
      selectPlaceholder,
      value,
      onChange,
      className = "",
      name,
      id,
      required = false,
      rows = 4,
      fieldName,
      fieldSchema,
      error,
      onBlurValidation,
      onBlur,
      icon,
    },
    ref
  ) => {
    const isError = state === "error";
    const isDisabled = state === "disabled";
    const inputId = id || name;
    const field = useFormField();
    const resolvedLabel = label ?? field.label;
    const resolvedError = error ?? field.error;
    const resolvedHelperText = helperText ?? field.helperText;
    const resolvedRequired = required || field.required; // ← AGREGAR ;
    const baseInputClasses = getBaseInputClasses(state);
    const finalInputClasses = `${baseInputClasses} ${className}`.trim();

    const commonProps = {
      id: inputId,
      name,
      value,
      onChange,
      disabled: isDisabled,
      required,
      placeholder,
      className: finalInputClasses,
    };

    // Renderizar el elemento correcto según el tipo
    const renderField = () => {
      const fieldContent = (
        <>
          {icon?.left && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              {icon.left}
            </span>
          )}

          {type === "textarea" ? (
            <TextArea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              rows={rows}
              {...commonProps}
              className={`${finalInputClasses} ${icon?.left ? "pl-10" : ""} ${
                icon?.right ? "pr-10" : ""
              }`}
              onBlur={(e) => {
                if (onBlur) {
                  onBlur(e);
                }
                if (onBlurValidation && fieldSchema && fieldName) {
                  onBlurValidation(fieldName, e.currentTarget.value, fieldSchema);
                }
              }}
            />
          ) : type === "select" ? (
            <SelectInput
              ref={ref as React.Ref<HTMLSelectElement>}
              options={options}
              selectPlaceholder={selectPlaceholder}
              {...commonProps}
              className={`${finalInputClasses} ${icon?.left ? "pl-10" : ""} ${
                icon?.right ? "pr-10" : ""
              }`}
              onBlur={(e) => {
                if (onBlur) {
                  onBlur(e);
                }
                if (onBlurValidation && fieldSchema && fieldName) {
                  onBlurValidation(fieldName, e.currentTarget.value, fieldSchema);
                }
              }}
            />
          ) : (
            <TextInput
              ref={ref as React.Ref<HTMLInputElement>}
              type={type}
              {...commonProps}
              className={`${finalInputClasses} ${icon?.left ? "pl-10" : ""} ${
                icon?.right ? "pr-10" : ""
              }`}
              onBlur={(e) => {
                if (onBlur) {
                  onBlur(e);
                }
                if (onBlurValidation && fieldSchema && fieldName) {
                  onBlurValidation(fieldName, e.currentTarget.value, fieldSchema);
                }
              }}
            />
          )}

          {icon?.right && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              {icon.right}
            </span>
          )}
        </>
      );

      return (
        <div className={`relative ${icon?.left || icon?.right ? "flex items-center" : ""}`}>
          {fieldContent}
        </div>
      );
    };

    // Determinar qué mensaje mostrar
    const displayMessage = resolvedError || (isError ? errorMessage : resolvedHelperText);
    const messageClassName = resolvedError || isError ? "text-error" : "text-text-secondary";

    return (
      <div className="w-full space-y-1">
        {resolvedLabel && (
          <label htmlFor={inputId} className={getLabelClasses(state)}>
            {resolvedLabel}
            {resolvedRequired && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">{renderField()}</div>

        {displayMessage && <p className={messageClassName}>{displayMessage}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
