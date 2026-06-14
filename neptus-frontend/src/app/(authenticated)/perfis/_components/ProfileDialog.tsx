"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import LoadingSpinner from "@/components/LoadingSpinner";
import { Protected } from "@/components/Protected";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import styles from "./ProfileDialog.module.css";
import {
  useCreateProfile,
  useDeleteProfile,
  useUpdateProfile,
} from "@/hooks/useProfiles";
import { cn } from "@/lib/utils";
import { ApiProfile } from "@/types/profile-api-type";

type PermissionDef = { id: string; label: string };

type PermissionGroup = {
  id: string;
  title: string;
  permissions: PermissionDef[];
};

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "usuario",
    title: "Usuários",
    permissions: [
      { id: "USUARIO_LISTAR", label: "Listar usuários" },
      { id: "USUARIO_DETALHAR", label: "Ver detalhes do usuário" },
      { id: "USUARIO_CRIAR", label: "Criar usuário" },
      { id: "USUARIO_EDITAR", label: "Editar usuário" },
      { id: "USUARIO_STATUS", label: "Ativar ou desativar usuário" },
    ],
  },
  {
    id: "perfil",
    title: "Perfis de acesso",
    permissions: [
      { id: "PERFIL_LISTAR", label: "Listar perfis" },
      { id: "PERFIL_DETALHAR", label: "Ver detalhes do perfil" },
      { id: "PERFIL_CRIAR", label: "Criar perfil" },
      { id: "PERFIL_EDITAR", label: "Editar perfil" },
      { id: "PERFIL_EXCLUIR", label: "Excluir perfil" },
    ],
  },
  {
    id: "propriedade",
    title: "Propriedades",
    permissions: [
      { id: "PROPRIEDADE_LISTAR", label: "Listar propriedades" },
      { id: "PROPRIEDADE_DETALHAR", label: "Ver detalhes da propriedade" },
      { id: "PROPRIEDADE_CRIAR", label: "Criar propriedade" },
      { id: "PROPRIEDADE_EDITAR", label: "Editar propriedade" },
      { id: "PROPRIEDADE_EXCLUIR", label: "Excluir propriedade" },
    ],
  },
  {
    id: "tanque",
    title: "Tanques",
    permissions: [
      { id: "TANQUE_LISTAR", label: "Listar tanques" },
      { id: "TANQUE_DETALHAR", label: "Ver detalhes do tanque" },
      { id: "TANQUE_CRIAR", label: "Criar tanque" },
      { id: "TANQUE_EDITAR", label: "Editar tanque" },
      { id: "TANQUE_EXCLUIR", label: "Excluir tanque" },
    ],
  },
  {
    id: "sensor",
    title: "Sensores",
    permissions: [
      { id: "SENSOR_LISTAR", label: "Listar sensores" },
      { id: "SENSOR_DETALHAR", label: "Ver detalhes do sensor" },
      { id: "SENSOR_CRIAR", label: "Cadastrar sensor" },
      { id: "SENSOR_EDITAR", label: "Editar sensor" },
      { id: "SENSOR_EXCLUIR", label: "Excluir sensor" },
    ],
  },
  {
    id: "leitura",
    title: "Leituras",
    permissions: [
      { id: "LEITURA_LISTAR", label: "Listar leituras" },
      { id: "LEITURA_DETALHAR", label: "Ver detalhes da leitura" },
      { id: "LEITURA_POR_TANQUE", label: "Consultar leituras por tanque" },
      { id: "LEITURA_POR_SENSOR", label: "Consultar leituras por sensor" },
      { id: "LEITURA_CRIAR", label: "Registrar leitura" },
      { id: "LEITURA_EXCLUIR", label: "Excluir leitura" },
    ],
  },
];

const TOTAL_PERMISSION_COUNT = PERMISSION_GROUPS.reduce(
  (acc, g) => acc + g.permissions.length,
  0,
);

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  permissoes: z.array(z.string()),
});

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: ApiProfile | null;
}

function normalizePermissionSet(permissoes: string[]) {
  return new Set(permissoes);
}

