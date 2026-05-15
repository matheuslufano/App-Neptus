"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
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
import {
  useCreateProfile,
  useDeleteProfile,
  useUpdateProfile,
} from "@/hooks/useProfiles";
import { ApiProfile } from "@/types/profile-api-type";

// Definitions of permissions
const PERMISSIONS = {
  Usuário: [
    "USUARIO_LISTAR",
    "USUARIO_DETALHAR",
    "USUARIO_CRIAR",
    "USUARIO_EDITAR",
    "USUARIO_STATUS",
  ],
  Perfil: [
    "PERFIL_LISTAR",
    "PERFIL_DETALHAR",
    "PERFIL_CRIAR",
    "PERFIL_EDITAR",
    "PERFIL_EXCLUIR",
  ],
  Propriedade: [
    "PROPRIEDADE_LISTAR",
    "PROPRIEDADE_DETALHAR",
    "PROPRIEDADE_CRIAR",
    "PROPRIEDADE_EDITAR",
    "PROPRIEDADE_EXCLUIR",
  ],
  Tanque: [
    "TANQUE_LISTAR",
    "TANQUE_DETALHAR",
    "TANQUE_CRIAR",
    "TANQUE_EDITAR",
    "TANQUE_EXCLUIR",
  ],
  Sensor: [
    "SENSOR_LISTAR",
    "SENSOR_DETALHAR",
    "SENSOR_CRIAR",
    "SENSOR_EDITAR",
    "SENSOR_EXCLUIR",
  ],
  Leitura: [
    "LEITURA_LISTAR",
    "LEITURA_DETALHAR",
    "LEITURA_POR_TANQUE",
    "LEITURA_POR_SENSOR",
    "LEITURA_CRIAR",
    "LEITURA_EXCLUIR",
  ],
};

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  permissoes: z.array(z.string()),
});

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile?: ApiProfile | null;
}

export const ProfileDialog = ({
  open,
  onOpenChange,
  profile,
}: ProfileDialogProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
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

  useEffect(() => {
    if (open) {
      if (profile) {
        setIsEditMode(true);
        form.reset({
          nome: profile.nome,
          permissoes: profile.permissoes.map((p) => p.toUpperCase()),
        });
      } else {
        setIsEditMode(false);
        form.reset({
          nome: "",
          permissoes: [],
        });
      }
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
    } catch (error) {
      // Error handling is done in service wrapper or globally usually, but toast here is safe
      toast.error("Erro ao salvar perfil");
    }
  };

  const handleDelete = async () => {
    if (!profile) return;
    try {
      await deleteProfile.mutateAsync(profile.id);
      toast.success("Perfil excluído com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao excluir perfil");
    }
  };

  const togglePermission = (permission: string) => {
    const currentPermissions = form.getValues("permissoes");
    if (currentPermissions.includes(permission)) {
      form.setValue(
        "permissoes",
        currentPermissions.filter((p) => p !== permission)
      );
    } else {
      form.setValue("permissoes", [...currentPermissions, permission]);
    }
  };

  const formatRequestPermission = (apiPermission: string) => {
    // The API returns lowercase often (e.g. "tanque_listar"), but the prompt lists UPPERCASE.
    // The prompt says: "endpoint POST ... 'permissoes': ['USUARIO_LISTAR']".
    // But the GET example shows: "permissoes": ["tanque_listar", ...] (lowercase).
    // I should handle normalization to be safe or just use as is.
    // I will assume the badge values (uppercase) are what we want to send,
    // but I need to map the incoming lowercase ones to checks.
    return apiPermission.toUpperCase();
  };

  const isPermissionSelected = (permission: string) => {
    const current = form.watch("permissoes");
    return current
      .map((p) => p.toUpperCase())
      .includes(permission.toUpperCase());
  };

  const isLoading =
    createProfile.isPending ||
    updateProfile.isPending ||
    deleteProfile.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Perfil" : "Novo Perfil"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6 flex-1 overflow-hidden"
          >
            {/* Top Card Info (only if viewing/editing existing) - per requirement */}
            {profile && (
              <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-lg">{profile.nome}</span>
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-semibold flex items-center">
                    {profile.usuarios} Usuários
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-muted-foreground">
                  <div>
                    Criado em: {profile.criado_em}
                    {/* Note: provided JSON dates are pre-formatted strings, if not I would use date-fns */}
                  </div>
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

            <div className="flex-1 overflow-hidden flex flex-col">
              <h3 className="text-sm font-medium mb-3">Permissões</h3>
              <div className="flex-1 pr-4 overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(PERMISSIONS).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-sm text-muted-foreground mb-2 font-semibold uppercase tracking-wider">
                        {category}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((perm) => {
                          const isSelected = isPermissionSelected(perm);
                          return (
                            <Badge
                              key={perm}
                              variant={isSelected ? "default" : "outline"}
                              className={`cursor-pointer transition-all hover:opacity-80 ${
                                isSelected
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : ""
                              }`}
                              onClick={() => togglePermission(perm)}
                            >
                              {perm}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`flex ${
                profile ? "justify-between" : "justify-end"
              } gap-2 pt-4 border-t`}
            >
              <Protected permission="PERFIL_EXCLUIR">
                {profile && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </Protected>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
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
