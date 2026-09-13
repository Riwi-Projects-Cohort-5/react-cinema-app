import type { RegisterFieldProps } from "../interfaces/Register.interfaces";
import { FormField } from "@shared/components/composites/forms";
import { Input } from "@shared/components/primitives";

export const RegisterPersonalStep = ({
  form,
  errors,
  updateField,
  handleNameChange,
}: RegisterFieldProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <FormField id="firstName" label="Nombre" error={errors.firstName} required>
        <Input
          id="firstName"
          value={form.firstName}
          onChange={(e) => handleNameChange("firstName", e.currentTarget.value)}
          placeholder="Juan"
          error={errors.firstName}
          required
          name="firstName"
          autoComplete="given-name"
        />
      </FormField>
      <FormField id="lastName" label="Apellidos" error={errors.lastName} required>
        <Input
          id="lastName"
          value={form.lastName}
          onChange={(e) => handleNameChange("lastName", e.currentTarget.value)}
          placeholder="García"
          error={errors.lastName}
          required
          name="lastName"
          autoComplete="family-name"
        />
      </FormField>
    </div>
    <FormField id="birthDate" label="Fecha de nacimiento" error={errors.birthDate} required>
      <Input
        id="birthDate"
        type="date"
        value={form.birthDate}
        onChange={(e) => updateField("birthDate", e.currentTarget.value)}
        error={errors.birthDate}
        required
        name="birthDate"
      />
    </FormField>
    <FormField id="gender" label="Género" helperText="Opcional">
      <Input
        id="gender"
        type="select"
        value={form.gender}
        onChange={(e) => updateField("gender", e.currentTarget.value)}
        options={[
          { value: "", label: "Prefiero no indicar" },
          { value: "masculino", label: "Masculino" },
          { value: "femenino", label: "Femenino" },
          { value: "otro", label: "Otro" },
        ]}
        selectPlaceholder="Selecciona"
        name="gender"
      />
    </FormField>
  </div>
);