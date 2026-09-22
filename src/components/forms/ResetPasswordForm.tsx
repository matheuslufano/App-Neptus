"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useResetPassword } from "@/hooks/useResetPassword";
import {
  ResetPasswordSchema,
  resetPasswordSchema,
} from "@/schemas/resetPassword-schema";
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

const ResetPasswordForm = () => {
  const [error, setError] = useState<string | null>(null);
  const token = useSearchParams().get("token");
  const {
    mutate: resetPassword,
    isError,
    error: errorResetPassword,
    isPending,
  } = useResetPassword();

  const resetPasswordForm = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });
  const { handleSubmit, reset, control, formState } = resetPasswordForm;

  const handleClick = (data: ResetPasswordSchema) => {
    if (!token) {
      setError("Token inválido, tente acessar o link novamente");
      reset();
      return;
    }
    resetPassword(
      { password: data.password, token },
      {
        onError: () => {
          reset();
          setError(parseErrorMessage(errorResetPassword));
        },
      },
    );
  };

  return (
    <Form {...resetPasswordForm}>
      <form className="space-y-4 w-full" onSubmit={handleSubmit(handleClick)}>
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  placeholder="Insira sua nova senha"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmação de senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Insira a senha novamente"
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
          isLoading={formState.isSubmitting || isPending}
        >
          Redefinir senha
        </AppButton>
        {isError && (
          <p className="text-error text-sm text-center">
            {parseErrorMessage(error)}
          </p>
        )}
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
