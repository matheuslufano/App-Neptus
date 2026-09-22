"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import LoadingSpinner from "@/components/LoadingSpinner";
import { OnlineGuard } from "@/components/OnlineGuard";
import PageHeader from "@/components/PageHeader";
import { Protected } from "@/components/Protected";
import { Button } from "@/components/ui/button";
import { useProfiles } from "@/hooks/useProfiles";
import { ApiProfile } from "@/types/profile-api-type";

import { ProfileDialog } from "./_components/ProfileDialog";
import { ProfileItem } from "./_components/ProfileItem";

const PerfisPage = () => {
  const {
    profiles,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProfiles();

  const [selectedProfile, setSelectedProfile] = useState<ApiProfile | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  const handleCreateNew = () => {
    setSelectedProfile(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (profile: ApiProfile) => {
    setSelectedProfile(profile);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <OnlineGuard>
        <main className="space-y-5">
          <PageHeader
            title="Gerenciamento de Perfis"
            description="Gerencie os perfis de acesso do sistema"
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
          title="Gerenciamento de Perfis"
          description="Gerencie os perfis de acesso do sistema"
        />

        <Protected permission="PERFIL_CRIAR">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateNew}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar perfil
          </Button>
        </Protected>

        <h2 className="text-lg font-semibold">
          Perfis salvos ({profiles.length})
        </h2>

        {profiles.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum perfil cadastrado.
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {profiles.map((profile) => (
                <ProfileItem
                  key={profile.id}
                  profile={profile}
                  onClick={handleEdit}
                />
              ))}
            </div>

            <div
              ref={loadMoreRef}
              className="h-10 flex items-center justify-center"
            >
              {isFetchingNextPage && <LoadingSpinner />}
            </div>
          </>
        )}

        <ProfileDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          profile={selectedProfile}
        />
      </main>
    </OnlineGuard>
  );
};

export default PerfisPage;
