/**
 * Seed data — a minimal but realistic slice for local dev / CI.
 * Idempotent: uses upserts keyed on natural unique fields where possible.
 *
 *   npm run seed        # (prisma db seed → tsx prisma/seed.ts)
 */
import { PrismaClient, Role, Division, Region, Position, Hand, BattingSide,
  CoachType, MetricType, VideoKind, RecruitingStatus, ContactStatus,
  MessageDirection, Classification, TaskStatus, NotificationType,
  DocumentKind, DocumentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ── Users ────────────────────────────────────────────────────────────────
  const playerUser = await prisma.user.upsert({
    where: { email: 'taro@example.com' },
    update: {},
    create: { email: 'taro@example.com', role: Role.PLAYER },
  });
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: { email: 'parent@example.com', role: Role.PARENT },
  });

  // ── Player + preference ────────────────────────────────────────────────────
  const player = await prisma.player.upsert({
    where: { userId: playerUser.id },
    update: {},
    create: {
      userId: playerUser.id,
      firstName: 'Taro', lastName: 'Yamada',
      firstNameKana: 'タロウ', lastNameKana: 'ヤマダ',
      graduationYear: 2027, gpa: 3.8, sat: 1350,
      primaryPosition: Position.SHORTSTOP, secondaryPosition: Position.SECOND_BASE,
      heightCm: 180, weightKg: 79, throws: Hand.R, bats: BattingSide.R,
      highSchool: '桐蔭学園高校', state: 'CA', country: 'JP',
      preference: {
        create: {
          targetDivisions: [Division.D1, Division.D2],
          preferredRegions: [Region.WEST, Region.SOUTH],
          preferredStates: ['CA', 'FL'],
          maxTuition: 60000, wantsScholarship: true,
        },
      },
    },
  });

  // ── Parent + guardian link ─────────────────────────────────────────────────
  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: { userId: parentUser.id, firstName: 'Kenji', lastName: 'Yamada' },
  });
  await prisma.playerGuardian.upsert({
    where: { playerId_parentId: { playerId: player.id, parentId: parent.id } },
    update: {},
    create: { playerId: player.id, parentId: parent.id, isPrimary: true },
  });

  // ── Schools ────────────────────────────────────────────────────────────────
  const ucla = await prisma.school.upsert({
    where: { extId: 1 },
    update: {},
    create: {
      extId: 1, name: 'UCLA', city: 'Los Angeles', state: 'CA', region: Region.WEST,
      division: Division.D1, conference: 'Big Ten', type: 'Public',
      scholarshipAvailable: true,
      snapshots: { create: { recruitingNeeds: [Position.SHORTSTOP, Position.OUTFIELD], rosterSize: 40 } },
    },
  });
  const tampa = await prisma.school.upsert({
    where: { extId: 26 },
    update: {},
    create: {
      extId: 26, name: 'University of Tampa', city: 'Tampa', state: 'FL', region: Region.SOUTH,
      division: Division.D2, conference: 'Sunshine State', type: 'Private', scholarshipAvailable: true,
    },
  });

  // ── College coach ───────────────────────────────────────────────────────────
  const coach = await prisma.coach.create({
    data: {
      type: CoachType.COLLEGE, firstName: 'John', lastName: 'Daniels',
      title: 'Head Coach', email: 'jdaniels@ucla.edu', schoolId: ucla.id,
    },
  });

  // ── Player performance data ──────────────────────────────────────────────────
  await prisma.playerMetric.createMany({
    data: [
      { playerId: player.id, type: MetricType.EXIT_VELOCITY, value: 94, unit: 'mph', measuredAt: new Date() },
      { playerId: player.id, type: MetricType.SIXTY_YARD_DASH, value: 6.7, unit: 'sec', measuredAt: new Date() },
      { playerId: player.id, type: MetricType.INFIELD_VELOCITY, value: 86, unit: 'mph', measuredAt: new Date() },
    ],
  });
  await prisma.video.create({
    data: { playerId: player.id, kind: VideoKind.HITTING, title: 'Spring 2026 Reel', url: 'https://youtu.be/demo' },
  });

  // ── Recruiting: saved school, score, contact + thread ────────────────────────
  await prisma.savedSchool.upsert({
    where: { playerId_schoolId: { playerId: player.id, schoolId: ucla.id } },
    update: {},
    create: {
      playerId: player.id, schoolId: ucla.id,
      recruitingStatus: RecruitingStatus.CONTACTED, personalRating: 5, isFavorite: true,
      notes: 'コーチの返信待ち / 寮あり',
    },
  });
  await prisma.recruitingScore.upsert({
    where: { playerId_schoolId_engineVersion: { playerId: player.id, schoolId: ucla.id, engineVersion: '1.0.0' } },
    update: {},
    create: {
      playerId: player.id, schoolId: ucla.id, overall: 88.2, grade: 'B+', confidence: 94,
      classification: Classification.SAFETY, engineVersion: '1.0.0',
      breakdown: { athleticFit: 96.7, academicFit: 89.4, rosterOpportunity: 100 },
    },
  });
  const contact = await prisma.coachContact.create({
    data: {
      playerId: player.id, coachId: coach.id, schoolId: ucla.id,
      coachName: 'John Daniels', coachEmail: 'jdaniels@ucla.edu', coachRole: 'Head Coach',
      status: ContactStatus.REPLIED, lastActivityAt: new Date(),
      messages: {
        create: [
          { direction: MessageDirection.OUTBOUND, subject: 'Prospect intro', body: 'Dear Coach…', sentAt: new Date(Date.now() - 3 * 864e5) },
          { direction: MessageDirection.INBOUND, body: 'Thanks for reaching out…', sentAt: new Date(Date.now() - 1 * 864e5), isRead: true },
        ],
      },
    },
  });

  // ── Ops ──────────────────────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      { playerId: player.id, text: 'NCAA Eligibility Centerに登録', status: TaskStatus.OPEN },
      { playerId: player.id, text: 'ハイライト動画を更新', status: TaskStatus.DONE },
    ],
  });
  await prisma.document.create({
    data: { playerId: player.id, kind: DocumentKind.TRANSCRIPT, label: '成績証明書', status: DocumentStatus.COMPLETE },
  });
  await prisma.notification.create({
    data: { userId: playerUser.id, type: NotificationType.SCORE_READY, title: 'スコアが更新されました', data: { schoolId: ucla.id } },
  });
  await prisma.analyticsEvent.create({
    data: { userId: playerUser.id, playerId: player.id, name: 'school_saved', properties: { schoolId: ucla.id } },
  });
  await prisma.activityLog.create({
    data: { actorUserId: playerUser.id, action: 'CREATE', entityType: 'CoachContact', entityId: contact.id },
  });

  console.log('Seed complete:', { player: player.id, schools: [ucla.name, tampa.name] });
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
