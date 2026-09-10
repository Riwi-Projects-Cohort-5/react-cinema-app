// ==================== FIELD-LEVEL MESSAGES ====================
export const fieldMessages = {
  email: {
    required: "El correo es obligatorio",
    invalid: "El correo no es válido",
  },
  password: {
    required: "La contraseña es obligatoria",
    minLength: "Mínimo 8 caracteres",
    uppercase: "Debe incluir mayúscula",
    lowercase: "Debe incluir minúscula",
    number: "Debe incluir número",
    special: "Debe incluir carácter especial",
  },
  confirmPassword: {
    required: "Confirma tu contraseña",
    mismatch: "Las contraseñas no coinciden",
  },
  fullName: {
    required: "El nombre es obligatorio",
    minLength: "El nombre debe tener al menos 3 caracteres",
  },
  cardNumber: {
    required: "El número de tarjeta es obligatorio",
    invalid: "Número de tarjeta inválido",
  },
  expiryDate: {
    required: "La fecha de vencimiento es obligatoria",
    invalid: "Formato: MM/YY",
  },
  cvv: {
    required: "El CVV es obligatorio",
    invalid: "CVV debe tener 3 o 4 dígitos",
  },
};

// ==================== FORM-LEVEL MESSAGES ====================
export const formMessages = {
  submitting: "Enviando formulario...",
  success: "¡Formulario enviado correctamente!",
  error: "Error al enviar el formulario",
  validating: "Validando...",
  serverError: "Error del servidor. Intenta de nuevo.",
};
