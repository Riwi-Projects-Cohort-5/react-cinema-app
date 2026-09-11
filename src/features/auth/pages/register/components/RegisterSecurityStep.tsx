import type { RegisterFieldProps } from "../interfaces/Register.interfaces";

const fieldClassName =
  "w-full rounded-md border border-border bg-surface-variant px-3 py-3 text-body text-text-primary placeholder:text-text-disabled outline-none transition duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20";
import { FormField } from "@shared/components/composites/forms";

export const RegisterSecurityStep = ({ form, errors, updateField }: RegisterFieldProps) => (
  <div className="space-y-4">
    <FormField id="password" label="Contraseña" error={errors.password} required>
      <input
        id="password"
        type="password"
        value={form.password}
        onChange={(event) => updateField("password", event.target.value)}
        className={fieldClassName}
        placeholder="Mínimo 10 caracteres"
        aria-invalid={Boolean(errors.password)}
        aria-describedby={errors.password ? "password-error" : undefined}
        autoComplete="new-password"
      />
    </FormField>
    <FormField id="confirmPassword" label="Confirmar contraseña" error={errors.confirmPassword} required>
      <input
        id="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={(event) => updateField("confirmPassword", event.target.value)}
        className={fieldClassName}
        placeholder="Repite tu contraseña"
        aria-invalid={Boolean(errors.confirmPassword)}
        aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
        autoComplete="new-password"
      />
    </FormField>
  </div>
);