export type FormState = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
  confirmEmail: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  consentPersonal: boolean;
  consentTerms: boolean;
  marketing: boolean;
  acceptTerms: boolean;
};

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export type StepConfig = {
  label: string;
  title: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: string;
  cityId: number;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
  documentType: string;
  documentNumber: string;
  favoriteCinemaId?: string | number;
  personalDataConsent: boolean;
  termsConsent: boolean;
  commercialConsent: boolean;
};

export type RegisterResponse = Record<string, unknown>;

export type RegisterFieldProps = {
  form: FormState;
  errors: FieldErrors;
  updateField: (field: keyof FormState, value: string | boolean) => void;
  handleNameChange: (field: "firstName" | "lastName", value: string) => void;
};
