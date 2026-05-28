"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { useInternetConnection } from "@/hooks/useInternetConnection";
import { useLogin } from "@/hooks/useLogin";
import { LoginFormSchema, loginFormSchema } from "@/schemas/login-schema";
import { parseErrorMessage } from "@/utils/error-util";
import react, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import AppButton from "../AppButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

const LoginForm = () => {
  const { mutate: login, isError, error, isPending } = useLogin();
  const { isOnline } = useInternetConnection();
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
              <FormLabel>Senha</FormLabel>
              <FormDescription>
                <Link
                  className="text-muted-foreground hover:text-foreground underline text-xs"
                  href="/recuperar-senha"
                >
                  Esqueci minha senha
                </Link>
              </FormDescription>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Insira sua senha"
                    {...field}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  > 
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
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
