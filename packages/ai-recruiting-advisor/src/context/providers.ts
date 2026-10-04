/**
 * Context data-provider interfaces. The ContextBuilder depends ONLY on these.
 * Today they're mocked; later each is backed by the real package (backend
 * services / recruiting engine / schools) with NO change to advisors.
 */
import type { UUID } from '../models/common.js';

export interface ProfileData {
  playerId: UUID;
  firstName: string;
  lastName: string;
  graduationYear: number;
  primaryPosition: string;
  secondaryPosition?: string;
  gpa?: number;
  heightCm?: number;
  weightKg?: number;
  throws?: 'R' | 'L';
  bats?: 'R' | 'L' | 'S';
  state?: string;
}

export interface MetricData {
  type: string;
  value: number;
  unit?: string;
  measuredAt?: string;
}

export interface RecruitingScoreData {
  schoolId: UUID;
  overall: number;
  grade: string;
  classification: 'REACH' | 'TARGET' | 'SAFETY';
  confidence: number;
}

export interface SchoolData {
  id: UUID;
  name: string;
  division: string;
  state?: string;
}

export interface TimelineItem {
  phase: string;
  label: string;
  done: boolean;
}

export interface TaskData {
  id: UUID;
  text: string;
  status: 'OPEN' | 'DONE';
  dueDate?: string;
}

export interface CoachContactData {
  id: UUID;
  coachName?: string;
  schoolName?: string;
  status: string;
}

export interface VideoData {
  id: UUID;
  kind: string;
  title?: string;
}

// One provider per domain — mock now, real later.
export interface ProfileProvider { getProfile(playerId: UUID): Promise<ProfileData | null>; }
export interface MetricsProvider { getMetrics(playerId: UUID): Promise<MetricData[]>; }
export interface ScoresProvider { getScores(playerId: UUID): Promise<RecruitingScoreData[]>; }
export interface SchoolsProvider { getSavedSchools(playerId: UUID): Promise<SchoolData[]>; }
export interface TimelineProvider { getTimeline(playerId: UUID): Promise<TimelineItem[]>; }
export interface TasksProvider { getTasks(playerId: UUID): Promise<TaskData[]>; }
export interface CoachContactsProvider { getContacts(playerId: UUID): Promise<CoachContactData[]>; }
export interface VideosProvider { getVideos(playerId: UUID): Promise<VideoData[]>; }

export interface ContextProviders {
  profile: ProfileProvider;
  metrics: MetricsProvider;
  scores: ScoresProvider;
  schools: SchoolsProvider;
  timeline: TimelineProvider;
  tasks: TasksProvider;
  contacts: CoachContactsProvider;
  videos: VideosProvider;
}

/** Which slices an advisor needs — the builder fetches only these. */
export type ContextSlice =
  | 'profile' | 'metrics' | 'scores' | 'schools' | 'timeline' | 'tasks' | 'contacts' | 'videos';

/** Aggregated, read-only player context passed into prompts. */
export interface PlayerContext {
  playerId: UUID;
  profile?: ProfileData | null;
  metrics?: MetricData[];
  scores?: RecruitingScoreData[];
  schools?: SchoolData[];
  timeline?: TimelineItem[];
  tasks?: TaskData[];
  contacts?: CoachContactData[];
  videos?: VideoData[];
}
