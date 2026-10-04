import type { Pagination, Paginated, UUID } from '../types/common.js';
import type { School, SchoolSearchFilters } from '../types/models.js';
import type { ISchoolRepository } from '../repositories/interfaces.js';
import type { CacheStore } from '../cache/CacheStore.js';
import { cacheKey } from '../cache/CacheStore.js';
import { NotFoundError, ValidationError } from '../errors/index.js';

/**
 * School reads. NOTE: does not assume the Schools table is populated — search
 * returns an empty page gracefully, and `compare` validates the id set.
 */
export class SchoolService {
  private readonly ttl = 300; // schools change rarely

  constructor(
    private readonly schools: ISchoolRepository,
    private readonly cache: CacheStore,
  ) {}

  async getById(id: UUID): Promise<School> {
    const key = cacheKey('school', id);
    const cached = await this.cache.get<School>(key);
    if (cached) return cached;
    const school = await this.schools.findById(id);
    if (!school) throw new NotFoundError('School', id);
    await this.cache.set(key, school, this.ttl);
    return school;
  }

  async search(filters: SchoolSearchFilters, page: Pagination): Promise<Paginated<School>> {
    return this.schools.search(filters, page);
  }

  /** Side-by-side comparison. Returns schools in the requested order. */
  async compare(ids: readonly UUID[]): Promise<School[]> {
    if (ids.length < 2) throw new ValidationError('Provide at least two schools to compare');
    if (ids.length > 5) throw new ValidationError('Compare at most five schools at once');
    const found = await this.schools.findManyByIds(ids);
    const byId = new Map(found.map((s) => [s.id, s]));
    const ordered = ids.map((id) => byId.get(id)).filter((s): s is School => !!s);
    if (ordered.length !== ids.length) throw new NotFoundError('School', 'one or more ids');
    return ordered;
  }

  async total(): Promise<number> {
    return this.schools.count();
  }
}
