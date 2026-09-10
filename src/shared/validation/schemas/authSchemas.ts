import { z } from "zod";

// ==================== EMAIL ====================
export const emailSchema = z
  .string()
  .min(1, "El correo es obligatorio")
  .email("El correo no es válido");

// ==================== PASSWORD ====================
// Validación básica para login (solo requerido)
export const passwordBasicSchema = z.string().min(1, "La contraseña es obligatoria");

// Validación estricta para registro y reset (con todas las reglas)
export const passwordStrictSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Debe incluir mayúscula")
  .regex(/[a-z]/, "Debe incluir minúscula")
  .regex(/[0-9]/, "Debe incluir número")
  .regex(/[^A-Za-z0-9]/, "Debe incluir carácter especial");

// ==================== LOGIN ====================
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordBasicSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ==================== REGISTER ====================
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordStrictSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ==================== RESET PASSWORD ====================
export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    newPassword: passwordStrictSchema,
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ==================== CHECKOUT (OPCIONAL) ====================
export const checkoutSchema = z.object({
  fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: emailSchema,
  cardNumber: z.string().regex(/^\d{13,19}$/, "Número de tarjeta inválido"),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, "Formato: MM/YY"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV debe tener 3 o 4 dígitos"),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
