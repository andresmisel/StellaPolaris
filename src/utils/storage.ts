import { Bottle, Wish, AppSettings, PastEdition, RitualData, GameQuestion, SecondLifeData } from '../types';
import {
  generateInitialBottles,
  INITIAL_WISHES,
  INITIAL_SETTINGS,
  INITIAL_RITUAL_DATA,
  PAST_EDITION_2025,
  GAME_QUESTIONS,
  INITIAL_SECOND_LIFE_DATA,
} from '../data/initialData';
import { generateDefaultBottleToken } from './bottleTokens';

export { generateInitialBottles };

const STORAGE_KEYS = {
  BOTTLES: 'stella_polaris_bottles_v1',
  BOTTLES_ALL_AUTH_MIGRATION: 'stella_polaris_all_auth_v2',
  WISHES: 'stella_polaris_wishes_v1',
  SETTINGS: 'stella_polaris_settings_v1',
  RITUAL: 'stella_polaris_ritual_v1',
  PAST_EDITION: 'stella_polaris_past_edition_v1',
  GAME_QUESTIONS: 'stella_polaris_game_questions_v1',
  SECOND_LIFE: 'stella_polaris_second_life_v2',
  SECOND_LIFE_LEGACY: 'stella_polaris_second_life_v1',
  CURRENT_USER_BOTTLE: 'stella_polaris_my_bottle_v1',
};

export const getStoredBottles = (): Bottle[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOTTLES);
    if (!raw) {
      const initial = generateInitialBottles();
      localStorage.setItem(STORAGE_KEYS.BOTTLES, JSON.stringify(initial));
      localStorage.setItem(STORAGE_KEYS.BOTTLES_ALL_AUTH_MIGRATION, '1');
      return initial;
    }
    const parsed: Bottle[] = JSON.parse(raw);
    const alreadyMigratedAllAuth = localStorage.getItem(STORAGE_KEYS.BOTTLES_ALL_AUTH_MIGRATION) === '1';
    let needsSave = false;

    const migrated = parsed.map((b) => {
      let next = b;
      if (!next.authToken) {
        needsSave = true;
        next = {
          ...next,
          authToken: generateDefaultBottleToken(next.number),
        };
      }
      if (!alreadyMigratedAllAuth && !next.claimed) {
        needsSave = true;
        next = {
          ...next,
          claimed: true,
          ownerName: next.ownerName || `Propietario Ejemplar ${next.formattedNumber}`,
          claimDate: next.claimDate || 'Diciembre 2026',
          dedication: next.dedication || 'Brindis de Nochebuena Stella Polaris',
          location: next.location || 'Edición Limitada 2026',
        };
      }
      return next;
    });

    if (needsSave) {
      localStorage.setItem(STORAGE_KEYS.BOTTLES, JSON.stringify(migrated));
    }
    if (!alreadyMigratedAllAuth) {
      localStorage.setItem(STORAGE_KEYS.BOTTLES_ALL_AUTH_MIGRATION, '1');
    }
    return migrated;
  } catch {
    return generateInitialBottles();
  }
};

export const saveStoredBottles = (bottles: Bottle[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOTTLES, JSON.stringify(bottles));
  } catch (e) {
    console.error('Error saving bottles', e);
  }
};

export const getStoredWishes = (): Wish[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WISHES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(INITIAL_WISHES));
      return INITIAL_WISHES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WISHES;
  }
};

export const saveStoredWishes = (wishes: Wish[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.WISHES, JSON.stringify(wishes));
  } catch (e) {
    console.error('Error saving wishes', e);
  }
};

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...INITIAL_SETTINGS,
      ...parsed,
      images: {
        ...INITIAL_SETTINGS.images,
        ...(parsed.images || {}),
      },
    };
  } catch {
    return INITIAL_SETTINGS;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
};

export const getStoredRitual = (): RitualData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RITUAL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RITUAL, JSON.stringify(INITIAL_RITUAL_DATA));
      return INITIAL_RITUAL_DATA;
    }
    const parsed = JSON.parse(raw) as Partial<RitualData>;
    return {
      ...INITIAL_RITUAL_DATA,
      ...parsed,
      pairings: parsed.pairings ?? INITIAL_RITUAL_DATA.pairings,
      steps: parsed.steps ?? INITIAL_RITUAL_DATA.steps,
    };
  } catch {
    return INITIAL_RITUAL_DATA;
  }
};

export const saveStoredRitual = (ritual: RitualData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RITUAL, JSON.stringify(ritual));
  } catch (e) {
    console.error('Error saving ritual', e);
  }
};

export const getStoredPastEdition = (): PastEdition => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAST_EDITION);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAST_EDITION, JSON.stringify(PAST_EDITION_2025));
      return PAST_EDITION_2025;
    }
    const parsed = JSON.parse(raw) as Partial<PastEdition>;
    return {
      ...PAST_EDITION_2025,
      ...parsed,
      keyFeatures: parsed.keyFeatures ?? PAST_EDITION_2025.keyFeatures,
    };
  } catch {
    return PAST_EDITION_2025;
  }
};

