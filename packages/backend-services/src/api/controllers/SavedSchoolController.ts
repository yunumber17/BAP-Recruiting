import type { Request, Response } from 'express';
import type { SavedSchoolService } from '../../services/SavedSchoolService.js';
import { ctx } from '../http.js';
import { UnauthorizedError } from '../../errors/index.js';
import type { AuthContext } from '../../auth/index.js';

export class SavedSchoolController {
  constructor(private readonly saved: SavedSchoolService) {}

  private auth(req: Request): AuthContext {
    const a = ctx(req).auth;
    if (!a) throw new UnauthorizedError('Authentication required');
    return a;
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const auth = this.auth(req);
    const playerId = auth.playerId ?? auth.userId;
    res.json({ items: await this.saved.list(playerId, auth) });
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const saved = await this.saved.save(req.body, this.auth(req));
    res.status(201).json(saved);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { playerId, ...patch } = req.body as { playerId: string } & Record<string, unknown>;
    res.json(await this.saved.update(id, playerId, patch, this.auth(req)));
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { playerId } = req.body as { playerId: string };
    await this.saved.remove(id, playerId, this.auth(req));
    res.status(204).send();
  };
}
