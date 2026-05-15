import { useAppStore } from "@/stores/propertyStore";

/**
 * Hook para verificar permissões do usuário
 */
export const usePermissions = () => {
  const { userData, hasPermission, hasAnyPermission, hasAllPermissions } =
    useAppStore();

  return {
    userData,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Shortcuts para permissões comuns
    canListUsers: () => hasPermission("USUARIO_LISTAR"),
    canViewUser: () => hasPermission("USUARIO_DETALHAR"),
    canCreateUser: () => hasPermission("USUARIO_CRIAR"),
    canEditUser: () =>
      hasAllPermissions(["USUARIO_EDITAR", "USUARIO_DETALHAR"]),
    canDeleteUser: () => hasPermission("USUARIO_STATUS"),

    canListProfiles: () => hasPermission("PERFIL_LISTAR"),
    canViewProfile: () => hasPermission("PERFIL_DETALHAR"),
    canCreateProfile: () => hasPermission("PERFIL_CRIAR"),
    canEditProfile: () =>
      hasAllPermissions(["PERFIL_EDITAR", "PERFIL_DETALHAR"]),
    canDeleteProfile: () => hasPermission("PERFIL_EXCLUIR"),

    canListProperties: () => hasPermission("PROPRIEDADE_LISTAR"),
    canViewProperty: () => hasPermission("PROPRIEDADE_DETALHAR"),
    canCreateProperty: () => hasPermission("PROPRIEDADE_CRIAR"),
    canEditProperty: () =>
      hasAllPermissions(["PROPRIEDADE_EDITAR", "PROPRIEDADE_DETALHAR"]),
    canDeleteProperty: () => hasPermission("PROPRIEDADE_EXCLUIR"),

    canListTanks: () => hasPermission("TANQUE_LISTAR"),
    canViewTank: () => hasPermission("TANQUE_DETALHAR"),
    canCreateTank: () => hasPermission("TANQUE_CRIAR"),
    canEditTank: () => hasAllPermissions(["TANQUE_EDITAR", "TANQUE_DETALHAR"]),
    canDeleteTank: () => hasPermission("TANQUE_EXCLUIR"),

    canListSensors: () => hasPermission("SENSOR_LISTAR"),
    canViewSensor: () => hasPermission("SENSOR_DETALHAR"),
    canCreateSensor: () => hasPermission("SENSOR_CRIAR"),
    canEditSensor: () =>
      hasAllPermissions(["SENSOR_EDITAR", "SENSOR_DETALHAR"]),
    canDeleteSensor: () => hasPermission("SENSOR_EXCLUIR"),

    canListReadings: () => hasPermission("LEITURA_LISTAR"),
    canViewReading: () => hasPermission("LEITURA_DETALHAR"),
    canListReadingsByTank: () => hasPermission("LEITURA_POR_TANQUE"),
    canListReadingsBySensor: () => hasPermission("LEITURA_POR_SENSOR"),
    canCreateReading: () => hasPermission("LEITURA_CRIAR"),
    canDeleteReading: () => hasPermission("LEITURA_EXCLUIR"),
  };
};
