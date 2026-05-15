"use client";

import {
  Bolt,
  Building2,
  ChartPie,
  History,
  MenuIcon,
  RefreshCcw,
  Shield,
  Users,
  Waves,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useInternetConnection } from "@/hooks/useInternetConnection";
import { usePermissions } from "@/hooks/usePermissions";
import { useSync } from "@/hooks/useSync";
import { useUserById } from "@/hooks/useUsers";
import api from "@/lib/axios";
import { syncManager } from "@/lib/sync/manager";
import { usePropertyStore } from "@/stores/propertyStore";
import { getUserIdFromToken } from "@/utils/jwt-util";

import AppButton, { AppButtonLogout } from "../AppButton";
import { Protected } from "../Protected";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import NavLink from "./NavLink";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error" | "empty"
  >("idle");
  const { data: session } = useSession();
  const sync = useSync();
  const { isOnline } = useInternetConnection(); // Usa o status de rede global PWA
  const [userId, setUserId] = useState<string | null>(null);
  const { selectedPropertyId, setSelectedPropertyId } = usePropertyStore();
  const permissions = usePermissions();

  // Obter ID do usuário do token JWT
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };

    fetchUserId();
  }, []);

  // Buscar dados do usuário logado
  const { data: user, isLoading } = useUserById(userId || "", !!userId);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const handleSync = async () => {
    if (!session?.access_token) {
      toast.error("Você precisa estar logado para sincronizar");
      return;
    }

    if (!isOnline) {
      toast.error("Você precisa estar conectado à internet");
      return;
    }

    setIsOpen(false); // Fecha o menu lateral
    setSyncModalOpen(true);
    setSyncStatus("syncing");

    try {
      // Usa o gerenciador central de sincronização PWA (via Dexie)
      const { success, syncedCount, failedCount } = await syncManager.sync();

      if (syncedCount === 0 && failedCount === 0) {
        setSyncStatus("empty");
        setTimeout(() => setSyncModalOpen(false), 3000);
        return;
      }

      if (success && failedCount === 0) {
        setSyncStatus("success");
      } else {
        // Mostra sucesso parcial/falha
        setSyncStatus("error");
      }

      setTimeout(() => {
        setSyncModalOpen(false);
        setTimeout(() => setSyncStatus("idle"), 500);
      }, 3000);
    } catch (error) {
      console.error("Erro durante sincronização:", error);
      setSyncStatus("error");
    }
  };

  return (
    <nav>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="hover:cursor-pointer">
          <MenuIcon className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[250px] gap-0"
          aria-describedby="menu"
        >
          <SheetHeader>
            <SheetTitle className="py-4 text-xl">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col justify-between h-full pb-10">
            <div className="flex flex-col gap-2">
              {/* Property Selector */}
              <div className="px-4 py-2">
                <label className="text-xs text-muted-foreground mb-2 block">
                  Propriedade
                </label>
                <Select
                  value={selectedPropertyId || ""}
                  onValueChange={setSelectedPropertyId}
                  disabled={isLoading || !user}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma propriedade" />
                  </SelectTrigger>
                  <SelectContent>
                    {user?.propriedades?.map((property) => (
                      <SelectItem
                        key={property.propriedade_id}
                        value={property.propriedade_id}
                      >
                        {property.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t my-2" />

              <NavLink href="/" icon={<ChartPie />} onClick={handleLinkClick}>
                Dashboard
              </NavLink>

              {/* Histórico - Sempre visível (funciona offline) */}
              <NavLink
                href="/historico"
                icon={<History />}
                onClick={handleLinkClick}
              >
                Histórico
              </NavLink>

              <NavLink
                href="/configuracoes"
                icon={<Bolt />}
                onClick={handleLinkClick}
              >
                Configurações
              </NavLink>

              {/* Tanques - Sempre visível (funciona offline) */}
              <NavLink
                href="/tanques"
                icon={<Waves />}
                onClick={handleLinkClick}
              >
                Tanques
              </NavLink>

              {/* Usuários - Requer permissão + internet */}
              {isOnline && (
                <Protected permission="USUARIO_LISTAR">
                  <NavLink
                    href="/usuarios"
                    icon={<Users />}
                    onClick={handleLinkClick}
                  >
                    Usuários
                  </NavLink>
                </Protected>
              )}

              {/* Perfis - Requer permissão + internet */}
              {isOnline && (
                <Protected permission="PERFIL_LISTAR">
                  <NavLink
                    href="/perfis"
                    icon={<Shield />}
                    onClick={handleLinkClick}
                  >
                    Perfis
                  </NavLink>
                </Protected>
              )}

              {/* Propriedades - Requer permissão + internet */}
              {isOnline && (
                <Protected permission="PROPRIEDADE_LISTAR">
                  <NavLink
                    href="/propriedades"
                    icon={<Building2 />}
                    onClick={handleLinkClick}
                  >
                    Propriedades
                  </NavLink>
                </Protected>
              )}
            </div>
            <div className="px-4 space-y-3">
              <AppButtonLogout />
              <AppButton
                variant="outline"
                className="w-full"
                size="lg"
                tabIndex={-1}
                onClick={handleSync}
                disabled={syncStatus === "syncing" || !isOnline}
              >
                <RefreshCcw
                  className={syncStatus === "syncing" ? "animate-spin" : ""}
                />
                <span className="text-base">
                  {!isOnline
                    ? "Sem Internet"
                    : syncStatus === "syncing"
                      ? "Sincronizando..."
                      : "Sincronizar Histórico"}
                </span>
              </AppButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal Temporário PWA de Sincronização */}
      <Dialog open={syncModalOpen} onOpenChange={setSyncModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sincronização de Histórico</DialogTitle>
            <DialogDescription>
              Enviando amostras armazenadas na memória do dispositivo para o
              Neptus.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            {syncStatus === "syncing" && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4" />
                <p className="text-sm font-medium text-gray-600 animate-pulse">
                  Sincronizando amostras, por favor aguarde...
                </p>
              </>
            )}

            {syncStatus === "success" && (
              <>
                <div className="rounded-full bg-green-100 p-3 mb-4">
                  <RefreshCcw className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-sm font-bold text-green-700">
                  Amostras Sincronizadas com Sucesso!
                </p>
                <p className="text-xs text-gray-500">
                  O Histórico foi enviado para o Servidor Central.
                </p>
              </>
            )}

            {syncStatus === "empty" && (
              <>
                <div className="rounded-full bg-orange-100 p-3 mb-4">
                  <History className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-sm font-bold text-orange-700">
                  Nenhum dado pendente.
                </p>
                <p className="text-xs text-gray-500">
                  O seu histórico já está atualizado no servidor.
                </p>
              </>
            )}

            {syncStatus === "error" && (
              <>
                <div className="rounded-full bg-red-100 p-3 mb-4">
                  <Bolt className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-sm font-bold text-red-700">
                  Erro na Sincronização.
                </p>
                <p className="text-xs text-red-500">
                  Tente novamente mais tarde.
                </p>
                <AppButton
                  onClick={() => setSyncModalOpen(false)}
                  variant="outline"
                  className="mt-4"
                >
                  Fechar
                </AppButton>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default NavBar;