export const saveStoredPastEdition = (edition: PastEdition): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAST_EDITION, JSON.stringify(edition));
  } catch (e) {
    console.error('Error saving past edition', e);
  }
};

export const getStoredGameQuestions = (): GameQuestion[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_QUESTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.GAME_QUESTIONS, JSON.stringify(GAME_QUESTIONS));
      return GAME_QUESTIONS;
    }
    return JSON.parse(raw);
  } catch {
    return GAME_QUESTIONS;
  }
};

export const saveStoredGameQuestions = (questions: GameQuestion[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GAME_QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error('Error saving game questions', e);
  }
};

const replaceFarolText = (text: string): string =>
  text
    .replace(/\ben un farol\b/g, 'en una lámpara')
    .replace(/\bEl Farol Eterno\b/g, 'La Lámpara Eterna')
    .replace(/\bFarol\b/g, 'Lámpara')
    .replace(/\bfarol\b/g, 'lámpara');

export const getStoredSecondLife = (): SecondLifeData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SECOND_LIFE);
    if (!raw) {
      const legacyRaw = localStorage.getItem(STORAGE_KEYS.SECOND_LIFE_LEGACY);
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw) as Partial<SecondLifeData>;
        const migrated: SecondLifeData = {
          ...INITIAL_SECOND_LIFE_DATA,
          ...legacy,
          sectionDescription: legacy.sectionDescription
            ? replaceFarolText(legacy.sectionDescription)
            : INITIAL_SECOND_LIFE_DATA.sectionDescription,
          guideTitle: legacy.guideTitle
            ? replaceFarolText(legacy.guideTitle)
            : INITIAL_SECOND_LIFE_DATA.guideTitle,
          steps: (legacy.steps ?? INITIAL_SECOND_LIFE_DATA.steps).map((s) => ({
            ...s,
            title: replaceFarolText(s.title),
            desc: replaceFarolText(s.desc),
          })),
        };
        localStorage.setItem(STORAGE_KEYS.SECOND_LIFE, JSON.stringify(migrated));
        return migrated;
      }
      localStorage.setItem(STORAGE_KEYS.SECOND_LIFE, JSON.stringify(INITIAL_SECOND_LIFE_DATA));
      return INITIAL_SECOND_LIFE_DATA;
    }
    const parsed = JSON.parse(raw) as Partial<SecondLifeData>;
    return {
      ...INITIAL_SECOND_LIFE_DATA,
      ...parsed,
      steps: parsed.steps ?? INITIAL_SECOND_LIFE_DATA.steps,
    };
  } catch {
    return INITIAL_SECOND_LIFE_DATA;
  }
};

export const saveStoredSecondLife = (data: SecondLifeData): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SECOND_LIFE, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving second life data', e);
  }
};

export const getMyClaimedBottle = (): number | null => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_BOTTLE);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
};

export const setMyClaimedBottle = (bottleNumber: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_BOTTLE, bottleNumber.toString());
  } catch (e) {
    console.error('Error saving my bottle', e);
  }
};

/**
 * Resizes and compresses an uploaded image file into a Data URL safe for localStorage & Firestore (< 480KB).
 */
export const compressImageFileToDataUrl = (file: File, maxWidth = 1100, quality = 0.82): Promise<string> => {
  const MAX_DATA_URL_LENGTH = 480000;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const attempts: Array<{ width: number; quality: number }> = [
          { width: maxWidth, quality },
          { width: 950, quality: 0.74 },
          { width: 800, quality: 0.66 },
          { width: 680, quality: 0.58 },
          { width: 540, quality: 0.5 },
        ];

        for (const attempt of attempts) {
          const scale = img.width > attempt.width ? attempt.width / img.width : 1;
          const targetWidth = Math.max(1, Math.round(img.width * scale));
          const targetHeight = Math.max(1, Math.round(img.height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          try {
            const result = canvas.toDataURL('image/jpeg', attempt.quality);
            if (result.length <= MAX_DATA_URL_LENGTH) {
              resolve(result);
              return;
            }
          } catch {
            // Try lower resolution / quality
          }
        }

        reject(
          new Error(
            'La imagen es demasiado pesada para guardarse en la nube. Por favor elige una imagen más ligera o usa una URL.'
          )
        );
      };
      img.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Error al cargar el archivo de imagen.'));
    reader.readAsDataURL(file);
  });
};

// --- Web Audio Festive Chimes & Sound Synthesis ---
class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Crystal glass "Tink" for toast or click
  playGlassClink() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2637, now); // E7 high chime
      osc.frequency.exponentialRampToValueAtTime(1318, now + 0.6);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch {
      // Audio not permitted or supported
    }
  }

  // Heavenly Christmas Star Bell / Harp arpeggio for certificate verification
  playFestiveChime() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
      
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + i * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.95);
      });
    } catch {
      // silent fallback
    }
  }

  // Click / tick for roulette spin
  playTick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // silent fallback
    }
  }
}

export const sound = new SoundEffects();
