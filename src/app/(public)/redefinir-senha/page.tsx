import Link from "next/link";
import { Suspense } from "react";

import BackButton from "@/components/BackButton";
import ResetPasswordForm from "@/components/forms/ResetPasswordForm";
import LoadingSpinner from "@/components/LoadingSpinner";

const ResetPasswordPage = () => {
  return (
    <div className="flex flex-col items-center p-5 gap-6 max-w-[430px] mx-auto">
      <BackButton />
      <div className="flex flex-col items-center px-10">
        <h1 className="font-semibold text-2xl">Redefinição de senha</h1>
        <p className="text-center text-muted-foreground text-sm">
          Crie uma nova senha forte para sua conta
        </p>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <ResetPasswordForm />
      </Suspense>

      <p className="text-muted-foreground text-sm">
        Já possui uma conta?{" "}
        <Link
          href="/login"
          className="text-primary hover:text-foreground underline"
        >
          Entre
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
