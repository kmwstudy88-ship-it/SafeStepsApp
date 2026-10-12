import express from 'express';

import {
  computeNextWorksheetsForUser,
  getUserCurriculumState,
} from '../../Services/CurriculumWorksheets/CurriculumWorksheetService.js';

const router = express.Router();

router.get('/:id/curriculum', (req, res, next) => {
  try {
    res.json(getUserCurriculumState(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/curriculum/next', (req, res, next) => {
  try {
    res.json(computeNextWorksheetsForUser(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

export default router;
