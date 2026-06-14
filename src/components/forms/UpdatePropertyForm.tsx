import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";

import { useAllUsers } from "@/hooks/useUsers";
import {
  UpdatePropertySchema,
  updatePropertySchema,
} from "@/schemas/property-schema";

import LoadingSpinner from "../LoadingSpinner";
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

interface UpdatePropertyFormProps {
  onSubmit: (data: UpdatePropertySchema) => void;
  id?: string;
  initialValues?: Partial<UpdatePropertySchema>;
}

const UpdatePropertyForm = ({
  onSubmit,
  id,
  initialValues,
}: UpdatePropertyFormProps) => {
  const { data: users, isLoading: isLoadingUsers } = useAllUsers();
  const form = useForm<UpdatePropertySchema>({
    resolver: zodResolver(updatePropertySchema),
    defaultValues: {
      nome: initialValues?.nome || "",
      proprietario_id: initialValues?.proprietario_id || "",
    },
  });

  const { handleSubmit, control } = form;

  const handleFormSubmit = (data: UpdatePropertySchema) => {
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
              <FormLabel>Nome da Propriedade</FormLabel>
              <FormControl>
                <Input placeholder="Nome da propriedade" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="proprietario_id"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Proprietário</FormLabel>
              <FormControl>
                {isLoadingUsers ? (
                  <div className="flex items-center justify-center h-9">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={`w-full 
                        ${
                          fieldState.error
                            ? "border-error focus:border-error focus:ring-error"
                            : ""
                        }
                      `}
                    >
                      <SelectValue placeholder="Selecione o proprietário" />
                    </SelectTrigger>
                    <SelectContent>
                      {users?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default UpdatePropertyForm;
