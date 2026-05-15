"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  AccountConfigSchema,
  accountConfigSchema,
} from "@/schemas/accountConfig-schema";
import { parseErrorMessage } from "@/utils/error-util";

import AppButton from "../AppButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const AccountConfigForm = () => {
  const { data } = useSession();

  const accountConfig = useForm<AccountConfigSchema>({
    resolver: zodResolver(accountConfigSchema),
    defaultValues: {
      propertyName: "",
      email: data?.user?.email || "",
    },
  });
  const { control, formState, handleSubmit } = accountConfig;

  const handleUpdateAccount = (data: AccountConfigSchema) => {
    console.log("Updating account with data:", data);
    // Implementar lógica de atualização da conta aqui
  };

  return (
    <Form {...accountConfig}>
      <form
        className="space-y-4 w-full"
        onSubmit={handleSubmit(handleUpdateAccount)}
      >
        <FormField
          control={control}
          name="propertyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da propriedade</FormLabel>
              <FormControl>
                <Input placeholder="Pisciconsultoria" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
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
                  placeholder="email@exemplo.com"
                  disabled
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <AppButton
          type="submit"
          className="w-full"
          size="lg"
          isLoading={formState.isSubmitting}
        >
          Salvar
        </AppButton>
      </form>
    </Form>
  );
};

export default AccountConfigForm;
