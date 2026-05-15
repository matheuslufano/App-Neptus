"use client";

import { useEffect, useState } from "react";

import InstallAppButton, { InstallInfo } from "@/components/InstallAppButton";
import IOSInstallInfo from "@/components/IOSInstallInfo";
import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserById } from "@/hooks/useUsers";
import { getUserIdFromToken } from "@/utils/jwt-util";

const Configurations = () => {
  const [userId, setUserId] = useState<string | null>(null);

  // Obter ID do usuário do token JWT
  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserIdFromToken();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  // Buscar dados do usuário logado
  const { data: user, isLoading } = useUserById(userId || "", !!userId);

  return (
    <main className="space-y-5">
      <PageHeader
        title="Configurações"
        description="Mantenha os dados atualizados"
      />

      <Tabs defaultValue="conta" className="space-y-5">
        <TabsList className="flex w-full p-0">
          <TabsTrigger value="conta">Conta</TabsTrigger>
          <TabsTrigger value="app">App</TabsTrigger>
        </TabsList>

        <TabsContent value="conta">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          ) : user ? (
            <div className="bg-card rounded-lg p-6 border space-y-4">
              <h3 className="font-semibold text-lg mb-4">
                Informações da Conta
              </h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user.nome}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Perfil</p>
                  <Badge className="w-fit mt-1">{user.perfil_nome}</Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Propriedades ({user.propriedades?.length || 0})
                  </p>
                  {!user.propriedades || user.propriedades.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhuma propriedade associada
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {user.propriedades.map((property) => (
                        <Badge
                          key={property.propriedade_id}
                          variant="outline"
                          className="w-fit"
                        >
                          {property.nome}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg p-6 border">
              <p className="text-muted-foreground text-center">
                Não foi possível carregar as informações da conta
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="app" className="space-y-4">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold text-lg mb-4">Instalação do App</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Instale o Neptus em seu dispositivo para ter acesso rápido e
                  uma experiência melhor.
                </p>
                <div className="flex items-center gap-4">
                  <InstallAppButton variant="default" text="Instalar App" />
                  <InstallInfo />
                </div>
              </div>

              {/* Instruções para Android */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Como instalar no Android:</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Abra o menu do Chrome (⋮) no canto superior direito
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Toque em <strong>&quot;Instalar app&quot;</strong> ou{" "}
                      <strong>&quot;Adicionar à tela inicial&quot;</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Confirme tocando em &quot;Instalar&quot;</span>
                  </li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 Dica: A opção &quot;Instalar app&quot; oferece melhor
                  experiência que &quot;Adicionar à tela inicial&quot;
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">
                  Vantagens do App Instalado:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Acesso rápido pela tela inicial</li>
                  <li>• Funciona offline</li>
                  <li>• Notificações quando disponível</li>
                  <li>• Interface otimizada</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Informações específicas para iOS */}
          <IOSInstallInfo />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Configurations;
