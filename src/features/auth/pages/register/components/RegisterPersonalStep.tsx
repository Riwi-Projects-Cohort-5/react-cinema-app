import type { RegisterFieldProps } from "../interfaces/Register.interfaces";

const fieldClassName =
  "w-full rounded-md border border-border bg-surface-variant px-3 py-3 text-body text-text-primary placeholder:text-text-disabled outline-none transition duration-fast focus:border-primary focus:ring-2 focus:ring-primary/20";
import { FormField } from "@shared/components/composites/forms";

export const RegisterPersonalStep = ({
  form,
  errors,
  updateField,
  handleNameChange,
}: RegisterFieldProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField id="firstName" label="Nombre" error={errors.firstName} required>
        <input
          id="firstName"
          value={form.firstName}
          onChange={(event) => handleNameChange("firstName", event.target.value)}
          className={fieldClassName}
          placeholder="Juan"
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? "firstName-error" : undefined}
          autoComplete="given-name"
        />
      </FormField>
      <FormField id="lastName" label="Apellidos" error={errors.lastName} required>
        <input
          id="lastName"
          value={form.lastName}
          onChange={(event) => handleNameChange("lastName", event.target.value)}
          className={fieldClassName}
          placeholder="García"
          aria-invalid={Boolean(errors.lastName)}
          aria-describedby={errors.lastName ? "lastName-error" : undefined}
          autoComplete="family-name"
        />
      </FormField>
    </div>
    <FormField id="birthDate" label="Fecha de nacimiento" error={errors.birthDate} required>
      <input
        id="birthDate"
        type="date"
        value={form.birthDate}
        onChange={(event) => updateField("birthDate", event.target.value)}
        className={fieldClassName}
        aria-invalid={Boolean(errors.birthDate)}
        aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
      />
    </FormField>
    <FormField id="gender" label="Género" helperText="Opcional">
      <select
        id="gender"
        value={form.gender}
        onChange={(event) => updateField("gender", event.target.value)}
        className={fieldClassName}
      >
        <option value="">Prefiero no indicar</option>
        <option value="masculino">Masculino</option>
        <option value="femenino">Femenino</option>
        <option value="otro">Otro</option>
      </select>
    </FormField>
  </div>
);