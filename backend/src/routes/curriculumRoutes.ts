import { Router } from "express";
import { validateCurriculumInput } from "../curriculum/curriculumValidator";
import { generateCurriculum } from "../curriculum/curriculumEngine";

const router = Router();

router.post("/generate", (req, res) => {
  try {
    const input = validateCurriculumInput(req.body);
    const curriculum = generateCurriculum(input);
    res.json(curriculum);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(400).json({ error: message });
  }
});

export default router;
