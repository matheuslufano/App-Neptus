import axios, { InternalAxiosRequestConfig } from "axios";
import { ApiError } from "next/dist/server/api-utils";

import { getAuthToken } from "./auth-token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
      const apiError = error.response?.data || {
        code: "api_error",
        message: "Erro desconhecido na API",
        status: 500,
      };

      return Promise.reject(
        new ApiError(
          apiError.status || error.response?.status,
          `${apiError.code}: ${apiError.message}`,
        ),
      );
    }

    return Promise.reject(new ApiError(500, "UnknownError: Erro desconhecido"));
  },
);

export default api;
