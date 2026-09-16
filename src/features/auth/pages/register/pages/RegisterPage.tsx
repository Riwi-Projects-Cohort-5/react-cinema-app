import { useState } from "react";
import type React from "react";

import { RegisterWizard } from "../components/RegisterWizard";
import type {
  FieldErrors,
  FormState,
  StepConfig,
  RegisterPayload,
} from "../interfaces/Register.interfaces";
import { RegisterLayout } from "../layouts/RegisterLayout";
import { registerUser } from "../services/Register.services";
import { ApiError } from "@services/api-error";
import { Link } from "react-router";

const steps: StepConfig[] = [
  { label: "Personal", title: "Cuéntanos sobre ti" },
  { label: "Contacto", title: "¿Cómo te contactamos?" },
  { label: "Seguridad", title: "Crea tu contraseña" },
  { label: "Preferencias", title: "Últimos detalles" },
];

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  birthDate: "",
  gender: "",
  email: "",
  confirmEmail: "",
  phone: "",
  password: "",
  confirmPassword: "",
  city: "",
  consentPersonal: false,
  consentTerms: false,
  marketing: false,
  acceptTerms: false,
};

const sanitizeName = (value: string) =>
  value.replace(/[^A-Za-zÁÉÍÓÚáéíóúüÜñÑ\s]/g, "").replace(/\s{2,}/g, " ");

const validateStep = (form: FormState, step: number): FieldErrors => {
  const errors: FieldErrors = {};

  if (step === 0) {
    if (!form.firstName.trim()) errors.firstName = "El nombre es obligatorio.";
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúüÜñÑ\s]+$/.test(form.firstName.trim()))
      errors.firstName = "El nombre solo puede contener letras y espacios.";
    else if (form.firstName.trim().length < 2)
      errors.firstName = "El nombre debe tener al menos 2 caracteres.";

    if (!form.lastName.trim()) errors.lastName = "El apellido es obligatorio.";
    else if (!/^[A-Za-zÁÉÍÓÚáéíóúüÜñÑ\s]+$/.test(form.lastName.trim()))
      errors.lastName = "El apellido solo puede contener letras y espacios.";
    else if (form.lastName.trim().length < 2)
      errors.lastName = "El apellido debe tener al menos 2 caracteres.";

    if (!form.birthDate) errors.birthDate = "La fecha de nacimiento es obligatoria.";
    else {
      const today = new Date();
      const birthDate = new Date(form.birthDate);
      const age = today.getFullYear() - birthDate.getFullYear();
      const hasBirthdayPassed =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
      if (Number.isNaN(birthDate.getTime()) || age - (hasBirthdayPassed ? 0 : 1) < 18)
        errors.birthDate = "Debes ser mayor de 18 años.";
    }
  }

  if (step === 1) {
    if (!form.email.trim()) errors.email = "El correo es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = "Ingresa un correo válido.";

    if (!form.confirmEmail.trim()) errors.confirmEmail = "Confirma tu correo.";
    else if (form.confirmEmail.trim().toLowerCase() !== form.email.trim().toLowerCase())
      errors.confirmEmail = "Los correos no coinciden.";

    if (!form.phone.trim()) errors.phone = "El teléfono es obligatorio.";
    else if (!/^\d{10}$/.test(form.phone.replace(/\s+/g, "")))
      errors.phone = "Ingresa un número de 10 dígitos.";
  }

  if (step === 2) {
    if (!form.password) errors.password = "La contraseña es obligatoria.";
    else if (form.password.length < 8)
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    else if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(form.password))
      errors.password = "La contraseña debe incluir letras y números.";
    if (!form.confirmPassword) errors.confirmPassword = "Confirma tu contraseña.";
    else if (form.confirmPassword !== form.password)
      errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  if (step === 3) {
    if (!form.city.trim()) errors.city = "Selecciona tu ciudad.";
    if (!form.consentPersonal)
      errors.consentPersonal = "Debes aceptar el tratamiento de datos personales.";
    if (!form.consentTerms) errors.consentTerms = "Debes aceptar los términos y condiciones.";
    if (!form.acceptTerms) errors.acceptTerms = "Debes aceptar la política de privacidad.";
  }

  return errors;
};

export const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<React.ReactNode>("");

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setSubmitError("");
  };

  const handleNameChange = (field: "firstName" | "lastName", value: string) =>
    updateField(field, sanitizeName(value));

  const goToStep = (stepIndex: number) => {
    if (stepIndex === currentStep) return;
    if (stepIndex > currentStep) {
      const nextErrors = validateStep(form, currentStep);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        setSubmitError("Completa este paso antes de continuar.");
        return;
      }
    }
    setCurrentStep(stepIndex);
    setSubmitError("");
  };

  const handleNext = async () => {
    const nextErrors = validateStep(form, currentStep);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitError("Completa este paso antes de continuar.");
      return;
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((previous) => previous + 1);
      setSubmitError("");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");

      // Map form to flat backend DTO
      const payload: RegisterPayload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        birthDate: form.birthDate,
        // TODO(BE-? confirm allowed gender values): mapping provisional to readable Spanish
        gender:
          form.gender === "masculino"
            ? "Masculino"
            : form.gender === "femenino"
              ? "Femenino"
              : form.gender,
        cityId: Number(form.city),
        email: form.email,
        confirmEmail: form.confirmEmail,
        password: form.password,
        confirmPassword: form.confirmPassword,
        documentType: "CC",
        documentNumber: "1032456789",
        favoriteCinemaId: "",
        personalDataConsent: Boolean(form.consentPersonal || form.acceptTerms),
        termsConsent: Boolean(form.consentTerms || form.acceptTerms),
        commercialConsent: Boolean(form.marketing),
      };

      // NOTE: captcha field name and inclusion must be confirmed with backend (BE-1). Not sending any captcha token now.

      const data = await registerUser(payload);
      console.log("[REGISTER-SUCCESS] Registro exitoso:", data);
      alert("Registro completado correctamente.");
    } catch (error) {
      // Differentiated error handling for API responses
      if (error instanceof ApiError) {
        if (error.status === 400 && error.details) {
          const fieldErrors: FieldErrors = {};
          for (const detail of error.details) {
            // Map backend field names to form fields when possible
            const backendField = detail.field;
            // Simple heuristics: backend might use 'email' or 'confirmEmail' etc.
            fieldErrors[backendField as keyof FieldErrors] = detail.message;
          }
          setErrors((previous) => ({ ...previous, ...fieldErrors }));
          setSubmitError("");
        } else if (error.status === 403) {
          setSubmitError("Error de captcha: verifica que no seas un bot y vuelve a intentarlo.");
        } else if (error.status === 409) {
          const emailMessage = error.message || "El correo ya está registrado.";
          setErrors((previous) => ({ ...previous, email: emailMessage }));
          setSubmitError(
            <span>
              {emailMessage} ¿Quieres{" "}
              <Link to="/auth/login" className="text-primary">
                iniciar sesión
              </Link>
              ?
            </span>
          );
        } else {
          setSubmitError(error.message || "Hubo un problema al registrar.");
        }
      } else {
        setSubmitError(error instanceof Error ? error.message : "Hubo un problema al registrar.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((previous) => previous - 1);
  };

  return (
    <RegisterLayout>
      <RegisterWizard
        currentStep={currentStep}
        steps={steps}
        form={form}
        errors={errors}
        isSubmitting={isSubmitting}
        submitError={submitError}
        updateField={updateField}
        handleNameChange={handleNameChange}
        goToStep={goToStep}
        handleNext={handleNext}
        handleBack={handleBack}
      />
    </RegisterLayout>
  );
};
