"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import PageHeader from "@/components/PageHeader";
import TankItem from "@/components/TankItem";
import { useTanks } from "@/hooks/useTanks";

import ModalAddTank from "./_components/ModalAddTank";

const Tanks = () => {
  const { tanks, isLoading } = useTanks();

  if (isLoading) {
    return (
      <main className="space-y-5">
        <PageHeader
          title="Tanques de peixes"
          description="Gerencie os tanques de peixes"
        />
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <PageHeader
        title="Tanques de peixes"
        description="Gerencie os tanques de peixes"
      />

      <ModalAddTank />

      <h2 className="text-lg font-semibold">Tanques salvos ({tanks.length})</h2>

      {tanks.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhum tanque cadastrado. Adicione o primeiro tanque!
        </p>
      ) : (
        <div className="space-y-3">
          {tanks.map((tank) => (
            <TankItem
              key={tank.id}
              id={tank.id}
              name={tank.name}
              type={tank.type}
              fish={tank.fish}
              fishCount={tank.fishCount}
              averageWeight={tank.averageWeight}
              tankArea={tank.tankArea}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default Tanks;
