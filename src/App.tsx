import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { Bottle, Wish, AppSettings, RitualData, PastEdition, GameQuestion, SecondLifeData } from './types';
import {
  getStoredBottles,
  saveStoredBottles,
  getStoredWishes,
  saveStoredWishes,
  getStoredSettings,
  saveStoredSettings,
  getStoredRitual,
  saveStoredRitual,
  getStoredPastEdition,
  saveStoredPastEdition,
  getStoredGameQuestions,
  saveStoredGameQuestions,
  getStoredSecondLife,
  saveStoredSecondLife,
  getMyClaimedBottle,
  setMyClaimedBottle,
  generateInitialBottles,
  sound,
} from './utils/storage';
import { parseAndVerifyBottleToken, buildBottleAuthUrl } from './utils/bottleTokens';
import {
  INITIAL_WISHES,
  INITIAL_SETTINGS,
  INITIAL_RITUAL_DATA,
  PAST_EDITION_2025,
  GAME_QUESTIONS,
  INITIAL_SECOND_LIFE_DATA,
} from './data/initialData';
import { auth, googleProvider, ADMIN_EMAIL } from './firebase';
import {
  checkRemoteSeeded,
  createWishInFirestore,
  deleteWishInFirestore,
  fetchSingleBottleFromFirestore,
  likeWishInFirestore,
  saveBottleToFirestore,
  savePastEditionToFirestore,
  saveRitualToFirestore,
  saveSecondLifeToFirestore,
  saveSettingsToFirestore,
  SiteImageKey,
  subscribeToFirestoreData,
  syncAllToFirestore,
  syncGameQuestionsToFirestore,
  updateWishInFirestore,
} from './services/firestoreSync';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TastingRitual } from './components/TastingRitual';
import { Storytelling } from './components/Storytelling';
import { YouTubeMusic } from './components/YouTubeMusic';
import { PastEditionSection } from './components/PastEditionSection';
import { WishesWall } from './components/WishesWall';
import { TabletopGame } from './components/TabletopGame';
import { BottleSecondLife } from './components/BottleSecondLife';
import { BottleAuthModal } from './components/BottleAuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { Footer } from './components/Footer';
import confetti from 'canvas-confetti';

