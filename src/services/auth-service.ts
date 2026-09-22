import { AxiosError } from "axios";

import api from "@/lib/axios";
import { LoginResponse } from "@/types/user-type";
import { formatAndThrowError } from "@/utils/error-util";
import { decodeJWT, JWTPayload } from "@/utils/jwt-util";

export const login = async (loginData: {
  email: string;
  password: string;
}): Promise<LoginResponse> => {
  try {
    const credentials = new URLSearchParams();
    credentials.set("username", loginData.email);
    credentials.set("password", loginData.password);

    const { data } = await api.post<Partial<LoginResponse>>(
      "/auth/login",
      credentials,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (data.usuario) {
      return data as LoginResponse;
    }

    if (!data.access_token || !data.refresh_token) {
      throw new Error("Resposta de login invalida");
    }

    const payload = decodeJWT<JWTPayload>(data.access_token);

    if (!payload?.sub || !payload.email || !payload.nome) {
      throw new Error("Token de login invalido");
    }

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      mensagem: "Login realizado com sucesso",
      usuario: {
        id: payload.sub,
        nome: payload.nome,
        email: payload.email,
        is_admin: payload.isAdmin,
        perfil: payload.perfil,
        permissoes: payload.permissoes || [],
      },
    };
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
      token,
      nova_senha: password,
    });
  } catch (error) {
    throw formatAndThrowError(
      error,
      "Erro ao redefinir senha, tente novamente",
    );
  }
};
