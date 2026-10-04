import type { Request, Response } from 'express';
import type { SchoolService } from '../../services/SchoolService.js';

export class SchoolController {
  constructor(private readonly schools: SchoolService) {}

  getById = async (req: Request, res: Response): Promise<void> => {
    res.json(await this.schools.getById(req.params.id));
  };

  search = async (req: Request, res: Response): Promise<void> => {
    const q = req.query as unknown as {
      page: number; pageSize: number; q?: string;
      division?: 'D1' | 'D2' | 'D3' | 'NAIA' | 'JUCO';
      region?: 'WEST' | 'MIDWEST' | 'SOUTH' | 'NORTHEAST';
      state?: string;
    };
    const result = await this.schools.search(
      { q: q.q, division: q.division, region: q.region, state: q.state },
      { page: q.page, pageSize: q.pageSize },
    );
    res.json(result);
  };

  compare = async (req: Request, res: Response): Promise<void> => {
    const { ids } = req.query as unknown as { ids: string[] };
    res.json({ schools: await this.schools.compare(ids) });
  };
}
