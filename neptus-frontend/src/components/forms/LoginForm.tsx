"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useLogin } from "@/hooks/useLogin";
import { LoginFormSchema, loginFormSchema } from "@/schemas/login-schema";
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

const LoginForm = () => {
  const { mutate: login, isError, error, isPending } = useLogin();
  const { isOnline } = useInternetConnection();

  const loginForm = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { handleSubmit, reset, control, formState } = loginForm;

  const handleLogin = async (data: LoginFormSchema) => {
    login(data, { onError: () => reset() });
  };

  return (
    <Form {...loginForm}>
      <form className="space-y-4 w-full" onSubmit={handleSubmit(handleLogin)}>
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

        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex justify-between">
                <span>Senha</span>
                <Link
                  className="text-muted-foreground hover:text-foreground underline"
                  href="/recuperar-senha"
                >
                  Esqueci minha senha
                </Link>
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Insira sua senha"
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
          disabled={!isOnline || formState.isSubmitting || isPending}
        >
          {!isOnline ? "Sem conexão" : "Entrar"}
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

export default LoginForm;
