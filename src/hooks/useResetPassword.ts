import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { resetPassword } from "@/services/auth-service";

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: ["resetPassword"],
    mutationFn: async (data: { password: string; token: string }) => {
      await resetPassword(data.password, data.token);
    },
    onSuccess: () => {
      router.push("/login");
    },
  });
};
