 import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { AppleLogo, ArrowRight, Eye, EyeSlash, GoogleLogo } from "@phosphor-icons/react";
import { Link } from "react-router";

import Button from "@shared/components/primitives/Button";
import { Checkbox } from "@shared/components/primitives/checkbox/Checkbox";
import Input from "@shared/components/primitives/Input";
import { useFormValidation } from "@shared/validation/hooks/useFormValidation";
import {
  emailSchema,
  loginSchema,
  passwordBasicSchema,
  type LoginFormData,
} from "@shared/validation/schemas/authSchemas";

import { PATHS } from "@routes/paths";

type LoginInputChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void | Promise<void>;
  isSubmitting?: boolean;
  isLocked?: boolean;
  feedbackMessage?: string | null;
}

const EMPTY_FORM: LoginFormData = { email: "", password: "" };

export function LoginForm({
  onSubmit,
  isSubmitting = false,
  isLocked = false,
  feedbackMessage,
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
 
  const [rememberMe, setRememberMe] = useState(false);
  const { errors, validateField, validateForm } = useFormValidation<LoginFormData>(loginSchema);

  const handleBlurValidation = async (
    fieldName: string,
    value: unknown,
    fieldSchema: Parameters<typeof validateField>[2],
  ) => {
    await validateField(fieldName, value, fieldSchema);
  };

  const handleChange = (field: keyof LoginFormData) => (event: LoginInputChangeEvent) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isLocked || isSubmitting) return;

    const trimmed: LoginFormData = {
      email: formData.email.trim(),
      password: formData.password.trim(),
    };

    const isValid = await validateForm(trimmed);
    if (!isValid) return;

    await onSubmit(trimmed);
  };

  const busy = isSubmitting || isLocked;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        type="email"
        label="Correo electrónico"
        name="email"
        placeholder="tu@correo.com"
        value={formData.email}
        onChange={handleChange("email")}
        state={errors.email ? "error" : "idle"}
        error={errors.email}
        fieldName="email"
        fieldSchema={emailSchema}
        onBlurValidation={handleBlurValidation}
        required
      />

      <Input
        type={showPassword ? "text" : "password"}
        label="Contraseña"
        name="password"
        placeholder="********"
        value={formData.password}
        onChange={handleChange("password")}
        state={errors.password ? "error" : "idle"}
        error={errors.password}
        fieldName="password"
        fieldSchema={passwordBasicSchema}
        onBlurValidation={handleBlurValidation}
        icon={{
          right: (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="pointer-events-auto text-text-secondary"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          ),
        }}
        required
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
          <Checkbox
            checked={rememberMe}
            onChange={setRememberMe}
            ariaLabel="Recordarme en este dispositivo"
          />
          Recordarme
        </label>

        <Link to={PATHS.auth.forgotPassword} className="text-xs text-accent font-medium p-3-60">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {feedbackMessage && <p className="text-sm text-error">{feedbackMessage}</p>}

      <Button
        type="submit"
        variant="primary"
        size="md"
        radius="md"
        className="w-full gap-2 text-sm"
        state={busy ? "loading" : "default"}
      >
        Iniciar sesión
        <ArrowRight size={18} weight="bold" />
      </Button>

      <div className="my-2 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-secondary">o continúa con</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 md border border-border bg-black py-2 text-sm text-text-primary"
        >
          <GoogleLogo size={18} weight="bold" className="text-[#4285F4]" />
          Google
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 md bg-black py-2 text-sm text-white"
        >
          <AppleLogo size={18} weight="bold" className="text-white" />
          Apple
        </button>
      </div>
    </form>
  );
}
