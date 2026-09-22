import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import { useProfiles } from "@/hooks/useProfiles";
import { UpdateUserSchema, updateUserSchema } from "@/schemas/user-schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface UpdateUserFormProps {
  onSubmit: (data: UpdateUserSchema) => void;
  id?: string;
  initialValues?: Partial<UpdateUserSchema>;
}

const UpdateUserForm = ({
  onSubmit,
  id,
  initialValues,
}: UpdateUserFormProps) => {
  const { profiles, isLoading: isLoadingProfiles } = useProfiles();

  const form = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      nome: initialValues?.nome || "",
      email: initialValues?.email || "",
      perfil_id: initialValues?.perfil_id || "",
    },
  });

  const { handleSubmit, control } = form;

  const handleFormSubmit = (data: UpdateUserSchema) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        id={id}
        className="space-y-4"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <FormField
          control={control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="usuario@email.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="perfil_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingProfiles}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default UpdateUserForm;
