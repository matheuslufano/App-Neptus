import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createProfile,
  deleteProfile,
  getProfileById,
  getProfiles,
  updateProfile,
} from "@/services/profile-service";
import {
  CreateProfileRequest,
  UpdateProfileRequest,
} from "@/types/profile-api-type";

const ITEMS_PER_PAGE = 50; // API default as per prompt example

export const useProfiles = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["profiles"],
    queryFn: ({ pageParam = 1 }) => getProfiles(pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagina_atual < lastPage.total_paginas) {
        return lastPage.pagina_atual + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const allProfiles = data?.pages.flatMap((page) => page.perfis) ?? [];
  const profiles = Array.from(
    new Map(allProfiles.map((p) => [p.id, p])).values()
  );

  return {
    profiles,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
};

export const useProfileById = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => getProfileById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileRequest) => createProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileRequest }) =>
      updateProfile(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile", variables.id] });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
};
