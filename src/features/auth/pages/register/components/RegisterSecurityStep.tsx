import type { RegisterFieldProps } from "../interfaces/Register.interfaces";
import { FormField, FormInput } from "@shared/components/composites/forms";

export const RegisterSecurityStep = ({ form, errors, updateField }: RegisterFieldProps) => (
  <div className="space-y-4">
    <FormField id="password" label="Contraseña" error={errors.password} required>
      <FormInput
        id="password"
        type="password"
        value={form.password}
        onChange={(e) => updateField("password", e.currentTarget.value)}
        placeholder="Mínimo 10 caracteres"
        error={errors.password}
        required
        name="password"
        autoComplete="new-password"
      />
    </FormField>
    <FormField
      id="confirmPassword"
      label="Confirmar contraseña"
      error={errors.confirmPassword}
      required
    >
      <FormInput
        id="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={(e) => updateField("confirmPassword", e.currentTarget.value)}
        placeholder="Repite tu contraseña"
        error={errors.confirmPassword}
        required
        name="confirmPassword"
        autoComplete="new-password"
      />
    </FormField>
  </div>
);
