import { FormField } from "@shared/components/composites/forms";

import type { RegisterFieldProps } from "../interfaces/Register.interfaces";

const fieldClassName =
  "w-full rounded-md border border-border bg-surface-variant px-3 py-3 text-body text-text-primary placeholder:text-text-disabled outline-none transition duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20";

export const RegisterPreferencesStep = ({ form, errors, updateField }: RegisterFieldProps) => (
  <div className="space-y-4">
    <FormField id="city" label="Ciudad principal" error={errors.city} required>
      <select
        id="city"
        value={form.city}
        onChange={(event) => updateField("city", event.target.value)}
        className={fieldClassName}
        aria-invalid={Boolean(errors.city)}
        aria-describedby={errors.city ? "city-error" : undefined}
      >
        <option value="">Selecciona tu ciudad</option>
        <option value="bogota">Bogotá</option>
        <option value="medellin">Medellín</option>
        <option value="cali">Cali</option>
        <option value="barranquilla">Barranquilla</option>
      </select>
    </FormField>
    <div className="rounded-md border border-border bg-surface-variant p-3 text-body text-text-secondary">
      <label className="flex items-start gap-3 py-2">
        <input
          id="consentPersonal"
          type="checkbox"
          checked={form.consentPersonal}
          onChange={(event) => updateField("consentPersonal", event.target.checked)}
          className="mt-1 h-4 w-4 accent-primary"
          aria-invalid={Boolean(errors.consentPersonal)}
          aria-describedby={errors.consentPersonal ? "consentPersonal-error" : undefined}
        />
        <span>Acepto el tratamiento de datos personales ver política<span className="text-error">*</span></span>
      </label>
      {errors.consentPersonal && <p id="consentPersonal-error" className="text-caption text-error" role="alert">{errors.consentPersonal}</p>}
      <label className="flex items-start gap-3 py-2">
        <input
          id="consentTerms"
          type="checkbox"
          checked={form.consentTerms}
          onChange={(event) => updateField("consentTerms", event.target.checked)}
          className="mt-1 h-4 w-4 accent-primary"
          aria-invalid={Boolean(errors.consentTerms)}
          aria-describedby={errors.consentTerms ? "consentTerms-error" : undefined}
        />
        <span>Acepto los términos y condiciones ver política<span className="text-error">*</span></span>
      </label>
      {errors.consentTerms && <p id="consentTerms-error" className="text-caption text-error" role="alert">{errors.consentTerms}</p>}
      <label className="flex items-start gap-3 py-2">
        <input
          id="marketing"
          type="checkbox"
          checked={form.marketing}
          onChange={(event) => updateField("marketing", event.target.checked)}
          className="mt-1 h-4 w-4 accent-primary"
        />
        <span>Quiero recibir promociones y novedades por correo</span>
      </label>
    </div>
    <div className="rounded-md border border-border bg-surface-variant p-3">
      <label className="flex items-center justify-between gap-3 text-body text-text-secondary">
        <span className="flex items-center gap-3">
          <input
            id="acceptTerms"
            type="checkbox"
            checked={form.acceptTerms}
            onChange={(event) => updateField("acceptTerms", event.target.checked)}
            className="h-4 w-4 accent-primary"
            aria-invalid={Boolean(errors.acceptTerms)}
            aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
          />
          <span>No soy un robot</span>
        </span>
        <span className="flex items-center gap-1 rounded-sm border border-border bg-background px-2 py-1 text-overline uppercase text-text-secondary">
          <span className="inline-block h-3 w-3 rounded-xs bg-primary" />
          <span className="inline-block h-3 w-3 rounded-xs bg-warning" />
          <span className="inline-block h-3 w-3 rounded-xs bg-success" />
        </span>
      </label>
      {errors.acceptTerms && <p id="acceptTerms-error" className="text-caption text-error" role="alert">{errors.acceptTerms}</p>}
    </div>
  </div>
);