import { Router } from "express";
import * as noteController from "../controllers/noteController.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";
import {
  createNoteSchema,
  updateNoteSchema,
  listNotesQuerySchema,
  noteIdParamSchema,
} from "../validators/noteValidators.js";

const router = Router();

router.get("/health", noteController.healthCheck);
router.get("/tags", noteController.getTags);
router.get(
  "/notes",
  validateQuery(listNotesQuerySchema),
  noteController.listNotes
);
router.get(
  "/notes/:id",
  validateParams(noteIdParamSchema),
  noteController.getNote
);
router.post(
  "/notes",
  validateBody(createNoteSchema),
  noteController.createNote
);
router.patch(
  "/notes/:id",
  validateParams(noteIdParamSchema),
  validateBody(updateNoteSchema),
  noteController.updateNote
);
router.delete(
  "/notes/:id",
  validateParams(noteIdParamSchema),
  noteController.deleteNote
);

export default router;
