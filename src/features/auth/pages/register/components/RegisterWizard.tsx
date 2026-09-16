import { Link } from "react-router";
import type React from "react";

import { FormSubmitButton } from "@shared/components/composites/forms";
import { Button } from "@shared/components/primitives";

import type { FieldErrors, FormState, StepConfig } from "../interfaces/Register.interfaces";
import { RegisterContactStep } from "./RegisterContactStep";
import { RegisterPersonalStep } from "./RegisterPersonalStep";
import { RegisterPreferencesStep } from "./RegisterPreferencesStep";
import { RegisterSecurityStep } from "./RegisterSecurityStep";

type RegisterWizardProps = {
  currentStep: number;
  steps: StepConfig[];
  form: FormState;
  errors: FieldErrors;
  isSubmitting: boolean;
  submitError: React.ReactNode;
  updateField: (field: keyof FormState, value: string | boolean) => void;
  handleNameChange: (field: "firstName" | "lastName", value: string) => void;
  goToStep: (stepIndex: number) => void;
  handleNext: () => Promise<void>;
  handleBack: () => void;
};

export const RegisterWizard = ({
  currentStep,
  steps,
  form,
  errors,
  isSubmitting,
  submitError,
  updateField,
  handleNameChange,
  goToStep,
  handleNext,
  handleBack,
}: RegisterWizardProps) => {
  const fieldProps = { form, errors, updateField, handleNameChange };

  return (
    <div className="relative w-full max-w-[520px]">
      <div className="pt-3">
        <div className="mb-4 flex items-center justify-between text-overline font-semibold uppercase tracking-overline text-text-secondary">
          <span>
            Paso {currentStep + 1} de {steps.length}
          </span>
          <span className="text-text-disabled">{steps[currentStep]!.label}</span>
        </div>

        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-surface-variant">
          <span
            className="block h-full rounded-full bg-primary transition-all duration-moderate"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="mb-5 grid grid-cols-4 gap-2 text-overline font-semibold uppercase tracking-overline text-text-secondary">
          {steps.map((step, index) => (
            <button
              key={step.label}
              type="button"
              onClick={() => goToStep(index)}
              disabled={index > currentStep}
              aria-current={index === currentStep ? "step" : undefined}
              className={
                index === currentStep
                  ? "min-h-11 rounded-full bg-primary/20 px-2 py-1 text-primary"
                  : index > currentStep
                    ? "min-h-11 cursor-not-allowed px-2 py-1 text-text-disabled"
                    : "min-h-11 px-2 py-1 text-text-secondary"
              }
            >
              {step.label}
            </button>
          ))}
        </div>

        <h2 className="mb-6 font-primary text-title font-semibold text-text-primary">
          {steps[currentStep]!.title}
        </h2>

        {currentStep === 0 && <RegisterPersonalStep {...fieldProps} />}
        {currentStep === 1 && <RegisterContactStep {...fieldProps} />}
        {currentStep === 2 && <RegisterSecurityStep {...fieldProps} />}
        {currentStep === 3 && <RegisterPreferencesStep {...fieldProps} />}

        {submitError && (
          <div
            className="mt-4 rounded-md border border-error bg-error/10 px-3 py-2 text-caption text-error"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            variant="outline"
            className="min-h-11 flex-1 rounded-md border border-border bg-surface/80 px-4 py-3 text-body font-medium text-text-primary"
          >
            ← Atrás
          </Button>

          <FormSubmitButton
            type="button"
            onClick={handleNext}
            isSubmitting={isSubmitting}
            className="min-h-11 flex-1 rounded-md px-4 py-3 text-body font-medium text-text-primary shadow-md hover:bg-primary-hover"
          >
            {currentStep === steps.length - 1 ? "Crear cuenta" : "Continuar →"}
          </FormSubmitButton>
        </div>

        <p className="mt-4 text-center text-caption text-text-secondary">
          ¿Ya tienes cuenta?{" "}
          <Link to="/auth/login" className="text-primary hover:text-primary-hover">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
};
