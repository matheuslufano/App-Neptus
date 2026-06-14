"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import CreateUserForm from "@/components/forms/CreateUserForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateUser } from "@/hooks/useUsers";
import { CreateUserSchema } from "@/schemas/user-schema";

const ModalAddUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createUserMutation = useCreateUser();

  const handleAddUser = async (data: CreateUserSchema) => {
    try {
      await createUserMutation.mutateAsync({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        perfil_id: data.perfil_id,
      });
      toast.success("Usuário criado com sucesso!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Erro ao criar usuário");
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  return (
    <div>
      <AppButton
        className="w-full"
        size="lg"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus /> Adicionar usuário
      </AppButton>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar usuário</DialogTitle>
          </DialogHeader>

          <div className="my-2">
            <CreateUserForm onSubmit={handleAddUser} id="add-user-form" />
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={createUserMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                type="submit"
                form="add-user-form"
                disabled={createUserMutation.isPending}
                isLoading={createUserMutation.isPending}
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

export default ModalAddUser;
