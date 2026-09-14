import { FormField } from "@shared/components/composites/forms";
import { Input, Checkbox, CheckboxRobot } from "@shared/components/primitives";

import type { RegisterFieldProps } from "../interfaces/Register.interfaces";

export const RegisterPreferencesStep = ({ form, errors, updateField }: RegisterFieldProps) => (
  <div className="space-y-4">
    <FormField id="city" label="Ciudad principal" error={errors.city} required>
      <Input
        id="city"
        type="select"
        value={form.city}
        onChange={(e) => updateField("city", e.currentTarget.value)}
        options={[
          { value: "", label: "Selecciona tu ciudad" },
          { value: "bogota", label: "Bogotá" },
          { value: "medellin", label: "Medellín" },
          { value: "cali", label: "Cali" },
          { value: "barranquilla", label: "Barranquilla" },
        ]}
        error={errors.city}
        required
        name="city"
      />
    </FormField>
    <div className="rounded-md border border-border bg-surface-variant p-3 text-body text-text-secondary">
      <label className="flex items-start gap-3 py-2">
        <Checkbox
          checked={form.consentPersonal}
          onChange={(checked) => updateField("consentPersonal", checked)}
          ariaLabelledBy="consentPersonal-label"
        />
        <span id="consentPersonal-label">Acepto el tratamiento de datos personales ver política<span className="text-error">*</span></span>
      </label>
      {errors.consentPersonal && <p id="consentPersonal-error" className="text-caption text-error" role="alert">{errors.consentPersonal}</p>}
      <label className="flex items-start gap-3 py-2">
        <Checkbox
          checked={form.consentTerms}
          onChange={(checked) => updateField("consentTerms", checked)}
          ariaLabelledBy="consentTerms-label"
        />
        <span id="consentTerms-label">Acepto los términos y condiciones ver política<span className="text-error">*</span></span>
      </label>
      {errors.consentTerms && <p id="consentTerms-error" className="text-caption text-error" role="alert">{errors.consentTerms}</p>}
      <label className="flex items-start gap-3 py-2">
        <Checkbox
          checked={form.marketing}
          onChange={(checked) => updateField("marketing", checked)}
        />
        <span>Quiero recibir promociones y novedades por correo</span>
      </label>
    </div>
    <div className="rounded-md border border-border bg-surface-variant p-3">
      <label className="flex items-center justify-between gap-3 text-body text-text-secondary">
        <span className="flex items-center gap-3">
          <CheckboxRobot
            checked={form.acceptTerms}
            onChange={(checked) => updateField("acceptTerms", checked)}
            ariaLabelledBy="acceptTerms-label"
          />
          <span id="acceptTerms-label">No soy un robot</span>
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