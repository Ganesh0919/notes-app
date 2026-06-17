import { api } from "./client";
import type {
  Note,
  PaginatedNotes,
  TagWithCount,
  NotesFilters,
  CreateNoteInput,
  UpdateNoteInput,
} from "../types/note";

function buildQuery(filters: Partial<NotesFilters> & { page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const notesApi = {
  list: (filters: Partial<NotesFilters> = {}) =>
    api.get<PaginatedNotes>(`/notes${buildQuery(filters)}`),

  getById: (id: string) => api.get<Note>(`/notes/${id}`),

  create: (input: CreateNoteInput) => api.post<Note>("/notes", input),

  update: (id: string, input: UpdateNoteInput) =>
    api.patch<Note>(`/notes/${id}`, input),

  delete: (id: string) => api.delete(`/notes/${id}`),

  getTags: () => api.get<TagWithCount[]>("/tags"),
};
