"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Edit, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import AppButton from "@/components/AppButton";
import BackButton from "@/components/BackButton";
import UpdateUserForm from "@/components/forms/UpdateUserForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserPropertyItem from "@/components/UserPropertyItem";
import { useDeleteUser, useUpdateUser, useUserById } from "@/hooks/useUsers";
import { UpdateUserSchema } from "@/schemas/user-schema";

import ModalAddPropertyToUser from "./_components/ModalAddPropertyToUser";

const UserDetail = () => {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: user, isLoading, refetch } = useUserById(userId, true);
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleEdit = async (data: UpdateUserSchema) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        data: {
          nome: data.nome,
          email: data.email,
          perfil_id: data.perfil_id,
        },
      });
      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Erro ao atualizar usuário");
      console.error("Erro ao editar usuário:", error);
    }
  };

  const handleEditClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success("Usuário desativado com sucesso!");
      router.push("/usuarios");
    } catch (error) {
      toast.error("Erro ao desativar usuário");
      console.error("Erro ao desativar usuário:", error);
    }
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

  if (!user) {
    return (
      <main className="space-y-5">
        <BackButton />
        <PageHeader
          title="Usuário não encontrado"
          description="O usuário solicitado não foi encontrado"
        />
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <BackButton />

      <PageHeader
        title="Detalhes do Usuário"
        description="Visualize os detalhes do usuário"
      />

      {/* Informações do usuário */}
      <div className="border bg-muted rounded-md p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Nome</p>
            <p className="font-medium">{user.nome}</p>
          </div>
          <div className="flex gap-2">
            <AppButton variant="outline" size="sm" onClick={handleEditClick}>
              <Edit className="w-4 h-4" />
            </AppButton>
            <AppButton
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="hover:border-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </AppButton>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Perfil</p>
          <Badge className="w-fit mt-1">{user.perfil_nome}</Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Criado em</p>
          <p className="font-medium">{formatDate(user.criado_em)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Atualizado em</p>
          <p className="font-medium">{formatDate(user.atualizado_em)}</p>
        </div>
      </div>

      {/* Seção de propriedades */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Propriedades ({user.propriedades?.length || 0})
          </h2>
          <ModalAddPropertyToUser usuarioId={userId} />
        </div>

        {!user.propriedades || user.propriedades.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma propriedade associada a este usuário.
          </p>
        ) : (
          <div className="space-y-3">
            {user.propriedades.map((property) => (
              <UserPropertyItem
                key={property.propriedade_id}
                property={property}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dialog de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>

          <div className="my-2">
            <UpdateUserForm
              onSubmit={handleEdit}
              id="edit-user-form"
              initialValues={{
                nome: user.nome,
                email: user.email,
                perfil_id: user.perfil_id,
              }}
            />
          </div>

          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateUserMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                type="submit"
                form="edit-user-form"
                disabled={updateUserMutation.isPending}
                isLoading={updateUserMutation.isPending}
              >
                Salvar alterações
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar desativação</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja desativar o usuário &ldquo;
              {user.nome}&rdquo;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="grid grid-cols-2 gap-2">
              <AppButton
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteUserMutation.isPending}
              >
                Cancelar
              </AppButton>
              <AppButton
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteUserMutation.isPending}
                isLoading={deleteUserMutation.isPending}
              >
                Desativar
              </AppButton>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default UserDetail;
