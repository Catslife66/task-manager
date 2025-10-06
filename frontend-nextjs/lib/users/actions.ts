import { AxiosInstance } from "axios";
import { LoginFormData, LoginResponse, RegisterFormData, User } from "./types";

const LOGIN_ENDPOINT = "/users/login";
const REGISTER_ENDPOINT = "/users/register";

export const loginUser = (
  api: AxiosInstance,
  data: LoginFormData
): Promise<LoginResponse> =>
  api.post(LOGIN_ENDPOINT, data).then((res) => res.data);

export const registerUser = (
  api: AxiosInstance,
  data: RegisterFormData
): Promise<User> => api.post(REGISTER_ENDPOINT, data).then((res) => res.data);
