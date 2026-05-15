"use client";

import { WifiOff } from "lucide-react";
import Image from "next/image";

import LoginForm from "@/components/forms/LoginForm";
import { useInternetConnection } from "@/hooks/useInternetConnection";

const LoginPage = () => {
  const { isOnline } = useInternetConnection();

  return (
    <div className="flex flex-col items-center p-5 gap-6 max-w-[430px] mx-auto">
      <div className="flex flex-col items-center px-10">
        <Image
          src="/images/logo-vertical-light.svg"
          alt="Logo Neptus"
          className="w-[120px] h-auto py-6"
          width="0"
          height="0"
          priority
        />
        <h1 className="font-semibold text-2xl">Entre em sua conta</h1>
        <p className="text-center text-muted-foreground text-sm">
          Insira seu email e senha abaixo para entrar em sua conta, ou
          cadastre-se
        </p>
      </div>

      {/* Aviso quando está offline na primeira vez */}
      {!isOnline && (
        <div className="w-full max-w-md p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">
                Conexão necessária
              </h3>
              <p className="text-sm text-amber-800">
                Para fazer login pela primeira vez, você precisa estar conectado
                à internet. Por favor, verifique sua conexão e tente novamente.
              </p>
            </div>
          </div>
        </div>
      )}

      <LoginForm />
    </div>
  );
};

export default LoginPage;
