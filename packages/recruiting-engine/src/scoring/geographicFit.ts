/**
 * Geographic Fit — alignment of school location with the player's stated
 * region preferences (and distance when coordinates are available). Also folds
 * in a light affordability signal via tuition vs the player's ceiling.
 */
import type { Player, School, ComponentScore } from '../types.js';
import { clamp, completeness, haversineMiles, regionForState } from '../util.js';

export function scoreGeographicFit(player: Player, school: School): ComponentScore {
  const notes: string[] = [];
  let score = 60; // neutral

  const schoolRegion =
    school.location?.region ?? regionForState(school.location?.state);

  // 1) Region preference.
  if (player.preferredRegions && player.preferredRegions.length > 0 && schoolRegion) {
    if (player.preferredRegions.includes(schoolRegion)) {
      score = 88;
      notes.push(`希望地域(${schoolRegion})に合致`);
    } else {
      score = 45;
      notes.push(`希望地域外(${schoolRegion})`);
    }
  }

  // 2) Distance refinement when both coordinates exist.
  const a = player.location;
  const b = school.location;
  if (a?.lat !== undefined && a?.lng !== undefined && b?.lat !== undefined && b?.lng !== undefined) {
    const miles = haversineMiles(
      { lat: a.lat, lng: a.lng },
      { lat: b.lat, lng: b.lng },
    );
    // 0 mi → +8, 1500+ mi → -8 (international players care less; still a signal).
    const distDelta = clamp(8 - (miles / 1500) * 16, -8, 8);
    score = clamp(score + distDelta);
  }

  // 3) Affordability nudge.
  if (player.maxTuition !== undefined && school.tuition !== undefined) {
    if (school.tuition > player.maxTuition) {
      score = clamp(score - 8);
      notes.push('学費が予算を超過');
    } else {
      score = clamp(score + 4);
    }
  }

  const confidence = completeness([
    player.preferredRegions,
    school.location?.state,
    player.maxTuition ?? school.tuition,
  ]);

  return {
    key: 'geographicFit',
    label: '地理適合',
    score: clamp(score),
    weight: 0,
    confidence,
    notes,
  };
}
