"use client";

import { useEffect, useState } from "react";

import { useAppStore } from "@/stores/propertyStore";
import { getUserIdFromToken, decodeJWT, JWTPayload } from "@/utils/jwt-util";
import { getSession } from "next-auth/react";

import { useProfileById } from "./useProfiles";
import { useUserById } from "./useUsers";

/**
 * Hook para inicializar os dados do usuário e permissões
 * Deve ser usado no nível mais alto da aplicação (layout ou provider)
 */
export const useInitializeUserData = () => {
  const { setUserData, clearUserData } = useAppStore();
  const [userId, setUserId] = useState<string | null>(null);

  // Primeiro, tente popular userData a partir da sessão JWT (NextAuth)
  useEffect(() => {
    const initFromSession = async () => {
      try {
        const session = await getSession();

        // Se a sessão já trouxer permissões, use-as (caso padrão mais seguro)
        if (session?.user && (session.user as any).permissoes) {
          const su: any = session.user;
          setUserData({
            id: String(su.id || ""),
            nome: su.nome || su.name || "",
            email: su.email || "",
            perfil_id: String(su.perfil || ""),
            perfil_nome: su.perfil || "",
            permissoes: su.permissoes || [],
            is_admin: !!su.is_admin,
          });
          return;
        }

        // Caso a sessão não contenha permissões explícitas, tente decodificar o access_token
        if (session?.access_token) {
          const payload = decodeJWT<JWTPayload>(session.access_token);
          if (payload && payload.sub) {
            setUserId(String(payload.sub));
          }

          if (payload && payload.permissoes) {
            setUserData({
              id: String(payload.sub || ""),
              nome: payload.nome || "",
              email: payload.email || "",
              perfil_id: String(payload.perfil || ""),
              perfil_nome: payload.perfil || "",
              permissoes: payload.permissoes || [],
              is_admin: !!payload.isAdmin || !!payload.is_admin,
            });
            return;
          }
        }

        // Fallback: tentar obter ID via helper (mantido por compatibilidade)
        const id = await getUserIdFromToken();
        setUserId(id);
      } catch (error) {
        console.error(
          "useInitializeUserData: erro ao inicializar sessão",
          error,
        );
        clearUserData();
      }
    };

    initFromSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Buscar dados do usuário (somente como fallback quando precisamos de informações extras)
  const { data: user, isLoading: isLoadingUser } = useUserById(
    userId || "",
    !!userId,
  );

  // Buscar perfil do usuário para obter permissões (apenas se ainda não temos permissoes)
  const { data: profile, isLoading: isLoadingProfile } = useProfileById(
    user?.perfil_id || "",
    !!user?.perfil_id,
  );

  useEffect(() => {
    // Se já tivermos permissoes via token/sessão, preferimos elas.
    const current = (getUserFromStore) => null;

    if (!userId) {
      return;
    }

    if (!getUserIdFromToken) {
      return;
    }

    // Se não temos userData preenchido, e conseguimos obter user+profile (caso raro), preencha
    if (user && profile) {
      setUserData((prev) => ({
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil_id: user.perfil_id,
        perfil_nome: user.perfil_nome,
        permissoes: profile.permissoes,
        is_admin: !!prev?.is_admin,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, userId]);

  return {
    isLoading: isLoadingUser || isLoadingProfile,
    user,
    profile,
  };
};
