"use client";

import { ChevronRight, User } from "lucide-react";

import { ApiProfile } from "@/types/profile-api-type";

interface ProfileItemProps {
  profile: ApiProfile;
  onClick: (profile: ApiProfile) => void;
}

export const ProfileItem = ({ profile, onClick }: ProfileItemProps) => {
  return (
    <div
      className="flex px-4 py-3 items-center gap-2 border bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors"
      onClick={() => onClick(profile)}
    >
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-medium">{profile.nome}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{profile.usuarios} usuários</span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );
};
