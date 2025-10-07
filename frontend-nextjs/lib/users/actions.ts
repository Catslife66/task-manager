import { AxiosInstance } from "axios";
import {
  ResetPasswordResponse,
  LoginFormData,
  LoginResponse,
  RegisterFormData,
  PasswordResetRequestFormData,
  User,
  PasswordResetFormData,
} from "./types";

const LOGIN_ENDPOINT = "/users/login";
const REGISTER_ENDPOINT = "/users/register";
const FORGOT_PASSWORD_ENDPOINT = "/users/forgot-password";
const RESET_PASSWORD_ENDPOINT = "/users/reset-password";

export const loginUser = (
  api: AxiosInstance,
  data: LoginFormData
): Promise<LoginResponse> =>
  api.post(LOGIN_ENDPOINT, data).then((res) => res.data);

export const registerUser = (
  api: AxiosInstance,
  data: RegisterFormData
): Promise<User> => api.post(REGISTER_ENDPOINT, data).then((res) => res.data);

export const forgetPasswordRequest = (
  api: AxiosInstance,
  data: PasswordResetRequestFormData
): Promise<ResetPasswordResponse> =>
  api.post(FORGOT_PASSWORD_ENDPOINT, data).then((res) => res.data);

export const resetPassword = (
  api: AxiosInstance,
  data: PasswordResetFormData
): Promise<ResetPasswordResponse> =>
  api.post(RESET_PASSWORD_ENDPOINT, data).then((res) => res.data);
