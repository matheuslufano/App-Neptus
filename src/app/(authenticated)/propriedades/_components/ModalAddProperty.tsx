"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import CreatePropertyForm from "@/components/forms/CreatePropertyForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateProperty } from "@/hooks/useProperties";
import { CreatePropertySchema } from "@/schemas/property-schema";

const ModalAddProperty = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createPropertyMutation = useCreateProperty();

  const handleAddProperty = async (data: CreatePropertySchema) => {
    try {
      await createPropertyMutation.mutateAsync({
        nome: data.nome,
        proprietario_id: data.proprietario_id,
      });
      toast.success("Propriedade criada com sucesso!");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Erro ao criar propriedade");
      console.error("Erro ao adicionar propriedade:", error);
    }
  };

  return (
    <div>
      <AppButton
        className="w-full"
        size="lg"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus /> Adicionar propriedade
      </AppButton>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar propriedade</DialogTitle>
          </DialogHeader>

          <div className="my-2">
            <CreatePropertyForm
              onSubmit={handleAddProperty}
              id="add-property-form"
            />
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={createPropertyMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                type="submit"
                form="add-property-form"
                disabled={createPropertyMutation.isPending}
                isLoading={createPropertyMutation.isPending}
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

export default ModalAddProperty;

