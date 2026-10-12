import express from 'express';

import {
  getWorksheetById,
  listStandaloneActivityLibrary,
  listWorksheetDefinitions,
  scoreWorksheet,
  submitWorksheetInstance,
} from '../../Services/CurriculumWorksheets/CurriculumWorksheetService.js';

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    res.json(listWorksheetDefinitions());
  } catch (error) {
    next(error);
  }
});

router.get('/standalone/library', (req, res, next) => {
  try {
    res.json(listStandaloneActivityLibrary(req.query));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', (req, res, next) => {
  try {
    res.json(getWorksheetById(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/instances', (req, res, next) => {
  try {
    res.status(201).json(submitWorksheetInstance(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/score', (req, res, next) => {
  try {
    res.json(scoreWorksheet(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
});

export default router;
