import axios, { InternalAxiosRequestConfig } from "axios";
import { ApiError } from "next/dist/server/api-utils";

import { getAuthToken } from "./auth-token";
import { API_BASE_URL } from "@/utils/api-util";

type FastApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
};

type ApiErrorResponse = {
  code?: string;
  detail?: string | FastApiValidationError[];
  message?: string;
  status?: number;
};

const getApiErrorMessage = (data: unknown): string => {
  if (!data) return "Erro desconhecido na API";
  if (typeof data === "string") return data;

  if (typeof data === "object") {
    const errorData = data as ApiErrorResponse;

    if (typeof errorData.message === "string") {
      return errorData.message;
    }

    if (typeof errorData.detail === "string") {
      return errorData.detail;
    }

    if (Array.isArray(errorData.detail)) {
      return errorData.detail
        .map((item) => {
          const path = item.loc?.join(".") || "campo";
          return `${path}: ${item.msg || "valor invalido"}`;
        })
        .join("; ");
    }
  }

  return "Erro desconhecido na API";
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // No cliente, obtém o token da sessão do NextAuth
    if (typeof window !== "undefined") {
      const accessToken = await getAuthToken();

      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data as ApiErrorResponse | undefined;
      const status = apiError?.status || error.response?.status || 500;
      const code = apiError?.code || "ApiError";
      const message = getApiErrorMessage(apiError);

      return Promise.reject(
        new ApiError(status, `${code}: ${message}`),
      );
    }

    return Promise.reject(new ApiError(500, "UnknownError: Erro desconhecido"));
  },
);

export default api;
