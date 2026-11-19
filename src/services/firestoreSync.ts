import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import {
  AppSettings,
  Bottle,
  GameQuestion,
  PastEdition,
  RitualData,
  SecondLifeData,
  SiteImages,
  Wish,
} from '../types';
import { DEFAULT_SITE_IMAGES } from '../data/initialData';

export type SiteImageKey = keyof SiteImages | 'pastEditionBottle';

const clampStr = (value: unknown, maxLen: number): string => {
  const str = typeof value === 'string' ? value : String(value ?? '');
  return str.length > maxLen ? str.slice(0, maxLen) : str;
};

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  const num = typeof value === 'number' ? Math.round(value) : parseInt(String(value ?? ''), 10);
  if (Number.isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
};

const isShortUrl = (src: string | undefined): boolean =>
  typeof src === 'string' && !src.startsWith('data:') && src.length <= 500;

export const getBottleDocId = (bottleNumber: number): string =>
  bottleNumber.toString().padStart(2, '0');

// --- Payload Builders (Strictly synchronized with firestore.rules & firebase-blueprint.json) ---

function buildSettingsPayload(settings: AppSettings) {
  return {
    videoUrl: clampStr(settings.videoUrl || '', 500),
    playlistUrl: clampStr(settings.playlistUrl || '', 500),
    editionYear: clampInt(settings.editionYear, 2000, 2100, 2026),
    totalBottles: clampInt(settings.totalBottles, 1, 500, 50),
    bottleColor: clampStr(settings.bottleColor || '', 200),
    heroKicker: clampStr(settings.heroKicker || '', 200),
    heroSubtitle: clampStr(settings.heroSubtitle || '', 250),
    heroDescription: clampStr(settings.heroDescription || '', 2000),
    storyDescription: clampStr(settings.storyDescription || '', 1500),
    storyQuote: clampStr(settings.storyQuote || '', 2000),
    wishesDescription: clampStr(settings.wishesDescription || '', 1500),
    footerDescription: clampStr(settings.footerDescription || '', 1500),
    heroBottleUrl: isShortUrl(settings.images.heroBottle) ? settings.images.heroBottle : '',
    ritualGlassUrl: isShortUrl(settings.images.ritualGlass) ? settings.images.ritualGlass : '',
    storyKitchenUrl: isShortUrl(settings.images.storyKitchen) ? settings.images.storyKitchen : '',
    secondLifeLanternUrl: isShortUrl(settings.images.secondLifeLantern)
      ? settings.images.secondLifeLantern
      : '',
    updatedAt: new Date().toISOString(),
  };
}

function buildSiteImagePayload(key: SiteImageKey, dataUrl: string) {
  const safeVal = clampStr(dataUrl || DEFAULT_SITE_IMAGES[key], 750000);
  return {
    key,
    dataUrl: safeVal.length > 0 ? safeVal : DEFAULT_SITE_IMAGES[key],
    updatedAt: new Date().toISOString(),
  };
}

function buildRitualPayload(ritual: RitualData) {
  return {
    sectionTitle: clampStr(ritual.sectionTitle, 200),
    sectionDescription: clampStr(ritual.sectionDescription, 1500),
    glassCardTitle: clampStr(ritual.glassCardTitle, 200),
    glassCardSubtitle: clampStr(ritual.glassCardSubtitle, 300),
    temperatureBadge: clampStr(ritual.temperatureBadge, 50),
    pairings: (ritual.pairings || []).slice(0, 20).map((p) => clampStr(p, 300)),
    steps: (ritual.steps || []).slice(0, 30).map((s) => ({
      number: clampStr(s.number, 20),
      title: clampStr(s.title, 200),
      subtitle: clampStr(s.subtitle, 300),
      desc: clampStr(s.desc, 1500),
      tip: clampStr(s.tip, 800),
      iconName: s.iconName || 'Star',
    })),
    updatedAt: new Date().toISOString(),
  };
}

