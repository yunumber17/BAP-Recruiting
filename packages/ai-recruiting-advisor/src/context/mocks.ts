/**
 * Mock context providers with realistic sample data. These stand in for the
 * real packages until integration. Swapping them for real adapters is a DI
 * change only — advisors never know the difference.
 */
import type { UUID } from '../models/common.js';
import type {
  ContextProviders, ProfileData, MetricData, RecruitingScoreData, SchoolData,
  TimelineItem, TaskData, CoachContactData, VideoData,
} from './providers.js';

const SAMPLE_PROFILE: ProfileData = {
  playerId: 'demo', firstName: 'Taro', lastName: 'Yamada', graduationYear: 2027,
  primaryPosition: 'SHORTSTOP', secondaryPosition: 'SECOND_BASE', gpa: 3.8,
  heightCm: 180, weightKg: 79, throws: 'R', bats: 'R', state: 'CA',
};

const SAMPLE_METRICS: MetricData[] = [
  { type: 'EXIT_VELOCITY', value: 88, unit: 'mph', measuredAt: '2026-05-01' },
  { type: 'SIXTY_YARD_DASH', value: 7.0, unit: 'sec', measuredAt: '2026-05-01' },
  { type: 'INFIELD_VELOCITY', value: 82, unit: 'mph', measuredAt: '2026-05-01' },
];

export function createMockContextProviders(overrides: Partial<ContextProviders> = {}): ContextProviders {
  const withId = (p: ProfileData, id: UUID): ProfileData => ({ ...p, playerId: id });
  return {
    profile: { async getProfile(id) { return withId(SAMPLE_PROFILE, id); } },
    metrics: { async getMetrics() { return SAMPLE_METRICS; } },
    scores: { async getScores(): Promise<RecruitingScoreData[]> { return []; } }, // engine not wired
    schools: { async getSavedSchools(): Promise<SchoolData[]> { return []; } }, // schools not imported
    timeline: {
      async getTimeline(): Promise<TimelineItem[]> {
        return [
          { phase: 'SOPHOMORE', label: 'Build a highlight reel', done: true },
          { phase: 'SOPHOMORE', label: 'Email 25 coaches', done: false },
          { phase: 'JUNIOR', label: 'Attend 2–3 showcases', done: false },
        ];
      },
    },
    tasks: {
      async getTasks(): Promise<TaskData[]> {
        return [{ id: 't1', text: 'Register with NCAA Eligibility Center', status: 'OPEN' }];
      },
    },
    contacts: { async getContacts(): Promise<CoachContactData[]> { return []; } },
    videos: {
      async getVideos(): Promise<VideoData[]> {
        return [{ id: 'v1', kind: 'HITTING', title: 'Spring 2026 reel' }];
      },
    },
    ...overrides,
  };
}
