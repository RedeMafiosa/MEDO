// XP & Level System — 50 levels

export const XP_GAINS = {
  POST_FEED: 10,
  WATCH_LIVE_5MIN: 100,
  VIP_BRONZE: 500,
  VIP_SILVER: 1000,
  VIP_GOLD: 1500,
  VIP_PLATINUM: 2000,
  VIP_DIAMOND: 2500,
  // legacy fallback
  VIP_PURCHASE: 500,
};

// Get XP reward for a VIP tier name
export function xpForVipTier(tierName) {
  const t = (tierName || "").toLowerCase();
  if (t.includes("diamond")) return XP_GAINS.VIP_DIAMOND;
  if (t.includes("platinum")) return XP_GAINS.VIP_PLATINUM;
  if (t.includes("gold") || t.includes("ouro")) return XP_GAINS.VIP_GOLD;
  if (t.includes("silver") || t.includes("prata")) return XP_GAINS.VIP_SILVER;
  return XP_GAINS.VIP_BRONZE;
}

// XP required to reach a given level (level 1 = 0)
export function xpForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

// Current level from total XP
export function levelFromXP(xp) {
  let level = 1;
  for (let l = 1; l <= 50; l++) {
    if (xp >= xpForLevel(l)) level = l;
    else break;
  }
  return Math.min(level, 50);
}

// XP accumulated within the current level
export function xpInLevel(xp) {
  const level = levelFromXP(xp);
  return xp - xpForLevel(level);
}

// Progress percentage within the current level (0-100)
export function xpProgress(xp) {
  const level = levelFromXP(xp);
  if (level >= 50) return 100;
  const currentLevelXP = xpForLevel(level);
  const nextLevelXP = xpForLevel(level + 1);
  return Math.floor(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100);
}

// Add XP to a user profile and return { newXP, newLevel }
export async function addXP(base44Client, userId, profileId, currentXP, amount) {
  const newXP = currentXP + amount;
  const newLevel = levelFromXP(newXP);
  await base44Client.entities.UserProfile.update(profileId, { xp: newXP, level: newLevel });
  return { newXP, newLevel };
}