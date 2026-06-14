"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PropertyItemProps {
  id: string;
  nome: string;
  proprietario_nome: string;
}

const PropertyItem = ({ id, nome, proprietario_nome }: PropertyItemProps) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/propriedades/${id}`);
  };

  return (
    <div
      className="flex px-4 py-3 items-center gap-2 border bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
      onClick={handleClick}
    >
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-medium">{nome}</p>
        <p className="text-sm text-muted-foreground">
          Proprietário: {proprietario_nome}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};

export default PropertyItem;
