import { Home } from "lucide-react";
import Link from "next/link";

import AppButton from "@/components/AppButton";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Página não encontrada.</h2>
          <p className="text-muted-foreground">
            Ops! A página que você está procurando não existe.
          </p>
        </div>

        <Link href="/" className="w-full flex items-center justify-center">
          <AppButton className="flex items-center gap-2" size="lg">
            <Home className="h-4 w-4" />
            Voltar para o início
          </AppButton>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
