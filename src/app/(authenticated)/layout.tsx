"use client";

import { ReactNode } from "react";

import AuthGuard from "@/components/AuthGuard";
import InitialDataSync from "@/components/InitialDataSync";
import Header from "@/components/layout/Header";
import UserDataInitializer from "@/components/UserDataInitializer";
import { useNeedsInitialSync } from "@/hooks/useNeedsInitialSync";
import { usePropertyStore } from "@/stores/propertyStore";

const LayoutAuthenticated = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const { selectedPropertyId: propertyId } = usePropertyStore();

  const { needsSync, isChecking } = useNeedsInitialSync(propertyId || undefined);

  return (
    <AuthGuard>
      {isChecking ? (
        // Loading state enquanto verifica
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      ) : needsSync && propertyId ? (
        // Mostra tela de sincronização inicial
        <InitialDataSync propertyId={propertyId} />
      ) : (
        // Layout normal
        <>
          <UserDataInitializer />
          <div className="min-h-screen flex flex-col max-w-[430px] mx-auto">
            <Header />
            <main className="flex-1 p-5 w-full">{children}</main>
          </div>
        </>
      )}
    </AuthGuard>
  );
};

export default LayoutAuthenticated;
