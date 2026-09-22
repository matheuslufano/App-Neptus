import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "@/services/auth-service";

export const useForgotPassword = () =>
  useMutation({
    mutationKey: ["forgotPassword"],
    mutationFn: async (email: string) => {
      await forgotPassword(email);
    },
  });
