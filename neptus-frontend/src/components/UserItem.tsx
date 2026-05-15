"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface UserItemProps {
  id: string;
  nome: string;
  email: string;
  perfil_nome?: string;
}

const UserItem = ({ id, nome, email, perfil_nome }: UserItemProps) => {
  return (
    <Link href={`/usuarios/${id}`}>
      <div className="flex px-4 py-3 items-center gap-2 border bg-muted rounded-md hover:bg-muted/80 transition-colors cursor-pointer">
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-medium">{nome}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
          {perfil_nome && (
            <p className="text-xs text-muted-foreground">
              Perfil: {perfil_nome}
            </p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>
    </Link>
  );
};

export default UserItem;
