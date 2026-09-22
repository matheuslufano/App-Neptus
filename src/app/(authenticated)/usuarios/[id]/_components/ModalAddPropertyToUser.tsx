"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
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
import { useAddUserToProperty, useProperties } from "@/hooks/useProperties";

interface ModalAddPropertyToUserProps {
  usuarioId: string;
}

const ModalAddPropertyToUser = ({ usuarioId }: ModalAddPropertyToUserProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");

  const { properties, isLoading: isLoadingProperties } = useProperties();
  const addUserToPropertyMutation = useAddUserToProperty();

  const handleAdd = async () => {
    if (!selectedPropertyId) {
      toast.error("Selecione uma propriedade");
      return;
    }

    try {
      await addUserToPropertyMutation.mutateAsync({
        propriedade_id: selectedPropertyId,
        usuario_id: usuarioId,
      });
      toast.success("Usuário adicionado à propriedade com sucesso!");
      setIsModalOpen(false);
      setSelectedPropertyId("");
    } catch (error) {
      toast.error("Erro ao adicionar usuário à propriedade");
      console.error("Erro ao adicionar usuário:", error);
    }
  };

  return (
    <div>
      <AppButton size="sm" onClick={() => setIsModalOpen(true)}>
        <Plus /> Adicionar propriedade
      </AppButton>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar propriedade</DialogTitle>
          </DialogHeader>

          <div className="my-2">
            <Select
              value={selectedPropertyId}
              onValueChange={setSelectedPropertyId}
              disabled={isLoadingProperties}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma propriedade" />
              </SelectTrigger>
              <SelectContent>
                {properties.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhuma propriedade disponível
                  </div>
                ) : (
                  properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.nome}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPropertyId("");
                }}
                disabled={addUserToPropertyMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                onClick={handleAdd}
                disabled={
                  addUserToPropertyMutation.isPending ||
                  !selectedPropertyId ||
                  properties.length === 0
                }
                isLoading={addUserToPropertyMutation.isPending}
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

export default ModalAddPropertyToUser;