function buildPastEditionPayload(edition: PastEdition) {
  return {
    year: clampInt(edition.year, 2000, 2100, 2025),
    bottleColor: clampStr(edition.bottleColor, 200),
    quantityMade: clampInt(edition.quantityMade, 1, 10000, 35),
    quantityLabel: clampStr(edition.quantityLabel, 200),
    status: clampStr(edition.status, 150),
    description: clampStr(edition.description, 2000),
    tastingNotes: clampStr(edition.tastingNotes || '', 1500),
    imageSrc: isShortUrl(edition.imageSrc) ? edition.imageSrc : '',
    waxSealColor: clampStr(edition.waxSealColor, 150),
    keyFeatures: (edition.keyFeatures || []).slice(0, 20).map((f) => clampStr(f, 300)),
    archiveNote: clampStr(edition.archiveNote, 2000),
    updatedAt: new Date().toISOString(),
  };
}

function buildSecondLifePayload(data: SecondLifeData) {
  return {
    kicker: clampStr(data.kicker, 200),
    sectionTitle: clampStr(data.sectionTitle, 200),
    sectionDescription: clampStr(data.sectionDescription, 1500),
    guideKicker: clampStr(data.guideKicker, 200),
    guideTitle: clampStr(data.guideTitle, 200),
    steps: (data.steps || []).slice(0, 30).map((s) => ({
      step: clampStr(s.step, 20),
      title: clampStr(s.title, 200),
      desc: clampStr(s.desc, 1200),
    })),
    tipTitle: clampStr(data.tipTitle, 200),
    tipText: clampStr(data.tipText, 1000),
    updatedAt: new Date().toISOString(),
  };
}

function buildBottlePayload(bottle: Bottle) {
  const payload: Record<string, unknown> = {
    number: clampInt(bottle.number, 1, 500, 1),
    formattedNumber: clampStr(bottle.formattedNumber, 20),
    code: clampStr(bottle.code, 30),
    authToken: clampStr(bottle.authToken, 64),
    claimed: Boolean(bottle.claimed),
  };

  if (typeof bottle.tokenRegenerated === 'boolean') {
    payload.tokenRegenerated = bottle.tokenRegenerated;
  }
  if (typeof bottle.ownerName === 'string') {
    payload.ownerName = clampStr(bottle.ownerName, 160);
  }
  if (typeof bottle.claimDate === 'string') {
    payload.claimDate = clampStr(bottle.claimDate, 100);
  }
  if (typeof bottle.dedication === 'string') {
    payload.dedication = clampStr(bottle.dedication, 400);
  }
  if (typeof bottle.location === 'string') {
    payload.location = clampStr(bottle.location, 160);
  }

  return payload;
}

function buildWishPayload(wish: Wish) {
  const safeId = clampStr(wish.id.replace(/[^a-zA-Z0-9_-]/g, '-'), 128) || `w-${Date.now()}`;
  const payload: Record<string, unknown> = {
    id: safeId,
    author: clampStr(wish.author.trim() || 'Anónimo', 120),
    location: clampStr(wish.location || '', 120),
    message: clampStr(wish.message.trim() || 'Feliz Navidad', 1000),
    category: clampStr(wish.category || 'Brindis Navideño', 60),
    createdAt: clampStr(wish.createdAt || 'Hace un momento', 80),
    approved: Boolean(wish.approved),
    pinned: Boolean(wish.pinned),
    likes: clampInt(wish.likes, 0, 1000000, 1),
  };

  if (typeof wish.bottleNumber === 'number' && !Number.isNaN(wish.bottleNumber)) {
    payload.bottleNumber = clampInt(wish.bottleNumber, 1, 500, 1);
  }

  return payload;
}

function buildGameQuestionPayload(q: GameQuestion) {
  const safeId = clampStr(q.id.replace(/[^a-zA-Z0-9_-]/g, '-'), 128) || `g-${Date.now()}`;
  const payload: Record<string, unknown> = {
    id: safeId,
    type: q.type,
    title: clampStr(q.title || 'Pregunta', 200),
    prompt: clampStr(q.prompt.trim() || 'Pregunta de sobremesa', 800),
    tag: clampStr(q.tag || 'Navidad', 80),
  };

  if (q.type === 'trivia') {
    payload.options = (q.options || ['', '', '', '']).slice(0, 10).map((o) => clampStr(o, 250));
    payload.correctAnswer = clampInt(q.correctAnswer, 0, 9, 0);
    payload.explanation = clampStr(q.explanation || '', 800);
  }

  return payload;
}

// --- Individual Write Operations ---

