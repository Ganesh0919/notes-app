import type { Note, PaginatedNotes, SortField, SortOrder, TagWithCount } from "../types/note.js";
import { query } from "../db/pool.js";

interface NoteRow {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    tags: row.tags ?? [],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const SORT_COLUMNS: Record<SortField, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  title: "title",
};

export interface ListNotesParams {
  search?: string;
  tag?: string;
  sort?: SortField;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export async function listNotes(params: ListNotesParams): Promise<PaginatedNotes> {
  const page = params.page ?? 1;
  const limit = Math.min(params.limit ?? 50, 100);
  const offset = (page - 1) * limit;
  const sortField = params.sort ?? "updatedAt";
  const sortOrder = params.order ?? "desc";
  const sortColumn = SORT_COLUMNS[sortField];
  const orderDir = sortOrder === "asc" ? "ASC" : "DESC";

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (params.search) {
    conditions.push(
      `(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`
    );
    values.push(`%${params.search}%`);
    paramIndex++;
  }

  if (params.tag) {
    conditions.push(`$${paramIndex} = ANY(tags)`);
    values.push(params.tag);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM notes ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await query<NoteRow>(
    `SELECT id, title, content, tags, created_at, updated_at
     FROM notes ${whereClause}
     ORDER BY ${sortColumn} ${orderDir}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return {
    data: dataResult.rows.map(mapRow),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getNoteById(id: string): Promise<Note | null> {
  const result = await query<NoteRow>(
    `SELECT id, title, content, tags, created_at, updated_at FROM notes WHERE id = $1`,
    [id]
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export interface CreateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
}

export async function createNote(
  id: string,
  input: CreateNoteInput
): Promise<Note> {
  const result = await query<NoteRow>(
    `INSERT INTO notes (id, title, content, tags)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, content, tags, created_at, updated_at`,
    [
      id,
      input.title ?? "",
      input.content ?? "",
      input.tags ?? [],
    ]
  );
  return mapRow(result.rows[0]);
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
}

export async function updateNote(
  id: string,
  input: UpdateNoteInput
): Promise<Note | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (input.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(input.title);
  }
  if (input.content !== undefined) {
    fields.push(`content = $${paramIndex++}`);
    values.push(input.content);
  }
  if (input.tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    values.push(input.tags);
  }

  if (fields.length === 0) {
    return getNoteById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<NoteRow>(
    `UPDATE notes SET ${fields.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING id, title, content, tags, created_at, updated_at`,
    values
  );
  return result.rows[0] ? mapRow(result.rows[0]) : null;
}

export async function deleteNote(id: string): Promise<boolean> {
  const result = await query(`DELETE FROM notes WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getTagsWithCounts(): Promise<TagWithCount[]> {
  const result = await query<{ name: string; count: string }>(`
    SELECT unnest(tags) AS name, COUNT(*)::text AS count
    FROM notes
    GROUP BY name
    ORDER BY count DESC, name ASC
  `);
  return result.rows.map((row) => ({
    name: row.name,
    count: parseInt(row.count, 10),
  }));
}
