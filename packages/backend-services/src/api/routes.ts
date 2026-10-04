import { Router } from 'express';
import type { Container } from '../di/container.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authGuard } from '../middleware/authGuard.js';
import {
  idParam, createPlayerBody, updatePlayerBody, schoolSearchQuery, schoolCompareQuery,
  createSavedSchoolBody, updateSavedSchoolBody, savedSchoolIdParams,
  computeScoreBody, playerScoresParams,
} from '../validators/index.js';

/** Wires REST endpoints to controllers with per-route validation + auth. */
export function buildRoutes(c: Container): Router {
  const r = Router();
  const auth = () => authGuard(c.tokenVerifier);

  // Players
  r.get('/players/:id', validate({ params: idParam }), asyncHandler(c.controllers.player.getById));
  r.post('/players', validate({ body: createPlayerBody }), asyncHandler(c.controllers.player.create));
  r.patch('/players/:id', auth(), validate({ params: idParam, body: updatePlayerBody }), asyncHandler(c.controllers.player.update));
  r.delete('/players/:id', auth(), validate({ params: idParam }), asyncHandler(c.controllers.player.remove));

  // Schools (read-only; may be public)
  r.get('/schools/search', validate({ query: schoolSearchQuery }), asyncHandler(c.controllers.school.search));
  r.get('/schools/compare', validate({ query: schoolCompareQuery }), asyncHandler(c.controllers.school.compare));
  r.get('/schools/:id', validate({ params: idParam }), asyncHandler(c.controllers.school.getById));

  // Saved schools
  r.get('/saved-schools', auth(), asyncHandler(c.controllers.savedSchool.list));
  r.post('/saved-schools', auth(), validate({ body: createSavedSchoolBody }), asyncHandler(c.controllers.savedSchool.create));
  r.patch('/saved-schools/:id', auth(), validate({ params: idParam, body: updateSavedSchoolBody }), asyncHandler(c.controllers.savedSchool.update));
  r.delete('/saved-schools/:id', auth(), validate({ params: savedSchoolIdParams.pick({ id: true }), body: updateSavedSchoolBody.pick({ playerId: true }) }), asyncHandler(c.controllers.savedSchool.remove));

  // Recruiting
  r.get('/recruiting/player/:playerId', auth(), validate({ params: playerScoresParams }), asyncHandler(c.controllers.recruiting.listForPlayer));
  r.post('/recruiting/score', auth(), validate({ body: computeScoreBody }), asyncHandler(c.controllers.recruiting.compute));

  return r;
}