export async function saveSettingsToFirestore(settings: AppSettings): Promise<void> {
  const path = 'site_settings/main';
  try {
    await setDoc(doc(db, 'site_settings', 'main'), buildSettingsPayload(settings));
    const imageKeys: Array<keyof SiteImages> = [
      'heroBottle',
      'ritualGlass',
      'storyKitchen',
      'secondLifeLantern',
    ];
    await Promise.all(
      imageKeys.map((key) =>
        setDoc(
          doc(db, 'site_images', key),
          buildSiteImagePayload(key, settings.images[key])
        )
      )
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSiteImageToFirestore(key: SiteImageKey, dataUrl: string): Promise<void> {
  const path = `site_images/${key}`;
  try {
    await setDoc(doc(db, 'site_images', key), buildSiteImagePayload(key, dataUrl));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveRitualToFirestore(ritual: RitualData): Promise<void> {
  const path = 'site_ritual/main';
  try {
    await setDoc(doc(db, 'site_ritual', 'main'), buildRitualPayload(ritual));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function savePastEditionToFirestore(edition: PastEdition): Promise<void> {
  const path = 'site_past_edition/main';
  try {
    await setDoc(doc(db, 'site_past_edition', 'main'), buildPastEditionPayload(edition));
    await setDoc(
      doc(db, 'site_images', 'pastEditionBottle'),
      buildSiteImagePayload('pastEditionBottle', edition.imageSrc)
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSecondLifeToFirestore(data: SecondLifeData): Promise<void> {
  const path = 'site_second_life/main';
  try {
    await setDoc(doc(db, 'site_second_life', 'main'), buildSecondLifePayload(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveBottleToFirestore(
  bottle: Bottle,
  isCloudAdmin: boolean
): Promise<boolean> {
  const docId = getBottleDocId(bottle.number);
  const path = `bottles/${docId}`;
  const docRef = doc(db, 'bottles', docId);

  try {
    if (isCloudAdmin) {
      await setDoc(docRef, buildBottlePayload(bottle));
      return true;
    }

    const existingSnap = await getDoc(docRef);
    if (!existingSnap.exists()) {
      return false;
    }

    const updateFields: Record<string, unknown> = {
      claimed: Boolean(bottle.claimed),
      ownerName: clampStr(bottle.ownerName || '', 160),
      location: clampStr(bottle.location || '', 160),
      dedication: clampStr(bottle.dedication || '', 400),
      claimDate: clampStr(bottle.claimDate || 'Diciembre 2026', 100),
    };
    await updateDoc(docRef, updateFields);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchSingleBottleFromFirestore(
  bottleNumber: number
): Promise<Bottle | null> {
  const docId = getBottleDocId(bottleNumber);
  const path = `bottles/${docId}`;
  try {
    const snap = await getDoc(doc(db, 'bottles', docId));
    if (!snap.exists()) return null;
    return snap.data() as Bottle;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createWishInFirestore(wish: Wish): Promise<void> {
  const payload = buildWishPayload(wish);
  const wishId = payload.id as string;
  const path = `wishes/${wishId}`;
  try {
    await setDoc(doc(db, 'wishes', wishId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateWishInFirestore(wish: Wish): Promise<void> {
  const payload = buildWishPayload(wish);
  const wishId = payload.id as string;
  const path = `wishes/${wishId}`;
  try {
    await setDoc(doc(db, 'wishes', wishId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteWishInFirestore(wishId: string): Promise<void> {
  const path = `wishes/${wishId}`;
  try {
    await deleteDoc(doc(db, 'wishes', wishId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function likeWishInFirestore(wishId: string): Promise<void> {
  const path = `wishes/${wishId}`;
  try {
    const ref = doc(db, 'wishes', wishId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    await updateDoc(ref, { likes: increment(1) });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncGameQuestionsToFirestore(
  nextQuestions: GameQuestion[],
  prevQuestions: GameQuestion[]
): Promise<void> {
  const path = 'game_questions';
  try {
    const batch = writeBatch(db);
    const nextIds = new Set(nextQuestions.map((q) => q.id));

    for (const q of nextQuestions) {
      const payload = buildGameQuestionPayload(q);
      const qId = payload.id as string;
      batch.set(doc(db, 'game_questions', qId), payload);
    }

    for (const prev of prevQuestions) {
      if (!nextIds.has(prev.id)) {
        batch.delete(doc(db, 'game_questions', prev.id));
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export interface FullSiteSnapshot {
  settings: AppSettings;
  ritualData: RitualData;
  pastEdition: PastEdition;
  secondLifeData: SecondLifeData;
  bottles: Bottle[];
  wishes: Wish[];
  gameQuestions: GameQuestion[];
}

export async function checkRemoteSeeded(): Promise<boolean> {
  const path = 'site_settings/main';
  try {
    const snap = await getDoc(doc(db, 'site_settings', 'main'));
    return snap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncAllToFirestore(state: FullSiteSnapshot): Promise<void> {
  try {
    // 1. Singleton configs + all 5 site images
    await Promise.all([
      saveSettingsToFirestore(state.settings),
      saveRitualToFirestore(state.ritualData),
      savePastEditionToFirestore(state.pastEdition),
      saveSecondLifeToFirestore(state.secondLifeData),
    ]);

    // 2. Bottles (50 docs) + Game questions + Wishes via batched writes
    const batch = writeBatch(db);

    for (const bottle of state.bottles) {
      const id = getBottleDocId(bottle.number);
      batch.set(doc(db, 'bottles', id), buildBottlePayload(bottle));
    }

    // Delete any stale game questions not in current list, upsert current
    const existingQSnap = await getDocs(collection(db, 'game_questions'));
    const nextQIds = new Set(state.gameQuestions.map((q) => q.id));
    existingQSnap.forEach((docSnap) => {
      if (!nextQIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });
    for (const q of state.gameQuestions) {
      const payload = buildGameQuestionPayload(q);
      batch.set(doc(db, 'game_questions', payload.id as string), payload);
    }

    // Delete any stale wishes not in current list, upsert current
    const existingWSnap = await getDocs(collection(db, 'wishes'));
    const nextWIds = new Set(state.wishes.map((w) => w.id));
    existingWSnap.forEach((docSnap) => {
      if (!nextWIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });
    for (const w of state.wishes) {
      const payload = buildWishPayload(w);
      batch.set(doc(db, 'wishes', payload.id as string), payload);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'syncAllToFirestore');
  }
}

// --- Real-Time Listeners ---

export interface FirestoreSyncCallbacks {
  isCloudAdmin: boolean;
  onSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  onSiteImages: (imagesMap: Partial<Record<SiteImageKey, string>>) => void;
  onRitual: (ritual: RitualData) => void;
  onPastEdition: (updater: (prev: PastEdition) => PastEdition) => void;
  onSecondLife: (data: SecondLifeData) => void;
  onWishes: (wishes: Wish[]) => void;
  onGameQuestions: (questions: GameQuestion[]) => void;
  onAdminBottles?: (bottles: Bottle[]) => void;
  onRemotePresence?: (exists: boolean) => void;
}

export function subscribeToFirestoreData(callbacks: FirestoreSyncCallbacks): Unsubscribe {
  const unsubs: Unsubscribe[] = [];

  // 1. Settings
  unsubs.push(
    onSnapshot(
      doc(db, 'site_settings', 'main'),
      (snap) => {
        callbacks.onRemotePresence?.(snap.exists());
        if (!snap.exists()) return;
        const data = snap.data() as Record<string, unknown>;
        callbacks.onSettings((prev) => ({
          ...prev,
          videoUrl: (data.videoUrl as string) ?? prev.videoUrl,
          playlistUrl: (data.playlistUrl as string) ?? prev.playlistUrl,
          editionYear: (data.editionYear as number) ?? prev.editionYear,
          totalBottles: (data.totalBottles as number) ?? prev.totalBottles,
          bottleColor: (data.bottleColor as string) ?? prev.bottleColor,
          heroKicker: (data.heroKicker as string) ?? prev.heroKicker,
          heroSubtitle: (data.heroSubtitle as string) ?? prev.heroSubtitle,
          heroDescription: (data.heroDescription as string) ?? prev.heroDescription,
          storyDescription: (data.storyDescription as string) ?? prev.storyDescription,
          storyQuote: (data.storyQuote as string) ?? prev.storyQuote,
          wishesDescription: (data.wishesDescription as string) ?? prev.wishesDescription,
          footerDescription: (data.footerDescription as string) ?? prev.footerDescription,
          images: {
            heroBottle: (data.heroBottleUrl as string) || prev.images.heroBottle,
            ritualGlass: (data.ritualGlassUrl as string) || prev.images.ritualGlass,
            storyKitchen: (data.storyKitchenUrl as string) || prev.images.storyKitchen,
            secondLifeLantern:
              (data.secondLifeLanternUrl as string) || prev.images.secondLifeLantern,
          },
        }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'site_settings/main')
    )
  );

  // 2. Site Images (each image in its own doc to support base64 uploads cleanly)
  unsubs.push(
    onSnapshot(
      collection(db, 'site_images'),
      (snap) => {
        if (snap.empty) return;
        const map: Partial<Record<SiteImageKey, string>> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data() as { key?: SiteImageKey; dataUrl?: string };
          if (data.key && data.dataUrl) {
            map[data.key] = data.dataUrl;
          }
        });
        callbacks.onSiteImages(map);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'site_images')
    )
  );

  // 3. Tasting Ritual
  unsubs.push(
    onSnapshot(
      doc(db, 'site_ritual', 'main'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as RitualData;
        callbacks.onRitual({
          sectionTitle: data.sectionTitle,
          sectionDescription: data.sectionDescription,
          glassCardTitle: data.glassCardTitle,
          glassCardSubtitle: data.glassCardSubtitle,
          temperatureBadge: data.temperatureBadge,
          pairings: data.pairings || [],
          steps: data.steps || [],
        });
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'site_ritual/main')
    )
  );

  // 4. Past Edition
  unsubs.push(
    onSnapshot(
      doc(db, 'site_past_edition', 'main'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as PastEdition;
        callbacks.onPastEdition((prev) => ({
          ...prev,
          year: data.year,
          bottleColor: data.bottleColor,
          quantityMade: data.quantityMade,
          quantityLabel: data.quantityLabel,
          status: data.status,
          description: data.description,
          tastingNotes: data.tastingNotes || '',
          imageSrc: data.imageSrc || prev.imageSrc,
          waxSealColor: data.waxSealColor,
          keyFeatures: data.keyFeatures || [],
          archiveNote: data.archiveNote,
        }));
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'site_past_edition/main')
    )
  );

  // 5. Second Life
  unsubs.push(
    onSnapshot(
      doc(db, 'site_second_life', 'main'),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as SecondLifeData;
        callbacks.onSecondLife({
          kicker: data.kicker,
          sectionTitle: data.sectionTitle,
          sectionDescription: data.sectionDescription,
          guideKicker: data.guideKicker,
          guideTitle: data.guideTitle,
          steps: data.steps || [],
          tipTitle: data.tipTitle,
          tipText: data.tipText,
        });
      },
      (error) => handleFirestoreError(error, OperationType.GET, 'site_second_life/main')
    )
  );

  // 6. Wishes (public only reads approved==true to match Pillar 8 rule; admin reads all)
  const wishesRef = callbacks.isCloudAdmin
    ? collection(db, 'wishes')
    : query(collection(db, 'wishes'), where('approved', '==', true));

  unsubs.push(
    onSnapshot(
      wishesRef,
      (snap) => {
        if (snap.empty) return;
        const list = snap.docs.map((d) => d.data() as Wish);
        callbacks.onWishes(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'wishes')
    )
  );

  // 7. Tabletop Game Questions
  unsubs.push(
    onSnapshot(
      collection(db, 'game_questions'),
      (snap) => {
        if (snap.empty) return;
        const list = snap.docs.map((d) => d.data() as GameQuestion);
        callbacks.onGameQuestions(list);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'game_questions')
    )
  );

  // 8. Admin-only full bottles collection listener
  if (callbacks.isCloudAdmin && callbacks.onAdminBottles) {
    unsubs.push(
      onSnapshot(
        collection(db, 'bottles'),
        (snap) => {
          if (snap.empty) return;
          const list = snap.docs
            .map((d) => d.data() as Bottle)
            .sort((a, b) => a.number - b.number);
          callbacks.onAdminBottles?.(list);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, 'bottles')
      )
    );
  }

  return () => {
    unsubs.forEach((u) => u());
  };
}
