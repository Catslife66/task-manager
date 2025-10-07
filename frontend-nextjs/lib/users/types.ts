import z from "zod";
import {
  loginForm,
  passwordResetForm,
  passwordResetRequestForm,
  registerForm,
} from "../utils/validators";

export type LoginFormData = z.infer<typeof loginForm>;

export type LoginFormErrs = Partial<
  Record<keyof LoginFormData | "general", string>
>;

export type LoginResponse = { access_token: string };

export type RegisterFormData = z.infer<typeof registerForm>;

export type RegisterFormErrs = Partial<
  Record<keyof RegisterFormData | "general", string>
>;

export type User = {
  id: number | string;
  email: string;
};

export type PasswordResetRequestFormData = z.infer<
  typeof passwordResetRequestForm
>;

export type ResetPasswordRequestFormErrs = Partial<
  Record<keyof PasswordResetRequestFormData | "general", string>
>;

export type ResetPasswordResponse = { status: number | string };

export type PasswordResetFormData = z.infer<typeof passwordResetForm>;

export type PasswordResetFormErrs = Partial<
  Record<keyof PasswordResetFormData | "general", string>
>;
