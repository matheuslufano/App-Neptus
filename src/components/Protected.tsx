"use client";

import { ReactNode } from "react";

import { usePermissions } from "@/hooks/usePermissions";

interface ProtectedProps {
  children: ReactNode;
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  fallback?: ReactNode;
}

/**
 * Componente para proteger conteúdo baseado em permissões
 *
 * @example
 * // Verificar uma permissão específica
 * <Protected permission="USUARIO_CRIAR">
 *   <Button>Criar Usuário</Button>
 * </Protected>
 *
 * @example
 * // Verificar se tem qualquer uma das permissões
 * <Protected anyPermissions={["USUARIO_EDITAR", "USUARIO_CRIAR"]}>
 *   <Button>Ação</Button>
 * </Protected>
 *
 * @example
 * // Verificar se tem todas as permissões
 * <Protected allPermissions={["USUARIO_EDITAR", "USUARIO_DETALHAR"]}>
 *   <Button>Editar</Button>
 * </Protected>
 */
export const Protected = ({
  children,
  permission,
  anyPermissions,
  allPermissions,
  fallback = null,
}: ProtectedProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermissions) {
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    hasAccess = hasAllPermissions(allPermissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
