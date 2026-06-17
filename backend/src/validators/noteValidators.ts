import { z } from "zod";

export const createNoteSchema = z.object({
  title: z
    .string()
    .max(500, "Title must be 500 characters or fewer")
    .optional()
    .default(""),
  content: z.string().optional().default(""),
  tags: z
    .array(z.string().trim().min(1, "Tags cannot be empty").max(50))
    .max(20, "Maximum 20 tags allowed")
    .optional()
    .default([]),
});

export const updateNoteSchema = z
  .object({
    title: z.string().max(500, "Title must be 500 characters or fewer").optional(),
    content: z.string().optional(),
    tags: z
      .array(z.string().trim().min(1, "Tags cannot be empty").max(50))
      .max(20, "Maximum 20 tags allowed")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export const listNotesQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(["createdAt", "updatedAt", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const noteIdParamSchema = z.object({
  id: z.string().uuid("Invalid note ID format"),
});
