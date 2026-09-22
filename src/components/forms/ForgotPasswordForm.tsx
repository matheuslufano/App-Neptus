"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { useForgotPassword } from "@/hooks/useForgotPassword";
import {
  ForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/schemas/forgotPassword-schema";
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

const ForgotPasswordForm = () => {
  const [message, setMessage] = useState<string | null>(null);
  const {
    mutate: forgotPassword,
    isError,
    error,
    isPending,
  } = useForgotPassword();

  const forgotPasswordForm = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const { handleSubmit, reset, control, formState } = forgotPasswordForm;

  const handleClick = (data: ForgotPasswordSchema) => {
    if (formState.isSubmitting) {
      setMessage(null);
    }
    forgotPassword(data.email);
    setMessage(
      "Acesse seu email e clique no link enviado para redefinir sua senha",
    );
  };

  return (
    <Form {...forgotPasswordForm}>
      <form className="space-y-4 w-full" onSubmit={handleSubmit(handleClick)}>
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="exemplo@gmail.com"
                  {...field}
                  type="email"
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
          Continuar
        </AppButton>
        {isError && (
          <p className="text-error text-sm text-center">
            {parseErrorMessage(error)}
          </p>
        )}
        {message && (
          <p className="text-success text-sm text-center">{message}</p>
        )}
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
