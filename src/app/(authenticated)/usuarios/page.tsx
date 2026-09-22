"use client";

import { useEffect, useRef } from "react";

import LoadingSpinner from "@/components/LoadingSpinner";
import { OnlineGuard } from "@/components/OnlineGuard";
import PageHeader from "@/components/PageHeader";
import { Protected } from "@/components/Protected";
import UserItem from "@/components/UserItem";
import { useUsers } from "@/hooks/useUsers";

import ModalAddUser from "./_components/ModalAddUser";

const Usuarios = () => {
  const { users, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useUsers();

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Scroll infinito com Intersection Observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <OnlineGuard>
        <main className="space-y-5">
          <PageHeader
            title="Gerenciamento de Usuários"
            description="Gerencie os usuários do sistema"
          />
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </main>
      </OnlineGuard>
    );
  }

  return (
    <OnlineGuard>
      <main className="space-y-5">
        <PageHeader
          title="Gerenciamento de Usuários"
          description="Gerencie os usuários do sistema"
        />

        <Protected permission="USUARIO_CRIAR">
          <ModalAddUser />
        </Protected>

        <h2 className="text-lg font-semibold">
          Usuários salvos ({users.length})
        </h2>

        {users.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum usuário cadastrado. Adicione o primeiro usuário!
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <UserItem
                  key={user.id}
                  id={user.id}
                  nome={user.nome}
                  email={user.email}
                  perfil_nome={user.perfil_nome}
                />
              ))}
            </div>

            {/* Elemento para trigger do scroll infinito */}
            <div
              ref={loadMoreRef}
              className="h-10 flex items-center justify-center"
            >
              {isFetchingNextPage && <LoadingSpinner />}
              {!hasNextPage && users.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Todos os usuários foram carregados
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </OnlineGuard>
  );
};

export default Usuarios;
