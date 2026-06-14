import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  addUserToProperty,
  createProperty,
  deleteProperty,
  getProperties,
  getPropertyById,
  removeUserFromProperty,
  updateProperty,
} from "@/services/property-service";
import {
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from "@/types/property-api-type";

const ITEMS_PER_PAGE = 10;

export const useProperties = () => {
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
    queryKey: ["properties"],
    queryFn: ({ pageParam = 1 }) => getProperties(pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagina_atual < lastPage.total_paginas) {
        return lastPage.pagina_atual + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten dos dados de todas as páginas, removendo duplicatas por ID
  const allProperties = data?.pages.flatMap((page) => page.propriedades) ?? [];
  const properties = Array.from(
    new Map(allProperties.map((property) => [property.id, property])).values()
  );

  return {
    properties,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
};

export const usePropertyById = (id: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => getPropertyById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyData: CreatePropertyRequest) =>
      createProperty(propertyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePropertyRequest }) =>
      updateProperty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
    },
  });
};

export const useAddUserToProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { propriedade_id: string; usuario_id: string }) =>
      addUserToProperty(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propriedade_id],
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({
        queryKey: ["user", variables.usuario_id],
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useRemoveUserFromProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: { propriedade_id: string; usuario_id: string }) =>
      removeUserFromProperty(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propriedade_id],
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({
        queryKey: ["user", variables.usuario_id],
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
