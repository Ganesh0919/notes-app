import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as noteService from "../services/noteService.js";
import type { ListNotesParams } from "../services/noteService.js";
import type { ApiError } from "../types/note.js";

export async function listNotes(req: Request, res: Response): Promise<void> {
  const params = req.query as unknown as ListNotesParams;
  const result = await noteService.listNotes(params);
  res.json(result);
}

export async function getNote(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const note = await noteService.getNoteById(id);
  if (!note) {
    const apiError: ApiError = {
      error: { code: "NOT_FOUND", message: "Note not found" },
    };
    res.status(404).json(apiError);
    return;
  }
  res.json(note);
}

export async function createNote(req: Request, res: Response): Promise<void> {
  const note = await noteService.createNote(uuidv4(), req.body);
  res.status(201).json(note);
}

export async function updateNote(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const note = await noteService.updateNote(id, req.body);
  if (!note) {
    const apiError: ApiError = {
      error: { code: "NOT_FOUND", message: "Note not found" },
    };
    res.status(404).json(apiError);
    return;
  }
  res.json(note);
}

export async function deleteNote(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const deleted = await noteService.deleteNote(id);
  if (!deleted) {
    const apiError: ApiError = {
      error: { code: "NOT_FOUND", message: "Note not found" },
    };
    res.status(404).json(apiError);
    return;
  }
  res.status(204).send();
}

export async function getTags(_req: Request, res: Response): Promise<void> {
  const tags = await noteService.getTagsWithCounts();
  res.json(tags);
}

export async function healthCheck(_req: Request, res: Response): Promise<void> {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}
