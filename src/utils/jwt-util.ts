/**
 * Decodifica um JWT e retorna o payload
 * @param token - Token JWT
 * @returns Payload decodificado ou null se inválido
 */
export function decodeJWT<T = unknown>(token: string): T | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

/**
 * Interface do payload do JWT
 */
export interface JWTPayload {
  sub: string; // ID do usuário
  nome: string;
  email: string;
  isAdmin: boolean;
  perfil: string;
  permissoes: string[];
  exp: number;
  iat: number;
}

/**
 * Obtém o ID do usuário do token JWT armazenado na sessão do NextAuth
 * @returns ID do usuário ou null
 */
export async function getUserIdFromToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    console.warn("getUserIdFromToken: window is undefined (SSR)");
    return null;
  }

  try {
    // Importar dinamicamente para evitar problemas de SSR
    const { getSession } = await import("next-auth/react");
    const session = await getSession();

    if (!session) {
      console.warn("getUserIdFromToken: No session found");
      return null;
    }

    if (!session.access_token) {
      console.warn("getUserIdFromToken: No access_token in session");
      return null;
    }

    const payload = decodeJWT<JWTPayload>(session.access_token);

    if (!payload) {
      console.error("getUserIdFromToken: Failed to decode JWT payload");
      return null;
    }

    if (!payload.sub) {
      console.error("getUserIdFromToken: Payload.sub is missing or empty");
      return null;
    }

    return payload.sub;
  } catch (error) {
    console.error("getUserIdFromToken: Error getting session", error);
    return null;
  }
}

/**
 * Versão síncrona que tenta obter o ID do usuário da sessão do NextAuth
 * Nota: Esta é uma versão de fallback, prefira usar a versão async
 */
export function getUserIdFromTokenSync(): string | null {
  console.warn(
    "getUserIdFromTokenSync: Using sync version, this may not work correctly",
  );
  return null;
}
