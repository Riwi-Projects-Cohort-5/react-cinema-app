import { Link } from "react-router";

import { FormSubmitButton } from "@shared/components/composites/forms";

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
  submitError: string;
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
    <div className="flex w-full items-center justify-center px-4 py-8 sm:px-8 lg:max-w-160 lg:px-10 xl:px-12">
      <div className="w-full max-w-130 rounded-xl border border-border bg-surface p-6 shadow-xl sm:p-7">
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between text-overline font-medium uppercase text-text-secondary">
            <span>
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-text-disabled">{steps[currentStep]!.label}</span>
          </div>
          <div className="flex h-1 w-full overflow-hidden rounded-full bg-surface-variant">
            <span
              className="block rounded-full bg-primary transition-all duration-moderate"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-overline font-medium uppercase text-text-secondary">
            {steps.map((step, index) => (
              <button
                key={step.label}
                type="button"
                onClick={() => goToStep(index)}
                disabled={index > currentStep}
                aria-current={index === currentStep ? "step" : undefined}
                className={
                  index === currentStep
                    ? "rounded-full bg-primary/20 px-2 py-1 text-primary"
                    : index > currentStep
                      ? "cursor-not-allowed px-2 py-1 text-text-disabled"
                      : "px-2 py-1 text-text-secondary"
                }
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>
        <h2 className="mb-6 font-primary text-title font-semibold text-text-primary">
          {steps[currentStep]!.title}
        </h2>
        {currentStep === 0 && <RegisterPersonalStep {...fieldProps} />}
        {currentStep === 1 && <RegisterContactStep {...fieldProps} />}
        {currentStep === 2 && <RegisterSecurityStep {...fieldProps} />}
        {currentStep === 3 && <RegisterPreferencesStep {...fieldProps} />}
        {submitError && (
          <div className="mt-4 rounded-md border border-error bg-error/10 px-3 py-2 text-caption text-error" role="alert">
            {submitError}
          </div>
        )}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0 || isSubmitting}
            className="min-h-11 rounded-md border border-border bg-transparent px-4 py-3 text-caption font-medium text-text-secondary transition-colors duration-fast hover:border-primary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Atrás
          </button>
          <FormSubmitButton
            type="button"
            onClick={handleNext}
            isSubmitting={isSubmitting}
            className="min-h-11 flex-1 rounded-md px-4 py-3 text-body font-semibold text-text-primary shadow-md transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {currentStep === steps.length - 1 ? "Crear cuenta" : "Continuar"}
          </FormSubmitButton>
        </div>
        <p className="mt-4 text-center text-caption text-text-secondary">
          ¿Ya tienes cuenta? <Link to="/auth/login" className="text-primary hover:text-primary-hover">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
};