"use client";

import { CheckCircle, Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { syncManager } from "@/lib/sync/manager";

interface InitialDataSyncProps {
  propertyId: string;
  onComplete?: () => void;
}

/**
 * Componente para sincronização inicial de dados
 * Exibido na primeira vez que o usuário acessa o app
 */
export default function InitialDataSync({
  propertyId,
  onComplete,
}: InitialDataSyncProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [progress, setProgress] = useState({
    tanks: 0,
    readings: 0,
  });

  const handleSync = async () => {
    if (!session?.access_token) {
      toast.error("Você precisa estar logado");
      return;
    }

    setStatus("syncing");
    toast.loading("Baixando dados do servidor...", { id: "initial-sync" });

    try {
      // Configura credenciais
      syncManager.setCredentials(session.access_token, propertyId);

      // Executa sincronização inicial
      const result = await syncManager.initialSync();

      if (result.success) {
        setProgress({
          tanks: result.tanks,
          readings: result.readings,
        });
        setStatus("success");

        toast.success(
          `Dados sincronizados! ${result.tanks} tanques e ${result.readings} leituras.`,
          { id: "initial-sync" }
        );

        // Marca que já fez sincronização inicial
        localStorage.setItem("hasInitialSync", "true");

        // Aguarda 2s e redireciona
        setTimeout(() => {
          onComplete?.();
          router.push("/");
        }, 2000);
      } else {
        setStatus("error");
        toast.error(result.error || "Erro ao sincronizar dados", {
          id: "initial-sync",
        });
      }
    } catch (error) {
      console.error("Erro durante sincronização inicial:", error);
      setStatus("error");
      toast.error("Erro ao sincronizar dados", { id: "initial-sync" });
    }
  };

  // Auto-inicia se estiver logado
  useEffect(() => {
    if (session?.access_token && status === "idle") {
      handleSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="max-w-md w-full mx-4 p-8 bg-card rounded-lg shadow-lg border">
        <div className="text-center space-y-6">
          {/* Ícone */}
          <div className="flex justify-center">
            {status === "idle" && (
              <Download className="w-16 h-16 text-primary animate-pulse" />
            )}
            {status === "syncing" && (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {status === "error" && (
              <Download className="w-16 h-16 text-red-500" />
            )}
          </div>

          {/* Título */}
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {status === "idle" && "Preparando seus dados"}
              {status === "syncing" && "Baixando dados"}
              {status === "success" && "Tudo pronto!"}
              {status === "error" && "Erro na sincronização"}
            </h2>
            <p className="text-muted-foreground">
              {status === "idle" &&
                "Aguarde enquanto sincronizamos seus dados..."}
              {status === "syncing" &&
                "Baixando tanques e histórico de leituras..."}
              {status === "success" &&
                "Seus dados foram sincronizados com sucesso!"}
              {status === "error" &&
                "Não foi possível sincronizar os dados. Tente novamente."}
            </p>
          </div>

          {/* Progresso */}
          {status === "success" && (
            <div className="bg-muted p-4 rounded-lg text-sm">
              <div className="flex justify-between mb-2">
                <span>Tanques:</span>
                <span className="font-semibold">{progress.tanks}</span>
              </div>
              <div className="flex justify-between">
                <span>Leituras:</span>
                <span className="font-semibold">{progress.readings}</span>
              </div>
            </div>
          )}

          {/* Botão de retry */}
          {status === "error" && (
            <Button onClick={handleSync} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Tentar novamente
            </Button>
          )}

          {/* Loading indicator */}
          {status === "syncing" && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Isso pode levar alguns segundos...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
