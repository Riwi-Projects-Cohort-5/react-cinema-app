import { z } from "zod";
import { fieldMessages } from "../utils/validationMessages";

// ==================== EMAIL ====================
export const emailSchema = z
  .string()
  .min(1, fieldMessages.email.required)
  .email({ message: fieldMessages.email.invalid });

// ==================== PASSWORD ====================
// Validación básica para login (solo requerido)
export const passwordBasicSchema = z.string().min(1, fieldMessages.password.required);

// Validación estricta para registro y reset (con todas las reglas)
export const passwordStrictSchema = z
  .string()
  .min(8, fieldMessages.password.minLength)
  .regex(/[A-Z]/, fieldMessages.password.uppercase)
  .regex(/[a-z]/, fieldMessages.password.lowercase)
  .regex(/[0-9]/, fieldMessages.password.number)
  .regex(/[^A-Za-z0-9]/, fieldMessages.password.special);

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
    confirmPassword: z.string().min(1, fieldMessages.confirmPassword.required),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: fieldMessages.confirmPassword.mismatch,
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ==================== RESET PASSWORD ====================
export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    newPassword: passwordStrictSchema,
    confirmPassword: z.string().min(1, fieldMessages.confirmPassword.required),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: fieldMessages.confirmPassword.mismatch,
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ==================== CHECKOUT (OPCIONAL) ====================
export const checkoutSchema = z.object({
  fullName: z.string().min(3, fieldMessages.fullName.minLength),
  email: emailSchema,
  cardNumber: z.string().regex(/^\d{13,19}$/, fieldMessages.cardNumber.invalid),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, fieldMessages.expiryDate.invalid),
  cvv: z.string().regex(/^\d{3,4}$/, fieldMessages.cvv.invalid),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
