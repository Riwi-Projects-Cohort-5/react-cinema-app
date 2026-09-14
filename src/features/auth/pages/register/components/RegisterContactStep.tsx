import type { RegisterFieldProps } from "../interfaces/Register.interfaces";
import { FormField } from "@shared/components/composites/forms";
import { Input } from "@shared/components/primitives";

export const RegisterContactStep = ({ form, errors, updateField }: RegisterFieldProps) => (
  <div className="space-y-4">
    <FormField id="email" label="Correo electrónico" error={errors.email} required>
      <Input
        id="email"
        type="email"
        value={form.email}
        onChange={(e) => updateField("email", e.currentTarget.value)}
        placeholder="tu@correo.com"
        error={errors.email}
        required
        name="email"
        autoComplete="email"
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? "email-error" : undefined}
      />
    </FormField>

    <FormField id="confirmEmail" label="Confirmar correo" error={errors.confirmEmail} required>
      <Input
        id="confirmEmail"
        type="email"
        value={form.confirmEmail}
        onChange={(e) => updateField("confirmEmail", e.currentTarget.value)}
        placeholder="Repite tu correo"
        error={errors.confirmEmail}
        required
        name="confirmEmail"
        autoComplete="email"
        aria-invalid={Boolean(errors.confirmEmail)}
        aria-describedby={errors.confirmEmail ? "confirmEmail-error" : undefined}
      />
    </FormField>

    <FormField id="phone" label="Celular" error={errors.phone} required>
      <Input
        id="phone"
        type="tel"
        value={form.phone}
        onChange={(e) => updateField("phone", e.currentTarget.value)}
        placeholder="3001234567"
        error={errors.phone}
        required
        name="phone"
        autoComplete="tel"
        aria-invalid={Boolean(errors.phone)}
        aria-describedby={errors.phone ? "phone-error" : undefined}
        icon={{ left: <span className="text-text-primary">+57</span> }}
      />
    </FormField>
  </div>
);