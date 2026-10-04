import type { Request, Response } from 'express';
import type { PlayerService } from '../../services/PlayerService.js';
import { ctx } from '../http.js';
import { UnauthorizedError } from '../../errors/index.js';
import type { AuthContext } from '../../auth/index.js';

/** Controllers only read validated input + auth, then call the service. */
export class PlayerController {
  constructor(private readonly players: PlayerService) {}

  private auth(req: Request): AuthContext {
    const a = ctx(req).auth;
    if (!a) throw new UnauthorizedError('Authentication required');
    return a;
  }

  getById = async (req: Request, res: Response): Promise<void> => {
    const player = await this.players.getById(req.params.id);
    res.json(player);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const player = await this.players.create(req.body);
    res.status(201).json(player);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const player = await this.players.update(req.params.id, req.body, this.auth(req));
    res.json(player);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.players.remove(req.params.id, this.auth(req));
    res.status(204).send();
  };
}
