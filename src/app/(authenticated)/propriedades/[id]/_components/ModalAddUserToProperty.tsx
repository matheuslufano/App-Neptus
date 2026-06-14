"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddUserToProperty } from "@/hooks/useProperties";
import { useAllUsers } from "@/hooks/useUsers";

interface ModalAddUserToPropertyProps {
  propriedadeId: string;
  usuariosExistentes: string[]; // IDs dos usuários já na propriedade
}

const ModalAddUserToProperty = ({
  propriedadeId,
  usuariosExistentes,
}: ModalAddUserToPropertyProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const { data: users, isLoading: isLoadingUsers } = useAllUsers();
  const addUserMutation = useAddUserToProperty();

  // Filtra usuários que ainda não estão na propriedade
  const availableUsers = users?.filter(
    (user) => !usuariosExistentes.includes(user.id)
  );

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast.error("Selecione um usuário");
      return;
    }

    try {
      await addUserMutation.mutateAsync({
        propriedade_id: propriedadeId,
        usuario_id: selectedUserId,
      });
      toast.success("Usuário adicionado à propriedade com sucesso!");
      setIsModalOpen(false);
      setSelectedUserId("");
    } catch (error) {
      toast.error("Erro ao adicionar usuário à propriedade");
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  return (
    <div>
      <AppButton size="lg" onClick={() => setIsModalOpen(true)}>
        <Plus /> Adicionar usuário
      </AppButton>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar usuário à propriedade</DialogTitle>
          </DialogHeader>

          <div className="my-4">
            {isLoadingUsers ? (
              <div className="flex items-center justify-center h-20">
                <LoadingSpinner />
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers && availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.nome} ({user.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Nenhum usuário disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedUserId("");
                }}
                disabled={addUserMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                onClick={handleAddUser}
                disabled={addUserMutation.isPending || !selectedUserId}
                isLoading={addUserMutation.isPending}
              >
                Adicionar
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModalAddUserToProperty;
