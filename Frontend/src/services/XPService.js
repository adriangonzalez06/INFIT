import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { getAuth } from 'firebase/auth';

// ─── Level definitions ────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Aprendiz',  emoji: '🥉', minXP: 0    },
  { level: 2, name: 'Atleta',    emoji: '🏃', minXP: 100  },
  { level: 3, name: 'Guerrero',  emoji: '⚔️', minXP: 250  },
  { level: 4, name: 'Campeón',   emoji: '🥇', minXP: 500  },
  { level: 5, name: 'Élite',     emoji: '💪', minXP: 1000 },
  { level: 6, name: 'Leyenda',   emoji: '🏆', minXP: 2000 },
];

// ─── XP rewards per action ────────────────────────────────────────────────────
export const XP_REWARDS = {
  DAILY_CHALLENGE:   10,
  WEEKLY_CHALLENGE:  45,
  CREATE_ROUTINE:    15,
  PUBLISH_FEED:       5,
  STREAK_DAY:         5,
};

// ─── Helper: get level info from total XP ────────────────────────────────────
export function getLevelInfo(xp = 0) {
  // Find current level
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
    else break;
  }

  // Find next level
  const nextIndex = LEVELS.indexOf(current) + 1;
  const next = nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;

  // Progress to next level (0..1)
  let progress = 1;
  if (next) {
    const range = next.minXP - current.minXP;
    const gained = xp - current.minXP;
    progress = Math.min(1, gained / range);
  }

  const xpToNext = next ? next.minXP - xp : 0;

  return { current, next, progress, xpToNext, xp };
}

// ─── AsyncStorage key ─────────────────────────────────────────────────────────
const XP_KEY = 'userXP';

// ─── Read current XP ─────────────────────────────────────────────────────────
export async function getXP() {
  try {
    const raw = await AsyncStorage.getItem(XP_KEY);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

// ─── Fetch XP from backend and sync locally ──────────────────────────────────
export async function syncXPFromBackend(userId) {
    let uid = userId;
    if (!uid) {
        uid = await AsyncStorage.getItem('userDocId');
    }
    if (!uid) return null;

    try {
        const res = await axios.get(`${BACKEND_URL}/api/usuarios/${uid}/xp`);
        const remoteXP = res.data.xp || 0;
        await AsyncStorage.setItem(XP_KEY, String(remoteXP));
        return remoteXP;
    } catch (e) {
        console.warn('[XPService] Error syncing from backend:', e.message);
        return await getXP();
    }
}

// ─── Add XP and return updated level info ────────────────────────────────────
export async function addXP(amount, userId = null) {
  try {
    const current = await getXP();
    const newXP = current + amount;
    
    // Update local immediately for UI responsiveness
    await AsyncStorage.setItem(XP_KEY, String(newXP));

    // Update backend if userId or userDocId exists
    let uid = userId;
    if (!uid) {
        uid = await AsyncStorage.getItem('userDocId');
    }
    
    if (uid) {
        try {
            await axios.patch(`${BACKEND_URL}/api/usuarios/${uid}/xp`, { amount });
        } catch (backendError) {
            console.warn('[XPService] Backend sync failed, only local updated:', backendError.message);
        }
    }

    const before = getLevelInfo(current);
    const after = getLevelInfo(newXP);
    const leveledUp = after.current.level > before.current.level;

    return { newXP, levelInfo: after, leveledUp, newLevel: after.current };
  } catch (e) {
    console.warn('[XPService] Error adding XP:', e.message);
    return null;
  }
}
