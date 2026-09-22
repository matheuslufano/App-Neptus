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
import { useProperties } from "@/hooks/useProperties";
import { useTanks } from "@/hooks/useTanks";
import { AddTankSchema } from "@/schemas/addTank-schema";
import { usePropertyStore } from "@/stores/propertyStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ModalAddTank = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyId, setPropertyId] = useState("");
  const { addTank } = useTanks();
  const { isOnline } = useInternetConnection();
  const { selectedPropertyId, setSelectedPropertyId } = usePropertyStore();
  const { properties, isLoading: isLoadingProperties } = useProperties();

  const handleOpenModal = () => {
    setPropertyId(selectedPropertyId ?? "");
    setIsModalOpen(true);
  };

  const handleAddTank = async (data: AddTankSchema) => {
    if (!propertyId) {
      toast.error("Selecione a propriedade onde o tanque será cadastrado.");
      return;
    }

    try {
      setSelectedPropertyId(propertyId);
      await addTank(data, propertyId);
      toast.success("Tanque adicionado com sucesso");
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
        onClick={handleOpenModal}
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
            <div className="mb-4 space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="tank-property-select"
              >
                Propriedade
              </label>
              <Select
                value={propertyId}
                onValueChange={setPropertyId}
                disabled={isLoadingProperties || properties.length === 0}
              >
                <SelectTrigger id="tank-property-select" className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingProperties
                        ? "Carregando propriedades..."
                        : "Selecione uma propriedade"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isLoadingProperties && properties.length === 0 && (
                <p className="text-sm text-destructive">
                  Nenhuma propriedade disponível. Crie uma propriedade antes de cadastrar um tanque.
                </p>
              )}
            </div>
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
