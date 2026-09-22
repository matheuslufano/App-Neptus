"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import UpdatePropertyForm from "@/components/forms/UpdatePropertyForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import PropertyUserItem from "@/components/PropertyUserItem";
import { Protected } from "@/components/Protected";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePropertyById, useUpdateProperty } from "@/hooks/useProperties";
import { UpdatePropertySchema } from "@/schemas/property-schema";

import ModalAddUserToProperty from "./_components/ModalAddUserToProperty";

const PropertyDetail = () => {
  const params = useParams();
  const propertyId = params.id as string;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    data: property,
    isLoading,
    refetch,
  } = usePropertyById(propertyId, true);
  const updatePropertyMutation = useUpdateProperty();

  const handleEdit = async (data: UpdatePropertySchema) => {
    try {
      await updatePropertyMutation.mutateAsync({
        id: propertyId,
        data: {
          nome: data.nome,
          proprietario_id: data.proprietario_id,
        },
      });
      toast.success("Propriedade atualizada com sucesso!");
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar propriedade");
      console.error("Erro ao editar propriedade:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    try {
      // A data vem no formato "23/10/2025 22:32:45"
      const [datePart, timePart] = dateString.split(" ");
      const [day, month, year] = datePart.split("/");
      const [hour, minute] = timePart ? timePart.split(":") : ["00", "00"];

      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );

      return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      // Se falhar, retorna a data original
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-5">
        <BackButton />

        <div className="flex justify-center items-center">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  if (!property) {
    return (
      <main className="space-y-5">
        <BackButton />
        <PageHeader
          title="Propriedade não encontrada"
          description="A propriedade solicitada não foi encontrada"
        />
      </main>
    );
  }

  const usuariosExistentes = property.usuarios?.map((u) => u.id) || [];

  return (
    <main className="space-y-5">
      <BackButton />

      <PageHeader
        title="Detalhes da Propriedade"
        description="Visualize os detalhes da propriedade"
      />

      {/* Informações da propriedade */}
      <div className="border bg-muted rounded-md p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{property.nome}</p>
          </div>
          <Protected
            allPermissions={["PROPRIEDADE_EDITAR", "PROPRIEDADE_DETALHAR"]}
          >
            <AppButton variant="outline" size="sm" onClick={handleEditClick}>
              <Edit className="w-4 h-4" />
            </AppButton>
          </Protected>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Proprietário</p>
          <p className="font-medium">{property.proprietario_nome}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Criado em</p>
          <p className="font-medium">{formatDate(property.criado_em)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Atualizado em</p>
          <p className="font-medium">{formatDate(property.atualizado_em)}</p>
        </div>
      </div>

      {/* Seção de usuários */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Usuários ({property.usuarios?.length || 0})
          </h2>
          <Protected
            allPermissions={["PROPRIEDADE_EDITAR", "PROPRIEDADE_DETALHAR"]}
          >
            <ModalAddUserToProperty
              propriedadeId={propertyId}
              usuariosExistentes={usuariosExistentes}
            />
          </Protected>
        </div>

        {!property.usuarios || property.usuarios.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum usuário associado a esta propriedade.
          </p>
        ) : (
          <div className="space-y-3">
            {property.usuarios.map((user) => (
              <PropertyUserItem
                key={user.id}
                user={user}
                propriedadeId={propertyId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar propriedade</DialogTitle>
          </DialogHeader>

          <div className="my-2">
            <UpdatePropertyForm
              onSubmit={handleEdit}
              id="edit-property-form"
              initialValues={{
                nome: property.nome,
                proprietario_id: property.proprietario_id,
              }}
            />
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updatePropertyMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                type="submit"
                form="edit-property-form"
                disabled={updatePropertyMutation.isPending}
                isLoading={updatePropertyMutation.isPending}
              >
                Salvar alterações
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default PropertyDetail;
