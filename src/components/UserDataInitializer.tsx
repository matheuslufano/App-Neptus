"use client";

import { useInitializeUserData } from "@/hooks/useInitializeUserData";

/**
 * Componente para inicializar dados do usuário e permissões
 * Deve ser usado no layout autenticado
 */
const UserDataInitializer = () => {
  useInitializeUserData();
  return null;
};

export default UserDataInitializer;
