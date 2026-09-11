export type FormState = {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  email: string;
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
  personal: {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    birthDate: string;
    gender: string;
  };
  contact: {
    email: string;
    phone: string;
  };
  password: string;
  preferences: {
    cityId: string;
    favoriteCinemaId: string;
  };
  consents: {
    dataProcessing: boolean;
    terms: boolean;
    commercialEmail: boolean;
  };
  captchaToken: string;
};

export type RegisterResponse = Record<string, unknown>;

export type RegisterFieldProps = {
  form: FormState;
  errors: FieldErrors;
  updateField: (field: keyof FormState, value: string | boolean) => void;
  handleNameChange: (field: "firstName" | "lastName", value: string) => void;
};