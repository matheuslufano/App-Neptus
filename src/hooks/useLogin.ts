import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import { LoginFormSchema } from "@/schemas/login-schema";

export const useLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (data: LoginFormSchema) => {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!result?.ok) {
        throw new Error(result?.error || "Email ou senha inválidos");
      }

      router.push("/");
    },
  });
};
