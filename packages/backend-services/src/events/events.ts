/** Strongly-typed domain event map. Add new events here. */
import type { UUID } from '../types/common.js';

export interface DomainEvents {
  PlayerCreated: { playerId: UUID; userId: UUID };
  PlayerUpdated: { playerId: UUID };
  MetricsUpdated: { playerId: UUID; metricIds: UUID[] };
  VideoUploaded: { playerId: UUID; videoId: UUID };
  SchoolSaved: { playerId: UUID; schoolId: UUID };
  RecruitingScoreCalculated: { playerId: UUID; schoolId: UUID; overall: number };
  NotificationSent: { userId: UUID; notificationId: UUID };
  TaskCompleted: { playerId: UUID; taskId: UUID };
  CoachContacted: { playerId: UUID; contactId: UUID };
}

export type DomainEventName = keyof DomainEvents;
