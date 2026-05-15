"use client";

import { useEffect, useRef } from "react";

import LoadingSpinner from "@/components/LoadingSpinner";
import { OnlineGuard } from "@/components/OnlineGuard";
import PageHeader from "@/components/PageHeader";
import PropertyItem from "@/components/PropertyItem";
import { Protected } from "@/components/Protected";
import { useProperties } from "@/hooks/useProperties";

import ModalAddProperty from "./_components/ModalAddProperty";

const Propriedades = () => {
  const {
    properties,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProperties();

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
            title="Gerenciamento de Propriedades"
            description="Gerencie as propriedades do sistema"
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
          title="Gerenciamento de Propriedades"
          description="Gerencie as propriedades do sistema"
        />

        <Protected permission="PROPRIEDADE_CRIAR">
          <ModalAddProperty />
        </Protected>

        <h2 className="text-lg font-semibold">
          Propriedades salvas ({properties.length})
        </h2>

        {properties.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma propriedade cadastrada. Adicione a primeira propriedade!
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {properties.map((property) => (
                <PropertyItem
                  key={property.id}
                  id={property.id}
                  nome={property.nome}
                  proprietario_nome={property.proprietario_nome}
                />
              ))}
            </div>

            {/* Elemento para trigger do scroll infinito */}
            <div
              ref={loadMoreRef}
              className="h-10 flex items-center justify-center"
            >
              {isFetchingNextPage && <LoadingSpinner />}
              {!hasNextPage && properties.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Todas as propriedades foram carregadas
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </OnlineGuard>
  );
};

export default Propriedades;
