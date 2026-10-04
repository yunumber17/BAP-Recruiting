import type { Request, Response } from 'express';
import type { RecruitingService } from '../../services/RecruitingService.js';
import { ctx } from '../http.js';
import { UnauthorizedError } from '../../errors/index.js';
import type { AuthContext } from '../../auth/index.js';

export class RecruitingController {
  constructor(private readonly recruiting: RecruitingService) {}

  private auth(req: Request): AuthContext {
    const a = ctx(req).auth;
    if (!a) throw new UnauthorizedError('Authentication required');
    return a;
  }

  listForPlayer = async (req: Request, res: Response): Promise<void> => {
    res.json({ items: await this.recruiting.listForPlayer(req.params.playerId, this.auth(req)) });
  };

  compute = async (req: Request, res: Response): Promise<void> => {
    const { playerId, schoolId } = req.body as { playerId: string; schoolId: string };
    res.status(201).json(await this.recruiting.computeAndStore(playerId, schoolId, this.auth(req)));
  };
}
