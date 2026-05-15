"use client";

import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

import { useTanks } from "@/hooks/useTanks";
import { AddTankSchema } from "@/schemas/addTank-schema";

import AppButton from "./AppButton";
import AddTankForm from "./forms/AddTankForm";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export interface TankItemProps {
  id: string;
  name: string;
  type: string;
  fish: string;
  fishCount: number;
  averageWeight: number;
  tankArea: number;
}

const TankItem = ({
  id,
  name,
  type,
  fish,
  fishCount,
  averageWeight,
  tankArea,
}: TankItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { updateTank, deleteTank } = useTanks();

  // Função para capitalizar a primeira letra
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const handleDelete = () => {
    try {
      deleteTank(id);
      console.log(`Tanque deletado: ${name}`);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao deletar tanque:", error);
    }
  };

  const handleEdit = (data: AddTankSchema) => {
    try {
      updateTank(id, data);
      console.log(`Tanque editado: ${name}`, data);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro ao editar tanque:", error);
    }
  };

  return (
    <>
      <div className="flex px-4 py-3 items-center gap-2 border bg-muted rounded-md">
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <p className="font-medium">{name}</p>
            <div className="flex gap-1 mt-1">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <div>
                  <Badge variant={"outline"}>{fishCount} peixes</Badge>
                </div>
                <div>
                  <Badge variant={"outline"}>
                    {averageWeight.toLocaleString("pt-BR")} kg médio
                  </Badge>
                </div>
                <div>
                  <Badge variant={"outline"}>
                    {tankArea.toLocaleString("pt-BR")} m²
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge>{capitalize(type)}</Badge>
            <Badge className="bg-muted-foreground">{capitalize(fish)}</Badge>
          </div>
        </div>
        <AppButton
          variant="outline"
          size="icon"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit />
        </AppButton>
        <AppButton
          variant="outline"
          size="icon"
          className="focus:border-destructive focus:text-destructive hover:border-destructive hover:text-destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 />
        </AppButton>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir o tanque &ldquo;{name}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </AppButton>
              <AppButton variant="destructive" onClick={handleDelete}>
                Excluir
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tanque</DialogTitle>
          </DialogHeader>

          <div className="my-2">
            <AddTankForm
              onSubmit={handleEdit}
              id="edit-tank-form"
              initialValues={{
                name,
                type,
                fish,
                fishCount,
                averageWeight,
                tankArea,
              }}
            />
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </AppButton>
              <AppButton type="submit" form="edit-tank-form">
                Salvar alterações
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TankItem;
