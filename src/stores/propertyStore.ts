import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserData {
  id: string;
  nome: string;
  email: string;
  perfil_id: string;
  perfil_nome: string;
  permissoes: string[];
  is_admin: boolean;
}

interface AppStore {
  // Property
  selectedPropertyId: string | null;
  setSelectedPropertyId: (id: string | null) => void;
  clearSelectedProperty: () => void;

  // User & Permissions
  userData: UserData | null;
  setUserData: (data: UserData) => void;
  clearUserData: () => void;

  // Permission helpers
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Property state
      selectedPropertyId: null,
      setSelectedPropertyId: (id: string | null) =>
        set({ selectedPropertyId: id }),
      clearSelectedProperty: () => set({ selectedPropertyId: null }),

      // User state
      userData: null,
      setUserData: (data: UserData) => set({ userData: data }),
      clearUserData: () => set({ userData: null, selectedPropertyId: null }),

      // Permission helpers
      hasPermission: (permission: string) => {
        const { userData } = get();
        if (!userData) return false;
        if (userData.is_admin) return true;
        if (!userData.permissoes) return false;

        // Normalize to uppercase for comparison
        const normalizedPermissions = userData.permissoes.map((p) =>
          p.toUpperCase(),
        );
        return normalizedPermissions.includes(permission.toUpperCase());
      },

      hasAnyPermission: (permissions: string[]) => {
        const { userData } = get();
        if (!userData) return false;
        if (userData.is_admin) return true;
        if (!userData.permissoes) return false;

        const normalizedPermissions = userData.permissoes.map((p) =>
          p.toUpperCase(),
        );
        return permissions.some((p) =>
          normalizedPermissions.includes(p.toUpperCase()),
        );
      },

      hasAllPermissions: (permissions: string[]) => {
        const { userData } = get();
        if (!userData) return false;
        if (userData.is_admin) return true;
        if (!userData.permissoes) return false;

        const normalizedPermissions = userData.permissoes.map((p) =>
          p.toUpperCase(),
        );
        return permissions.every((p) =>
          normalizedPermissions.includes(p.toUpperCase()),
        );
      },
    }),
    {
      name: "app-storage",
    },
  ),
);

// Backward compatibility - keep the old hook name
export const usePropertyStore = useAppStore;
