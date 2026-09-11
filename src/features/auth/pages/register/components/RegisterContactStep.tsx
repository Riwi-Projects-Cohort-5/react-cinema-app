import type { RegisterFieldProps } from "../interfaces/Register.interfaces";

const fieldClassName =
  "w-full rounded-md border border-border bg-surface-variant px-3 py-3 text-body text-text-primary placeholder:text-text-disabled outline-none transition duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20";
import { FormField } from "@shared/components/composites/forms";

export const RegisterContactStep = ({ form, errors, updateField }: RegisterFieldProps) => (
  <div className="space-y-4">
    <FormField id="email" label="Correo electrónico" error={errors.email} required>
      <input
        id="email"
        type="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        className={fieldClassName}
        placeholder="tu@correo.com"
        aria-invalid={Boolean(errors.email)}
        aria-describedby={errors.email ? "email-error" : undefined}
        autoComplete="email"
      />
    </FormField>
    <FormField id="phone" label="Celular" error={errors.phone} required>
      <div className="flex gap-2">
        <div aria-hidden="true" className="flex min-h-11 w-20 items-center rounded-md border border-border bg-surface-variant px-3 text-body text-text-primary">
          +57
        </div>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          className={`${fieldClassName} flex-1`}
          placeholder="3001234567"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          autoComplete="tel"
        />
      </div>
    </FormField>
  </div>
);