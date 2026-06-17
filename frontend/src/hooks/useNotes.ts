import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { notesApi } from "../api/notes";
import type {
  Note,
  NotesFilters,
  CreateNoteInput,
  UpdateNoteInput,
  TagWithCount,
  PaginatedNotes,
} from "../types/note";

export const noteKeys = {
  all: ["notes"] as const,
  lists: () => [...noteKeys.all, "list"] as const,
  list: (filters: Partial<NotesFilters>) =>
    [...noteKeys.lists(), filters] as const,
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
  tags: () => ["tags"] as const,
};

export function useNotes(
  filters: Partial<NotesFilters>
): UseQueryResult<PaginatedNotes> {
  return useQuery({
    queryKey: noteKeys.list(filters),
    queryFn: () => notesApi.list(filters),
  });
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: noteKeys.detail(id ?? ""),
    queryFn: () => notesApi.getById(id!),
    enabled: !!id,
  });
}

export function useTags(): UseQueryResult<TagWithCount[]> {
  return useQuery({
    queryKey: noteKeys.tags(),
    queryFn: () => notesApi.getTags(),
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateNoteInput) => notesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.invalidateQueries({ queryKey: noteKeys.tags() });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNoteInput }) =>
      notesApi.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.detail(id) });

      const previousNote = queryClient.getQueryData<Note>(
        noteKeys.detail(id)
      );

      if (previousNote) {
        queryClient.setQueryData<Note>(noteKeys.detail(id), {
          ...previousNote,
          ...input,
          updatedAt: new Date().toISOString(),
        });
      }

      // Optimistically update list cache
      queryClient.setQueriesData<PaginatedNotes>(
        { queryKey: noteKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((note) =>
              note.id === id
                ? { ...note, ...input, updatedAt: new Date().toISOString() }
                : note
            ),
          };
        }
      );

      return { previousNote };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousNote) {
        queryClient.setQueryData(noteKeys.detail(id), context.previousNote);
      }
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: noteKeys.tags() });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: noteKeys.lists() });

      const snapshots = queryClient.getQueriesData<PaginatedNotes>({
        queryKey: noteKeys.lists(),
      });

      queryClient.setQueriesData<PaginatedNotes>(
        { queryKey: noteKeys.lists() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((note) => note.id !== id),
            pagination: {
              ...old.pagination,
              total: old.pagination.total - 1,
            },
          };
        }
      );

      return { snapshots };
    },
    onError: (_err, _id, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });
      queryClient.invalidateQueries({ queryKey: noteKeys.tags() });
    },
  });
}
