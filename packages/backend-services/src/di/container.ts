/**
 * Composition root. Constructor injection everywhere — no singletons reached
 * into from inside modules. `createContainer` wires infra → repositories →
 * services → controllers, and accepts overrides so tests can inject in-memory
 * repos / fakes without touching production wiring.
 */
import type { School } from '../types/models.js';
import type { CacheStore } from '../cache/CacheStore.js';
import { MemoryCache } from '../cache/MemoryCache.js';
import { InMemoryEventBus, type EventBus } from '../events/EventBus.js';
import type { TokenVerifier } from '../auth/index.js';
import { DevTokenVerifier } from '../auth/DevTokenVerifier.js';
import { logger } from '../utils/logger.js';

import type {
  IPlayerRepository, ISchoolRepository, ISavedSchoolRepository,
  IRecruitingScoreRepository, ITaskRepository, INotificationRepository,
  IActivityLogRepository, IAnalyticsRepository,
} from '../repositories/interfaces.js';
import {
  InMemoryPlayerRepository, InMemorySchoolRepository, InMemorySavedSchoolRepository,
  InMemoryRecruitingScoreRepository, InMemoryTaskRepository, InMemoryNotificationRepository,
  InMemoryActivityLogRepository, InMemoryAnalyticsRepository,
} from '../repositories/inmemory/index.js';

import { PlayerService } from '../services/PlayerService.js';
import { SchoolService } from '../services/SchoolService.js';
import { SavedSchoolService } from '../services/SavedSchoolService.js';
import { RecruitingService } from '../services/RecruitingService.js';
import { NotificationService } from '../services/NotificationService.js';
import { TaskService } from '../services/TaskService.js';
import { PendingScoreProvider, type IScoreProvider } from '../services/scoring.js';

import { PlayerController } from '../api/controllers/PlayerController.js';
import { SchoolController } from '../api/controllers/SchoolController.js';
import { SavedSchoolController } from '../api/controllers/SavedSchoolController.js';
import { RecruitingController } from '../api/controllers/RecruitingController.js';

export interface Repositories {
  players: IPlayerRepository;
  schools: ISchoolRepository;
  savedSchools: ISavedSchoolRepository;
  scores: IRecruitingScoreRepository;
  tasks: ITaskRepository;
  notifications: INotificationRepository;
  activity: IActivityLogRepository;
  analytics: IAnalyticsRepository;
}

export interface ContainerOverrides {
  repositories?: Partial<Repositories>;
  cache?: CacheStore;
  eventBus?: EventBus;
  tokenVerifier?: TokenVerifier;
  scoreProvider?: IScoreProvider;
  seedSchools?: School[];
}

export interface Container {
  repositories: Repositories;
  cache: CacheStore;
  eventBus: EventBus;
  tokenVerifier: TokenVerifier;
  services: {
    player: PlayerService;
    school: SchoolService;
    savedSchool: SavedSchoolService;
    recruiting: RecruitingService;
    notification: NotificationService;
    task: TaskService;
  };
  controllers: {
    player: PlayerController;
    school: SchoolController;
    savedSchool: SavedSchoolController;
    recruiting: RecruitingController;
  };
}

export function createContainer(overrides: ContainerOverrides = {}): Container {
  const cache = overrides.cache ?? new MemoryCache();
  const eventBus = overrides.eventBus ?? new InMemoryEventBus(logger);
  const tokenVerifier = overrides.tokenVerifier ?? new DevTokenVerifier();
  const scoreProvider = overrides.scoreProvider ?? new PendingScoreProvider();

  const repositories: Repositories = {
    players: overrides.repositories?.players ?? new InMemoryPlayerRepository(),
    schools: overrides.repositories?.schools ?? new InMemorySchoolRepository(overrides.seedSchools),
    savedSchools: overrides.repositories?.savedSchools ?? new InMemorySavedSchoolRepository(),
    scores: overrides.repositories?.scores ?? new InMemoryRecruitingScoreRepository(),
    tasks: overrides.repositories?.tasks ?? new InMemoryTaskRepository(),
    notifications: overrides.repositories?.notifications ?? new InMemoryNotificationRepository(),
    activity: overrides.repositories?.activity ?? new InMemoryActivityLogRepository(),
    analytics: overrides.repositories?.analytics ?? new InMemoryAnalyticsRepository(),
  };

  const player = new PlayerService(repositories.players, eventBus, cache, repositories.activity);
  const school = new SchoolService(repositories.schools, cache);
  const savedSchool = new SavedSchoolService(repositories.savedSchools, repositories.schools, eventBus);
  const recruiting = new RecruitingService(
    repositories.scores, repositories.players, repositories.schools, scoreProvider, eventBus,
  );
  const notification = new NotificationService(repositories.notifications, eventBus);
  const task = new TaskService(repositories.tasks, eventBus);

  return {
    repositories,
    cache,
    eventBus,
    tokenVerifier,
    services: { player, school, savedSchool, recruiting, notification, task },
    controllers: {
      player: new PlayerController(player),
      school: new SchoolController(school),
      savedSchool: new SavedSchoolController(savedSchool),
      recruiting: new RecruitingController(recruiting),
    },
  };
}
