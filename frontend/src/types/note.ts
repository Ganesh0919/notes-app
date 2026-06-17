export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TagWithCount {
  name: string;
  count: number;
}

export interface PaginatedNotes {
  data: Note[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export type SortField = "createdAt" | "updatedAt" | "title";
export type SortOrder = "asc" | "desc";

export interface NotesFilters {
  search: string;
  tag: string | null;
  sort: SortField;
  order: SortOrder;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
}
