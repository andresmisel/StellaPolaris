import React, { useState, useEffect } from 'react';
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

  // Detect bottle link on initial page load: all 50 bottles are already authenticated,
  // so entering from each link simply enters the webapp and announces which bottle was opened.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const bottleParam = params.get('botella');
    const titularParam = params.get('titular') || undefined;

    if (!tokenParam && !bottleParam) return;

    let resolvedNumber: number | null = null;

    if (tokenParam) {
      const cleanToken = tokenParam.trim().toUpperCase();
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

      const target = bottles.find((b) => b.number === parsed.bottleNumber);
      if (!target) {
        setLinkAuthError('Botella no encontrada en la colección 01/50.');
        return;
      }
      if (target.tokenRegenerated && target.authToken.toUpperCase() !== cleanToken) {
        setLinkAuthError(
          'Este enlace fue reemplazado por uno más reciente desde el panel Superadmin.'
        );
        return;
      }
      resolvedNumber = target.number;
    } else if (bottleParam) {
      const num = parseInt(bottleParam, 10);
      const target = !Number.isNaN(num) ? bottles.find((b) => b.number === num) : undefined;
      if (!target) {
        setLinkAuthError('Número de botella no encontrado en el lote 01/50.');
        return;
      }
      resolvedNumber = target.number;
    }

    if (resolvedNumber !== null) {
      if (titularParam && titularParam.trim()) {
        const updatedList = bottles.map((b) =>
          b.number === resolvedNumber &&
          (!b.ownerName || b.ownerName.startsWith('Propietario Ejemplar'))
            ? { ...b, ownerName: titularParam.trim(), claimed: true }
            : b
        );
        setBottles(updatedList);
        saveStoredBottles(updatedList);
      }
      setAuthenticatedBottleNumber(resolvedNumber);
      setMyClaimedBottle(resolvedNumber);
      setOpenedViaBottleLink(true);
      setLinkAuthError(null);
      triggerCelebration();
    }
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

  // Update a bottle (personalized by owner or edited by admin)
  const handleBottleUpdated = (updatedBottle: Bottle) => {
    const updated = bottles.map((b) => (b.number === updatedBottle.number ? updatedBottle : b));
    setBottles(updated);
    saveStoredBottles(updated);
  };

  // Superadmin previews/tests a specific bottle's link: closes admin panel and enters webapp showing that opened bottle
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

  // Add a wish to the wall
  const handleAddWish = (newWishData: Omit<Wish, 'id' | 'createdAt' | 'likes'>) => {
    const newWish: Wish = {
      ...newWishData,
      id: `w-${Date.now()}`,
      createdAt: 'Hace un momento',
      likes: 1,
    };
    const updated = [newWish, ...wishes];
    setWishes(updated);
    saveStoredWishes(updated);
  };

  // Like a wish
  const handleLikeWish = (wishId: string) => {
    const updated = wishes.map((w) => (w.id === wishId ? { ...w, likes: w.likes + 1 } : w));
    setWishes(updated);
    saveStoredWishes(updated);
  };

  // Admin: Update wish (edit / approve / pin)
  const handleUpdateWish = (updatedWish: Wish) => {
    const updated = wishes.map((w) => (w.id === updatedWish.id ? updatedWish : w));
    setWishes(updated);
    saveStoredWishes(updated);
  };

  // Admin: Delete wish
  const handleDeleteWish = (wishId: string) => {
    const updated = wishes.filter((w) => w.id !== wishId);
    setWishes(updated);
    saveStoredWishes(updated);
  };

  // Admin: Update settings (descriptions, images, video & playlist)
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Admin: Update Ritual
  const handleUpdateRitual = (newRitual: RitualData) => {
    setRitualData(newRitual);
    saveStoredRitual(newRitual);
  };

  // Admin: Update Past Edition
  const handleUpdatePastEdition = (newEdition: PastEdition) => {
    setPastEdition(newEdition);
    saveStoredPastEdition(newEdition);
  };

  // Admin: Update Tabletop Game Questions
  const handleUpdateGameQuestions = (newQuestions: GameQuestion[]) => {
    setGameQuestions(newQuestions);
    saveStoredGameQuestions(newQuestions);
  };

  // Admin: Update Bottle Second Life
  const handleUpdateSecondLife = (newData: SecondLifeData) => {
    setSecondLifeData(newData);
    saveStoredSecondLife(newData);
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
