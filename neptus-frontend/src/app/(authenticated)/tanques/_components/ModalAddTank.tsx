"use client";

import { Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import AddTankForm from "@/components/forms/AddTankForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useTanks } from "@/hooks/useTanks";
import { AddTankSchema } from "@/schemas/addTank-schema";

const ModalAddTank = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addTank } = useTanks();
  const { isOnline } = useInternetConnection();

  const handleAddTank = (data: AddTankSchema) => {
    try {
      addTank(data);
      console.log("Tanque adicionado com sucesso:", data);
      setIsModalOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message.includes("PropertyId")) {
        toast.error(
          "Propriedade não selecionada! É necessário selecionar uma propriedade no Menu lateral antes de adicionar um tanque.",
        );
      } else {
        toast.error("Erro ao adicionar tanque");
      }
      console.error("Erro ao adicionar tanque:", error);
    }
  };

  return (
    <div>
      <AppButton
        className="w-full"
        size="lg"
        onClick={() => setIsModalOpen(true)}
        disabled={!isOnline}
      >
        <Plus /> {isOnline ? "Adicionar tanque" : "Offline (Sem conexão)"}
      </AppButton>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar tanque</DialogTitle>
          </DialogHeader>

          <div className="my-2">
            <AddTankForm onSubmit={handleAddTank} id="add-tank-form" />
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </AppButton>
              <AppButton type="submit" form="add-tank-form">
                Adicionar
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModalAddTank;
