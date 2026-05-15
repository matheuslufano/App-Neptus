"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import { Protected } from "@/components/Protected";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRemoveUserFromProperty } from "@/hooks/useProperties";
import { ApiPropertyUser } from "@/types/property-api-type";

interface PropertyUserItemProps {
  user: ApiPropertyUser;
  propriedadeId: string;
}

const PropertyUserItem = ({ user, propriedadeId }: PropertyUserItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const removeUserMutation = useRemoveUserFromProperty();

  const handleRemove = async () => {
    try {
      await removeUserMutation.mutateAsync({
        propriedade_id: propriedadeId,
        usuario_id: user.id,
      });
      toast.success("Usuário removido da propriedade com sucesso!");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Erro ao remover usuário da propriedade");
      console.error("Erro ao remover usuário:", error);
    }
  };

  return (
    <>
      <div className="flex px-4 py-3 items-center gap-2 border bg-muted rounded-md">
        <div className="flex flex-1 flex-col gap-2">
          <p className="font-medium">{user.nome}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge className="w-fit">{user.perfil_nome}</Badge>
        </div>
        <Protected
          allPermissions={["PROPRIEDADE_EDITAR", "PROPRIEDADE_DETALHAR"]}
        >
          <AppButton
            variant="outline"
            size="icon"
            className="focus:border-destructive focus:text-destructive hover:border-destructive hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 />
          </AppButton>
        </Protected>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja remover o usuário &ldquo;{user.nome}
              &rdquo; desta propriedade?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={removeUserMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                variant="destructive"
                onClick={handleRemove}
                disabled={removeUserMutation.isPending}
                isLoading={removeUserMutation.isPending}
              >
                Remover
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyUserItem;
