import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
} from "@/services/user-service";
import {
  ApiUser,
  CreateUserRequest,
  UpdateUserRequest,
} from "@/types/user-api-type";

const ITEMS_PER_PAGE = 10;

export const useUsers = () => {
  // Query infinita para listagem com paginação
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["users"],
    queryFn: ({ pageParam = 1 }) => getUsers(pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagina_atual < lastPage.total_paginas) {
        return lastPage.pagina_atual + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten dos dados de todas as páginas, removendo duplicatas por ID
  const allUsers = data?.pages.flatMap((page) => page.usuarios) ?? [];
  const users = Array.from(
    new Map(allUsers.map((user) => [user.id, user])).values()
  );

  return {
    users,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
};

export const useUserById = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Hook para buscar todos os usuários (sem paginação) para uso em selects
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      // Busca todas as páginas de usuários
      let allUsers: ApiUser[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await getUsers(page, 100); // Busca 100 por vez
        allUsers = [...allUsers, ...response.usuarios];
        hasMore = page < response.total_paginas;
        page++;
      }

      return allUsers;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });
};