export type CloudSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export default function App() {
  const [bottles, setBottles] = useState<Bottle[]>(getStoredBottles);
  const [wishes, setWishes] = useState<Wish[]>(getStoredWishes);
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [ritualData, setRitualData] = useState<RitualData>(getStoredRitual);
  const [pastEdition, setPastEdition] = useState<PastEdition>(getStoredPastEdition);
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>(getStoredGameQuestions);
  const [secondLifeData, setSecondLifeData] = useState<SecondLifeData>(getStoredSecondLife);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [targetBottleNumber, setTargetBottleNumber] = useState<number | undefined>(undefined);
  const [authenticatedBottleNumber, setAuthenticatedBottleNumber] = useState<number | null>(
    getMyClaimedBottle
  );
  const [openedViaBottleLink, setOpenedViaBottleLink] = useState(false);
  const [linkAuthError, setLinkAuthError] = useState<string | null>(null);

  // Firebase Auth & Cloud Persistence state
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('idle');
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [hasLocalUnsyncedEdits, setHasLocalUnsyncedEdits] = useState<boolean>(() => {
    try {
      return (
        JSON.stringify(getStoredSettings()) !== JSON.stringify(INITIAL_SETTINGS) ||
        JSON.stringify(getStoredRitual()) !== JSON.stringify(INITIAL_RITUAL_DATA) ||
        JSON.stringify(getStoredPastEdition()) !== JSON.stringify(PAST_EDITION_2025) ||
        JSON.stringify(getStoredSecondLife()) !== JSON.stringify(INITIAL_SECOND_LIFE_DATA) ||
        JSON.stringify(getStoredGameQuestions()) !== JSON.stringify(GAME_QUESTIONS)
      );
    } catch {
      return false;
    }
  });
  const remoteHasDataRef = useRef<boolean | null>(null);

  const isCloudAdmin = Boolean(
    firebaseUser?.emailVerified &&
      firebaseUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );

  // Keep latest snapshot ref for initial cloud sync on admin login
  const latestStateRef = useRef({
    settings,
    ritualData,
    pastEdition,
    secondLifeData,
    bottles,
    wishes,
    gameQuestions,
  });
  latestStateRef.current = {
    settings,
    ritualData,
    pastEdition,
    secondLifeData,
    bottles,
    wishes,
    gameQuestions,
  };

  const triggerCelebration = () => {
    sound.playFestiveChime();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#E25822', '#F59E0B', '#D4AF37', '#801C2E', '#FFFFFF'],
      });
    } catch {
      // ignore confetti error in headless environments
    }
  };

  // Persist local cache whenever Firestore updates state
  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredRitual(ritualData);
  }, [ritualData]);

  useEffect(() => {
    saveStoredPastEdition(pastEdition);
  }, [pastEdition]);

  useEffect(() => {
    saveStoredSecondLife(secondLifeData);
  }, [secondLifeData]);

  useEffect(() => {
    saveStoredGameQuestions(gameQuestions);
  }, [gameQuestions]);

  useEffect(() => {
    saveStoredBottles(bottles);
  }, [bottles]);

  // Observe Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Real-time Firestore subscriptions for all persistent collections
  useEffect(() => {
    if (!authReady) return;

    const unsub = subscribeToFirestoreData({
      isCloudAdmin,
      onRemotePresence: (exists) => {
        remoteHasDataRef.current = exists;
        if (exists && isCloudAdmin) {
          setCloudSyncStatus((prev) => (prev === 'syncing' ? prev : 'synced'));
        }
      },
      onSettings: (updater) => {
        setSettings((prev) => updater(prev));
      },
      onSiteImages: (imagesMap: Partial<Record<SiteImageKey, string>>) => {
        setSettings((prev) => ({
          ...prev,
          images: {
            heroBottle: imagesMap.heroBottle || prev.images.heroBottle,
            ritualGlass: imagesMap.ritualGlass || prev.images.ritualGlass,
            storyKitchen: imagesMap.storyKitchen || prev.images.storyKitchen,
            secondLifeLantern: imagesMap.secondLifeLantern || prev.images.secondLifeLantern,
          },
        }));
        if (imagesMap.pastEditionBottle) {
          setPastEdition((prev) => ({
            ...prev,
            imageSrc: imagesMap.pastEditionBottle || prev.imageSrc,
          }));
        }
      },
      onRitual: (remoteRitual) => {
        setRitualData(remoteRitual);
      },
      onPastEdition: (updater) => {
        setPastEdition((prev) => updater(prev));
      },
      onSecondLife: (remoteSecondLife) => {
        setSecondLifeData(remoteSecondLife);
      },
      onWishes: (remoteWishes) => {
        setWishes((prev) => {
          if (isCloudAdmin) {
            saveStoredWishes(remoteWishes);
            return remoteWishes;
          }
          // Public listener only receives approved==true; preserve any just-submitted local pending wishes
          const pendingLocal = prev.filter(
            (w) => !w.approved && !remoteWishes.some((rw) => rw.id === w.id)
          );
          const merged = [...pendingLocal, ...remoteWishes];
          saveStoredWishes(merged);
          return merged;
        });
      },
      onGameQuestions: (remoteQuestions) => {
        setGameQuestions(remoteQuestions);
      },
      onAdminBottles: (remoteBottles) => {
        setBottles((prev) => {
          const map = new Map<number, Bottle>();
          prev.forEach((b) => map.set(b.number, b));
          remoteBottles.forEach((rb) => map.set(rb.number, rb));
          return Array.from(map.values()).sort((a, b) => a.number - b.number);
        });
      },
    });

    return () => unsub();
  }, [authReady, isCloudAdmin]);

  // Detect bottle link on initial page load & verify against live Firestore bottle record
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const bottleParam = params.get('botella');
    const titularParam = params.get('titular') || undefined;

    if (!tokenParam && !bottleParam) {
      // Refresh already-claimed local bottle from Firestore if present
      if (authenticatedBottleNumber) {
        fetchSingleBottleFromFirestore(authenticatedBottleNumber)
          .then((remoteBottle) => {
            if (remoteBottle) {
              setBottles((prev) =>
                prev.map((b) => (b.number === remoteBottle.number ? remoteBottle : b))
              );
            }
          })
          .catch(() => {
            // Non-blocking fallback to local state
          });
      }
      return;
    }

    let cancelled = false;

    const verifyBottleLink = async () => {
      let resolvedNumber: number | null = null;
      let cleanToken: string | null = null;

      if (tokenParam) {
        cleanToken = tokenParam.trim().toUpperCase();
        const parsed = parseAndVerifyBottleToken(cleanToken);
        const expectedNum = bottleParam ? parseInt(bottleParam, 10) : undefined;

        if (!parsed.valid || !parsed.bottleNumber) {
          setLinkAuthError('El enlace de botella no es válido.');
          return;
        }
        if (expectedNum && !Number.isNaN(expectedNum) && parsed.bottleNumber !== expectedNum) {
          setLinkAuthError('El enlace no corresponde al número de botella indicado.');
          return;
        }
        resolvedNumber = parsed.bottleNumber;
      } else if (bottleParam) {
        const num = parseInt(bottleParam, 10);
        if (Number.isNaN(num) || num < 1 || num > 50) {
          setLinkAuthError('Número de botella no encontrado en el lote 01/50.');
          return;
        }
        resolvedNumber = num;
      }

      if (resolvedNumber === null) return;

      let remoteBottle: Bottle | null = null;
      try {
        remoteBottle = await fetchSingleBottleFromFirestore(resolvedNumber);
      } catch {
        remoteBottle = null;
      }

      if (cancelled) return;

      const localTarget = latestStateRef.current.bottles.find((b) => b.number === resolvedNumber);
      const target = remoteBottle || localTarget;

      if (!target) {
        setLinkAuthError('Botella no encontrada en la colección 01/50.');
        return;
      }

      if (cleanToken && target.tokenRegenerated && target.authToken.toUpperCase() !== cleanToken) {
        setLinkAuthError(
          'Este enlace fue reemplazado por uno más reciente desde el panel Superadmin.'
        );
        return;
      }

      let finalBottle = target;
      if (
        titularParam &&
        titularParam.trim() &&
        (!target.ownerName || target.ownerName.startsWith('Propietario Ejemplar'))
      ) {
        finalBottle = { ...target, ownerName: titularParam.trim(), claimed: true };
        saveBottleToFirestore(finalBottle, isCloudAdmin).catch(() => {
          // Local update still proceeds
        });
      }

      setBottles((prev) =>
        prev.map((b) => (b.number === finalBottle.number ? finalBottle : b))
      );
      setAuthenticatedBottleNumber(resolvedNumber);
      setMyClaimedBottle(resolvedNumber);
      setOpenedViaBottleLink(true);
      setLinkAuthError(null);
      triggerCelebration();
    };

    verifyBottleLink();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcut Ctrl+Shift+A for Superadmin quick access
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to run cloud writes cleanly when admin is authenticated
  const runCloudWrite = async (fn: () => Promise<unknown>) => {
    if (!isCloudAdmin) {
      setHasLocalUnsyncedEdits(true);
      return;
    }
    setCloudSyncStatus('syncing');
    setCloudSyncError(null);
    try {
      await fn();
      setCloudSyncStatus('synced');
      setHasLocalUnsyncedEdits(false);
    } catch (err) {
      setCloudSyncStatus('error');
      setCloudSyncError(
        err instanceof Error ? err.message : 'Error al guardar en la base de datos.'
      );
    }
  };

  // Connect Google account (andresmisel@gmail.com) for permanent cloud writes
  const handleConnectCloudAdmin = async (): Promise<boolean> => {
    setCloudSyncError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      if (!user.emailVerified || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        setCloudSyncError(
          `Acceso denegado: debes iniciar sesión con la cuenta autorizada (${ADMIN_EMAIL}).`
        );
        setCloudSyncStatus('error');
        return false;
      }

      setCloudSyncStatus('syncing');
      const alreadySeeded =
        remoteHasDataRef.current !== null ? remoteHasDataRef.current : await checkRemoteSeeded();

      // Upload local state immediately if DB is empty OR user already edited locally before connecting
      if (!alreadySeeded || hasLocalUnsyncedEdits) {
        await syncAllToFirestore(latestStateRef.current);
        remoteHasDataRef.current = true;
        setHasLocalUnsyncedEdits(false);
      }

      setCloudSyncStatus('synced');
      sound.playFestiveChime();
      return true;
    } catch (err) {
      setCloudSyncStatus('error');
      const rawMsg = err instanceof Error ? err.message : '';
      if (rawMsg.includes('popup-blocked') || rawMsg.includes('popup-closed-by-user')) {
        setCloudSyncError(
          'La ventana de Google fue cerrada o bloqueada por el navegador. Permite las ventanas emergentes e intenta nuevamente.'
        );
      } else if (rawMsg.includes('unauthorized-domain')) {
        setCloudSyncError(
          'Este dominio no está autorizado aún en Firebase Auth. Agrégalo en Firebase Console > Authentication > Settings > Authorized domains.'
        );
      } else {
        setCloudSyncError(
          rawMsg || 'No se pudo completar el inicio de sesión con Google.'
        );
      }
      return false;
    }
  };

  const handleDisconnectCloudAdmin = async () => {
    try {
      await signOut(auth);
      setCloudSyncStatus('idle');
      setCloudSyncError(null);
    } catch {
      // ignore signOut failure
    }
  };

  const handleSyncAllToCloud = async (): Promise<boolean> => {
    if (!isCloudAdmin) {
      return handleConnectCloudAdmin();
    }
    setCloudSyncStatus('syncing');
    setCloudSyncError(null);
    try {
      await syncAllToFirestore(latestStateRef.current);
      remoteHasDataRef.current = true;
      setHasLocalUnsyncedEdits(false);
      setCloudSyncStatus('synced');
      sound.playFestiveChime();
      return true;
    } catch (err) {
      setCloudSyncStatus('error');
      setCloudSyncError(
        err instanceof Error ? err.message : 'Error al sincronizar todo a la nube.'
      );
      return false;
    }
  };

  // Update a bottle (personalized by owner or edited by admin)
  const handleBottleUpdated = (updatedBottle: Bottle) => {
    const updated = bottles.map((b) => (b.number === updatedBottle.number ? updatedBottle : b));
    setBottles(updated);
    saveStoredBottles(updated);

    if (isCloudAdmin) {
      void runCloudWrite(() => saveBottleToFirestore(updatedBottle, true));
    } else {
      // Collector personalization updates Firestore directly if the bottle exists in cloud
      saveBottleToFirestore(updatedBottle, false).catch(() => {
        // Non-blocking fallback if cloud record hasn't been seeded yet
      });
    }
  };

  // Superadmin previews/tests a specific bottle's link
  const handlePreviewBottleLink = (bottle: Bottle) => {
    const url = buildBottleAuthUrl(bottle.number, bottle.authToken, bottle.ownerName);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', url);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsAdminModalOpen(false);
    setIsAuthModalOpen(false);
    setTargetBottleNumber(undefined);
    setLinkAuthError(null);
    setAuthenticatedBottleNumber(bottle.number);
    setMyClaimedBottle(bottle.number);
    setOpenedViaBottleLink(true);
    triggerCelebration();
  };

  // Add a wish to the wall (public visitors create unapproved wishes; admin creates approved)
  const handleAddWish = (newWishData: Omit<Wish, 'id' | 'createdAt' | 'likes'>) => {
    const isEffectiveAdmin = isAdmin && isCloudAdmin;
    const newWish: Wish = {
      ...newWishData,
      approved: isEffectiveAdmin ? Boolean(newWishData.approved) : false,
      pinned: isEffectiveAdmin ? Boolean(newWishData.pinned) : false,
      id: `w-${Date.now()}`,
      createdAt: 'Hace un momento',
      likes: 1,
    };
    const updated = [newWish, ...wishes];
    setWishes(updated);
    saveStoredWishes(updated);

    createWishInFirestore(newWish).catch(() => {
      if (isAdmin) {
        setHasLocalUnsyncedEdits(true);
      }
    });
  };

  // Like a wish
  const handleLikeWish = (wishId: string) => {
    const updated = wishes.map((w) => (w.id === wishId ? { ...w, likes: w.likes + 1 } : w));
    setWishes(updated);
    saveStoredWishes(updated);

    likeWishInFirestore(wishId).catch(() => {
      // Ignore if wish only exists locally prior to seeding
    });
  };

  // Admin: Update wish (edit / approve / pin)
  const handleUpdateWish = (updatedWish: Wish) => {
    const updated = wishes.map((w) => (w.id === updatedWish.id ? updatedWish : w));
    setWishes(updated);
    saveStoredWishes(updated);
    void runCloudWrite(() => updateWishInFirestore(updatedWish));
  };

  // Admin: Delete wish
  const handleDeleteWish = (wishId: string) => {
    const updated = wishes.filter((w) => w.id !== wishId);
    setWishes(updated);
    saveStoredWishes(updated);
    void runCloudWrite(() => deleteWishInFirestore(wishId));
  };

  // Admin: Update settings (descriptions, images, playlist)
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    void runCloudWrite(() => saveSettingsToFirestore(newSettings));
  };

  // Admin: Update Ritual
  const handleUpdateRitual = (newRitual: RitualData) => {
    setRitualData(newRitual);
    saveStoredRitual(newRitual);
    void runCloudWrite(() => saveRitualToFirestore(newRitual));
  };

  // Admin: Update Past Edition
  const handleUpdatePastEdition = (newEdition: PastEdition) => {
    setPastEdition(newEdition);
    saveStoredPastEdition(newEdition);
    void runCloudWrite(() => savePastEditionToFirestore(newEdition));
  };

  // Admin: Update Tabletop Game Questions
  const handleUpdateGameQuestions = (newQuestions: GameQuestion[]) => {
    const prevQuestions = gameQuestions;
    setGameQuestions(newQuestions);
    saveStoredGameQuestions(newQuestions);
    void runCloudWrite(() => syncGameQuestionsToFirestore(newQuestions, prevQuestions));
  };

  // Admin: Update Bottle Second Life
  const handleUpdateSecondLife = (newData: SecondLifeData) => {
    setSecondLifeData(newData);
    saveStoredSecondLife(newData);
    void runCloudWrite(() => saveSecondLifeToFirestore(newData));
  };

  // Admin: Reset all content & data to factory defaults
  const handleResetData = () => {
    const defaultBottles = generateInitialBottles();
    setBottles(defaultBottles);
    saveStoredBottles(defaultBottles);

    setWishes(INITIAL_WISHES);
    saveStoredWishes(INITIAL_WISHES);

    setSettings(INITIAL_SETTINGS);
    saveStoredSettings(INITIAL_SETTINGS);

    setRitualData(INITIAL_RITUAL_DATA);
    saveStoredRitual(INITIAL_RITUAL_DATA);

    setPastEdition(PAST_EDITION_2025);
    saveStoredPastEdition(PAST_EDITION_2025);

    setGameQuestions(GAME_QUESTIONS);
    saveStoredGameQuestions(GAME_QUESTIONS);

    setSecondLifeData(INITIAL_SECOND_LIFE_DATA);
    saveStoredSecondLife(INITIAL_SECOND_LIFE_DATA);

    void runCloudWrite(() =>
      syncAllToFirestore({
        settings: INITIAL_SETTINGS,
        ritualData: INITIAL_RITUAL_DATA,
        pastEdition: PAST_EDITION_2025,
        secondLifeData: INITIAL_SECOND_LIFE_DATA,
        bottles: defaultBottles,
        wishes: INITIAL_WISHES,
        gameQuestions: GAME_QUESTIONS,
      })
    );

    sound.playFestiveChime();
  };

  // Superadmin authentication with secret key "evan321"
  const handleAdminLogin = (key: string): boolean => {
    if (key === 'evan321') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    sound.playTick();
    setIsAdmin(false);
    setIsAdminModalOpen(false);
  };

  const authenticatedBottle = authenticatedBottleNumber
    ? bottles.find((b) => b.number === authenticatedBottleNumber) || null
    : null;

  return (
    <div className="min-h-screen bg-[#1C060B] text-[#FDF8F0] font-sans selection:bg-[#E25822] selection:text-white relative">
      {/* Subtle festive starry backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-12 left-1/4 w-1 h-1 bg-[#F59E0B] rounded-full animate-twinkle" />
        <div
          className="absolute top-36 right-1/4 w-1.5 h-1.5 bg-[#FDE68A] rounded-full animate-twinkle"
          style={{ animationDelay: '1.2s' }}
        />
        <div
          className="absolute top-80 left-1/6 w-1 h-1 bg-[#E25822] rounded-full animate-twinkle"
          style={{ animationDelay: '2.5s' }}
        />
        <div
          className="absolute top-2/3 right-1/5 w-1.5 h-1.5 bg-[#FDE68A] rounded-full animate-twinkle"
          style={{ animationDelay: '0.8s' }}
        />
        <div
          className="absolute bottom-24 left-1/3 w-1 h-1 bg-[#F59E0B] rounded-full animate-twinkle"
          style={{ animationDelay: '1.9s' }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          onOpenAuth={() => {
            setTargetBottleNumber(undefined);
            setIsAuthModalOpen(true);
          }}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          isAdmin={isAdmin}
          onLogoutAdmin={handleAdminLogout}
          totalBottles={settings.totalBottles}
          authenticatedBottle={authenticatedBottle}
          editionYear={settings.editionYear}
          pastEditionYear={pastEdition.year}
        />

        {/* Main Sections */}
        <main className="flex-1">
          <Hero
            onOpenAuth={() => {
              setTargetBottleNumber(undefined);
              setIsAuthModalOpen(true);
            }}
            totalBottles={settings.totalBottles}
            authenticatedBottle={authenticatedBottle}
            openedViaBottleLink={openedViaBottleLink}
            linkAuthError={linkAuthError}
            settings={settings}
          />

          <TastingRitual
            ritualData={ritualData}
            imageSrc={settings.images.ritualGlass}
          />

          <Storytelling
            imageSrc={settings.images.storyKitchen}
            description={settings.storyDescription}
            quote={settings.storyQuote}
            editionYear={settings.editionYear}
          />

          <YouTubeMusic
            playlistUrl={settings.playlistUrl}
            editionYear={settings.editionYear}
          />

          <PastEditionSection
            edition={pastEdition}
            currentYear={settings.editionYear}
            currentTotalBottles={settings.totalBottles}
            currentBottleColor={settings.bottleColor}
          />

          <TabletopGame questions={gameQuestions} />

          <WishesWall
            wishes={wishes}
            onAddWish={handleAddWish}
            onLikeWish={handleLikeWish}
            isAdmin={isAdmin}
            description={settings.wishesDescription}
            authenticatedBottleNumber={authenticatedBottleNumber}
            editionYear={settings.editionYear}
          />

          <BottleSecondLife
            imageSrc={settings.images.secondLifeLantern}
            data={secondLifeData}
          />
        </main>

        {/* Footer */}
        <Footer
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          isAdmin={isAdmin}
          onLogoutAdmin={handleAdminLogout}
          onOpenAuth={() => {
            setTargetBottleNumber(undefined);
            setIsAuthModalOpen(true);
          }}
          totalBottles={settings.totalBottles}
          footerDescription={settings.footerDescription}
          editionYear={settings.editionYear}
          pastEditionYear={pastEdition.year}
        />
      </div>

      {/* Bottle Certificate Modal */}
      <BottleAuthModal
        bottles={bottles}
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setLinkAuthError(null);
        }}
        onBottleUpdated={handleBottleUpdated}
        authenticatedBottle={authenticatedBottle}
        openedViaBottleLink={openedViaBottleLink}
        isAdmin={isAdmin}
        linkAuthError={linkAuthError}
        initialBottleNumber={targetBottleNumber}
      />

      {/* Superadmin Panel Modal (key: "evan321") */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        isCloudAdmin={isCloudAdmin}
        cloudUserEmail={firebaseUser?.email || null}
        cloudSyncStatus={cloudSyncStatus}
        cloudSyncError={cloudSyncError}
        hasLocalUnsyncedEdits={hasLocalUnsyncedEdits}
        onConnectCloudAdmin={handleConnectCloudAdmin}
        onDisconnectCloudAdmin={handleDisconnectCloudAdmin}
        onSyncAllToCloud={handleSyncAllToCloud}
        bottles={bottles}
        onUpdateBottle={handleBottleUpdated}
        onPreviewBottleLink={handlePreviewBottleLink}
        wishes={wishes}
        onUpdateWish={handleUpdateWish}
        onAddWish={handleAddWish}
        onDeleteWish={handleDeleteWish}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        ritualData={ritualData}
        onUpdateRitual={handleUpdateRitual}
        pastEdition={pastEdition}
        onUpdatePastEdition={handleUpdatePastEdition}
        gameQuestions={gameQuestions}
        onUpdateGameQuestions={handleUpdateGameQuestions}
        secondLifeData={secondLifeData}
        onUpdateSecondLife={handleUpdateSecondLife}
        onResetData={handleResetData}
      />
    </div>
  );
}
