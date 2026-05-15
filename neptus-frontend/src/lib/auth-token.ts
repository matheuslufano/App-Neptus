import { getSession } from "next-auth/react";

/**
 * Obtém o token de autenticação da sessão do NextAuth
 * @returns Promise<string | null> - O token de acesso ou null se não encontrado
 */
export const getAuthToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    const accessToken = session.access_token;

    if (!accessToken) {
      return null;
    }

    return accessToken;
  } catch (error) {
    return null;
  }
};