export const ProfileDialog = ({
  open,
  onOpenChange,
  profile,
}: ProfileDialogProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [permissionQuery, setPermissionQuery] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PERMISSION_GROUPS.map((g) => [g.id, true])),
  );
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      permissoes: [],
    },
  });

  const selectedPermissions = form.watch("permissoes");
  const selectedSet = useMemo(
    () => normalizePermissionSet(selectedPermissions),
    [selectedPermissions],
  );

  const filteredGroups = useMemo(() => {
    const q = permissionQuery.trim().toLowerCase();
    if (!q) return PERMISSION_GROUPS;
    return PERMISSION_GROUPS.map((group) => ({
      ...group,
      permissions: group.permissions.filter(
        (p) =>
          p.label.toLowerCase().includes(q) || p.id.toLowerCase().includes(q),
      ),
    })).filter((g) => g.permissions.length > 0);
  }, [permissionQuery]);

  useEffect(() => {
    if (open) {
      if (profile) {
        setIsEditMode(true);
        form.reset({
          nome: profile.nome,
          permissoes: profile.permissoes,
        });
      } else {
        setIsEditMode(false);
        form.reset({
          nome: "",
          permissoes: [],
        });
      }
      setPermissionQuery("");
      setOpenGroups(
        Object.fromEntries(PERMISSION_GROUPS.map((g) => [g.id, true])),
      );
    }
  }, [open, profile, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditMode && profile) {
        await updateProfile.mutateAsync({
          id: profile.id,
          data: values,
        });
        toast.success("Perfil atualizado com sucesso!");
      } else {
        await createProfile.mutateAsync(values);
        toast.success("Perfil criado com sucesso!");
      }
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar perfil");
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    try {
      await deleteProfile.mutateAsync(profile.id);
      toast.success("Perfil excluído com sucesso!");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao excluir perfil");
    }
  };

  const setPermissions = (next: string[]) => {
    form.setValue("permissoes", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const togglePermission = (permission: string) => {
    const current = form.getValues("permissoes");
    if (current.includes(permission)) {
      setPermissions(current.filter((p) => p !== permission));
    } else {
      setPermissions([...current, permission]);
    }
  };

  const selectAllInGroup = (group: PermissionGroup) => {
    const ids = group.permissions.map((p) => p.id);
    const current = new Set(
      form.getValues("permissoes").map((p) => p.toUpperCase()),
    );
    ids.forEach((id) => current.add(id));
    setPermissions([...current]);
  };

  const clearAllInGroup = (group: PermissionGroup) => {
    const remove = new Set(group.permissions.map((p) => p.id));
    setPermissions(form.getValues("permissoes").filter((p) => !remove.has(p)));
  };

  const countSelectedInGroup = (group: PermissionGroup) =>
    group.permissions.filter((p) => selectedSet.has(p.id)).length;

  const isLoading =
    createProfile.isPending ||
    updateProfile.isPending ||
    deleteProfile.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle>
            {isEditMode ? "Editar Perfil" : "Novo Perfil"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Defina o nome e marque o que este perfil pode fazer no sistema. As
            permissões enviadas à API continuam nos mesmos códigos técnicos.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={styles.formWrapper}
          >
            <div className={styles.mainContent}>
              {profile && (
                <div className={styles.profileCard}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-lg font-semibold">
                      {profile.nome}
                    </span>
                    <Badge variant="secondary" className="shrink-0">
                      {profile.usuarios}{" "}
                      {profile.usuarios === 1 ? "usuário" : "usuários"}
                    </Badge>
                  </div>
                  <div className="grid gap-2 text-muted-foreground sm:grid-cols-2">
                    <div>Criado em: {profile.criado_em}</div>
                    <div>Atualizado em: {profile.atualizado_em}</div>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Perfil</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Gerente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-sm font-medium leading-none">
                      Permissões
                    </h3>
                    <p className="mt-1.5 text-xs font-medium text-primary">
                      {selectedSet.size} de {TOTAL_PERMISSION_COUNT}{" "}
                      selecionadas
                    </p>
                  </div>
                  <div className="relative sm:w-64">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar permissão…"
                      value={permissionQuery}
                      onChange={(e) => setPermissionQuery(e.target.value)}
                      className={styles.searchInput}
                      aria-label="Buscar permissões"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {filteredGroups.map((group) => {
                    const selectedInGroup = countSelectedInGroup(group);
                    const totalInGroup = group.permissions.length;
                    const isGroupOpen = openGroups[group.id] ?? true;
                    return (
                      <div
                        key={group.id}
                        className={styles.permissionGroupCard}
                      >
                        <div className="flex flex-col gap-2 border-b bg-muted/60 px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                          <button
                            type="button"
                            className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-sm font-medium outline-none ring-offset-background hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() =>
                              setOpenGroups((prev) => ({
                                ...prev,
                                [group.id]: !isGroupOpen,
                              }))
                            }
                            aria-expanded={isGroupOpen}
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 shrink-0 text-muted-foreground transition-transform",
                                !isGroupOpen && "-rotate-90",
                              )}
                              aria-hidden
                            />
                            <span className="truncate">{group.title}</span>
                            <Badge
                              variant="outline"
                              className="shrink-0 border-primary/30 bg-primary/5 font-medium"
                            >
                              {selectedInGroup}/{totalInGroup}
                            </Badge>
                          </button>
                          <div className="flex shrink-0 justify-end gap-1 pl-7 sm:pl-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => selectAllInGroup(group)}
                            >
                              Marcar todas
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-muted-foreground"
                              onClick={() => clearAllInGroup(group)}
                            >
                              Limpar
                            </Button>
                          </div>
                        </div>
                        {isGroupOpen && (
                          <div className="space-y-1 px-2 py-2">
                            {group.permissions.map((perm) => {
                              const checked = selectedSet.has(perm.id);
                              return (
                                <label
                                  key={perm.id}
                                  className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-md border px-2 py-2 transition-all",
                                    "border-transparent hover:bg-muted has-[:focus-visible]:bg-muted",
                                    checked &&
                                      "border-primary/40 bg-primary/15 shadow-sm",
                                  )}
                                >
                                  <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center">
                                    <input
                                      type="checkbox"
                                      className="peer sr-only"
                                      checked={checked}
                                      onChange={() => togglePermission(perm.id)}
                                    />
                                    <span
                                      className={cn(
                                        "flex size-4 items-center justify-center rounded border border-input bg-background shadow-xs transition-colors",
                                        "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                                        checked &&
                                          "border-primary bg-primary text-primary-foreground shadow-md",
                                      )}
                                      aria-hidden
                                    >
                                      {checked && (
                                        <Check className="size-3 stroke-[3]" />
                                      )}
                                    </span>
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium leading-snug">
                                      {perm.label}
                                    </span>
                                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wide text-slate-600 dark:text-slate-400">
                                      {perm.id}
                                    </span>
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filteredGroups.length === 0 && (
                  <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                    Nenhuma permissão corresponde à busca.
                  </p>
                )}
              </div>
            </div>

            <div
              className={cn(
                styles.footer,
                profile ? "justify-between" : "justify-end",
              )}
            >
              <Protected permission="PERFIL_EXCLUIR">
                {profile && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isLoading}
                    aria-label="Excluir perfil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </Protected>
              <div className="ml-auto flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
