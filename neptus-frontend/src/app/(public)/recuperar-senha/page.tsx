import Link from "next/link";

import BackButton from "@/components/BackButton";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="flex flex-col items-center p-5 gap-6 max-w-[430px] mx-auto">
      <BackButton />
      <div className="flex flex-col items-center px-10">
        <h1 className="font-semibold text-2xl">Recuperação de senha</h1>
        <p className="text-center text-muted-foreground text-sm">
          Insira o email da conta
        </p>
      </div>

      <ForgotPasswordForm />

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

export default ForgotPasswordPage;
