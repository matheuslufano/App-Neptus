import { AxiosError } from "axios";

import api from "@/lib/axios";
import { LoginResponse } from "@/types/user-type";
import { formatAndThrowError } from "@/utils/error-util";

export const login = async (loginData: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const { data } = await api.post("/auth/login", {
      email: loginData.email,
      senha: loginData.password,
    });
    return data;
  } catch (error) {
    console.log("Erro ao fazer login:", (error as AxiosError).message);
    throw formatAndThrowError(error, "Erro ao fazer login, tente novamente");
  }
};

export const forgotPassword = async (email: string): Promise<void> => {
  try {
    await api.post("/auth/forgot-password", {
      email,
    });
  } catch (error) {
    throw formatAndThrowError(
      error,
      "Erro ao recuperar senha, tente novamente",
    );
  }
};

export const resetPassword = async (
  password: string,
  token: string,
): Promise<void> => {
  try {
    await api.post("/auth/reset-password", {
      senha: password,
      token,
    });
  } catch (error) {
    throw formatAndThrowError(
      error,
      "Erro ao redefinir senha, tente novamente",
    );
  }
};
