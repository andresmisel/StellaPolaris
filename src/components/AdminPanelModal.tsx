import React, { useState, useEffect } from 'react';
import {
  Bottle,
  Wish,
  AppSettings,
  RitualData,
  RitualStep,
  RitualIconName,
  PastEdition,
  GameQuestion,
  SecondLifeData,
  SecondLifeStep,
} from '../types';
import { DEFAULT_SITE_IMAGES } from '../data/initialData';
import {
  Lock,
  Unlock,
  LogOut,
  Check,
  Trash2,
  Pin,
  Link2,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  Upload,
  Plus,
  Edit3,
  RotateCcw,
  Image as ImageIcon,
  FileText,
  Wine,
  Archive,
  Dices,
  Heart,
  Lightbulb,
  Cloud,
  CloudOff,
  CheckCircle2,
  Loader2,
  Code2,
  Download,
} from 'lucide-react';
import { sound, compressImageFileToDataUrl } from '../utils/storage';
import { generateBottleToken, buildBottleAuthUrl } from '../utils/bottleTokens';
import type { CloudSyncStatus } from '../App';

type AdminTab =
  | 'bottles'
  | 'content'
  | 'images'
  | 'ritual'
  | 'past'
  | 'game'
  | 'wishes'
  | 'secondLife'
  | 'export';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  isCloudAdmin: boolean;
  cloudUserEmail: string | null;
  cloudSyncStatus: CloudSyncStatus;
  cloudSyncError: string | null;
  hasLocalUnsyncedEdits: boolean;
  onConnectCloudAdmin: () => Promise<boolean>;
  onDisconnectCloudAdmin: () => Promise<void>;
  onSyncAllToCloud: () => Promise<boolean>;
  bottles: Bottle[];
  onUpdateBottle: (updated: Bottle) => void;
  onPreviewBottleLink: (bottle: Bottle) => void;
  wishes: Wish[];
  onUpdateWish: (updated: Wish) => void;
  onAddWish: (newWish: Omit<Wish, 'id' | 'createdAt' | 'likes'>) => void;
  onDeleteWish: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  ritualData: RitualData;
  onUpdateRitual: (ritual: RitualData) => void;
  pastEdition: PastEdition;
  onUpdatePastEdition: (edition: PastEdition) => void;
  gameQuestions: GameQuestion[];
  onUpdateGameQuestions: (questions: GameQuestion[]) => void;
  secondLifeData: SecondLifeData;
  onUpdateSecondLife: (data: SecondLifeData) => void;
  onResetData: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  onLogin,
  onLogout,
  isCloudAdmin,
  cloudUserEmail,
  cloudSyncStatus,
  cloudSyncError,
  hasLocalUnsyncedEdits,
  onConnectCloudAdmin,
  onDisconnectCloudAdmin,
  onSyncAllToCloud,
  bottles,
  onUpdateBottle,
  onPreviewBottleLink,
  wishes,
  onUpdateWish,
  onAddWish,
  onDeleteWish,
  settings,
  onUpdateSettings,
  ritualData,
  onUpdateRitual,
  pastEdition,
  onUpdatePastEdition,
  gameQuestions,
  onUpdateGameQuestions,
  secondLifeData,
  onUpdateSecondLife,
  onResetData,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('bottles');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [copiedBackupJson, setCopiedBackupJson] = useState(false);

  // Content & Media draft state
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);

  // Ritual draft state
  const [draftRitual, setDraftRitual] = useState<RitualData>(ritualData);

  // Past Edition draft state
  const [draftPast, setDraftPast] = useState<PastEdition>(pastEdition);

  // Second Life draft state
  const [draftSecondLife, setDraftSecondLife] = useState<SecondLifeData>(secondLifeData);

  // Bottle editing & unique links state
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);
  const [bottleSearch, setBottleSearch] = useState('');
  const [copiedBottleNum, setCopiedBottleNum] = useState<number | null>(null);
  const [copiedAllLinks, setCopiedAllLinks] = useState(false);
  const [generatedNoticeNum, setGeneratedNoticeNum] = useState<number | null>(null);

  // Wishes editing & creating state
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [showNewWishForm, setShowNewWishForm] = useState(false);
  const [newWishAuthor, setNewWishAuthor] = useState('');
  const [newWishLocation, setNewWishLocation] = useState('');
  const [newWishBottle, setNewWishBottle] = useState('');
  const [newWishMessage, setNewWishMessage] = useState('');
  const [confirmDeleteWishId, setConfirmDeleteWishId] = useState<string | null>(null);

  // Tabletop Game editing & creating state
  const [gameModeFilter, setGameModeFilter] = useState<'all' | GameQuestion['type']>('all');
  const [editingQuestion, setEditingQuestion] = useState<GameQuestion | null>(null);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

  // Image upload error state
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftSettings(settings);
      setDraftRitual(ritualData);
      setDraftPast(pastEdition);
      setDraftSecondLife(secondLifeData);
      setConfirmReset(false);
      setImageUploadError(null);
    }
  }, [isOpen, settings, ritualData, pastEdition, secondLifeData]);

  if (!isOpen) return null;

  const notifySaved = (msg: string) => {
    sound.playFestiveChime();
    const finalMsg = isCloudAdmin
      ? `${msg} (Guardado permanentemente en la nube)`
      : `${msg} (Guardado local — conecta Google arriba para hacerlo permanente)`;
    setSaveToast(finalMsg);
    setTimeout(() => {
      setSaveToast((curr) => (curr === finalMsg ? null : curr));
    }, 3500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playGlassClink();
    const success = onLogin(passwordInput.trim());
    if (success) {
      setAuthError(false);
      setPasswordInput('');
      sound.playFestiveChime();
    } else {
      setAuthError(true);
      sound.playTick();
    }
  };

  // --- Content & Media Save ---
  const handleSaveContentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...draftSettings,
      playlistUrl: draftSettings.playlistUrl.trim(),
    });
    notifySaved('Textos y enlace de música guardados con éxito.');
  };

  // --- Image Substitution Handlers ---
  const handleSiteImageUpload = async (
    key: keyof AppSettings['images'] | 'pastEditionBottle',
    file?: File
  ) => {
    if (!file) return;
    setImageUploadError(null);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      if (key === 'pastEditionBottle') {
        const updatedPast = { ...draftPast, imageSrc: dataUrl };
        setDraftPast(updatedPast);
        onUpdatePastEdition(updatedPast);
      } else {
        const updatedSettings: AppSettings = {
          ...draftSettings,
          images: {
            ...draftSettings.images,
            [key]: dataUrl,
          },
        };
        setDraftSettings(updatedSettings);
        onUpdateSettings(updatedSettings);
      }
      notifySaved('Imagen sustituida y guardada.');
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : 'Error al procesar la imagen.');
    }
  };

  const handleSaveImagesUrls = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(draftSettings);
    onUpdatePastEdition(draftPast);
    notifySaved('Imágenes actualizadas correctamente.');
  };

  // --- Ritual Handlers ---
  const handleSaveRitual = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRitual(draftRitual);
    notifySaved('Ritual de degustación actualizado.');
  };

  const handleAddRitualStep = () => {
    sound.playTick();
    const nextNum = (draftRitual.steps.length + 1).toString().padStart(2, '0');
    const newStep: RitualStep = {
      number: nextNum,
      title: 'Nuevo Paso del Ritual',
      subtitle: 'Subtítulo del paso',
      desc: 'Describe aquí la acción recomendada para disfrutar Stella Polaris.',
      tip: 'Consejo del maestro destilador.',
      iconName: 'Star',
    };
    setDraftRitual({ ...draftRitual, steps: [...draftRitual.steps, newStep] });
  };

  // --- Past Edition Handlers ---
  const handleSavePastEdition = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePastEdition({
      ...draftPast,
      keyFeatures: draftPast.keyFeatures.filter((f) => f.trim().length > 0),
    });
    notifySaved('Edición Pasada actualizada correctamente.');
  };

  // --- Second Life Handlers ---
  const handleSaveSecondLife = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSecondLife({
      ...draftSecondLife,
      steps: draftSecondLife.steps.filter((s) => s.title.trim().length > 0 || s.desc.trim().length > 0),
    });
    onUpdateSettings(draftSettings);
    notifySaved('La Segunda Vida de la Botella actualizada correctamente.');
  };

  const handleAddSecondLifeStep = () => {
    sound.playTick();
    const nextNum = (draftSecondLife.steps.length + 1).toString().padStart(2, '0');
    const newStep: SecondLifeStep = {
      step: nextNum,
      title: 'Nuevo Paso de la Lámpara',
      desc: 'Describe aquí cómo preparar o decorar tu botella Stella Polaris.',
    };
    setDraftSecondLife({
      ...draftSecondLife,
      steps: [...draftSecondLife.steps, newStep],
    });
  };

  // --- Bottles Handlers ---
  const handleBottleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBottle) return;
    sound.playGlassClink();
    onUpdateBottle({ ...editingBottle, claimed: true });
    setEditingBottle(null);
    notifySaved(`Botella ${editingBottle.formattedNumber} actualizada.`);
  };

  const handleGenerateUniqueLink = (bottle: Bottle) => {
    sound.playFestiveChime();
    const newToken = generateBottleToken(bottle.number);
    const updated: Bottle = {
      ...bottle,
      authToken: newToken,
      tokenRegenerated: true,
    };
    onUpdateBottle(updated);
    if (editingBottle && editingBottle.number === bottle.number) {
      setEditingBottle(updated);
    }
    setGeneratedNoticeNum(bottle.number);
    setTimeout(() => {
      setGeneratedNoticeNum((curr) => (curr === bottle.number ? null : curr));
    }, 2500);
  };

  const handleCopyBottleLink = (bottle: Bottle) => {
    sound.playGlassClink();
    const url = buildBottleAuthUrl(bottle.number, bottle.authToken, bottle.ownerName);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedBottleNum(bottle.number);
      setTimeout(() => {
        setCopiedBottleNum((curr) => (curr === bottle.number ? null : curr));
      }, 2200);
    }
  };

  const handleCopyAllLinks = () => {
    sound.playFestiveChime();
    const lines = bottles.map((b) => {
      const url = buildBottleAuthUrl(b.number, b.authToken, b.ownerName);
      const ownerTag = b.ownerName ? ` (${b.ownerName})` : '';
      return `Botella ${b.formattedNumber}${ownerTag}: ${url}`;
    });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopiedAllLinks(true);
      setTimeout(() => setCopiedAllLinks(false), 3000);
    }
  };

  // --- Tabletop Game Handlers ---
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    if (!editingQuestion.prompt.trim()) return;

    const cleanQ: GameQuestion = {
      ...editingQuestion,
      title: editingQuestion.title.trim() || 'Pregunta de Sobremesa',
      prompt: editingQuestion.prompt.trim(),
      tag: editingQuestion.tag.trim() || 'Navidad',
      options:
        editingQuestion.type === 'trivia'
          ? (editingQuestion.options || ['', '', '', '']).map((o) => o.trim() || 'Opción')
          : undefined,
      correctAnswer:
        editingQuestion.type === 'trivia' ? editingQuestion.correctAnswer ?? 0 : undefined,
      explanation:
        editingQuestion.type === 'trivia' ? editingQuestion.explanation?.trim() || '' : undefined,
    };

    if (isCreatingQuestion) {
      onUpdateGameQuestions([cleanQ, ...gameQuestions]);
      notifySaved('Nueva pregunta añadida al Juego de Sobremesa.');
    } else {
      onUpdateGameQuestions(gameQuestions.map((q) => (q.id === cleanQ.id ? cleanQ : q)));
      notifySaved('Pregunta actualizada.');
    }
    setEditingQuestion(null);
    setIsCreatingQuestion(false);
  };

  const handleDeleteQuestion = (id: string) => {
    sound.playTick();
    onUpdateGameQuestions(gameQuestions.filter((q) => q.id !== id));
    notifySaved('Pregunta eliminada del juego.');
  };

  // --- Wishes Handlers ---
  const handleSaveWishEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWish) return;
    onUpdateWish(editingWish);
    setEditingWish(null);
    notifySaved('Deseo del muro actualizado.');
  };

  const handleCreateWishAsAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWishAuthor.trim() || !newWishMessage.trim()) return;
    const bNum = newWishBottle.trim() ? parseInt(newWishBottle.replace(/\D/g, ''), 10) : undefined;
    onAddWish({
      author: newWishAuthor.trim(),
      bottleNumber: bNum && bNum >= 1 && bNum <= 50 ? bNum : undefined,
      location: newWishLocation.trim() || 'Comunidad Stella Polaris',
      message: newWishMessage.trim(),
      category: 'Brindis Navideño',
      approved: true,
      pinned: false,
    });
    setNewWishAuthor('');
    setNewWishLocation('');
    setNewWishBottle('');
    setNewWishMessage('');
    setShowNewWishForm(false);
    notifySaved('Nuevo deseo añadido al muro.');
  };

  const filteredBottles = bottles.filter((b) => {
    if (!bottleSearch.trim()) return true;
    const q = bottleSearch.trim().toLowerCase();
    return (
      b.formattedNumber.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.authToken.toLowerCase().includes(q) ||
      (b.ownerName && b.ownerName.toLowerCase().includes(q))
    );
  });

  const filteredQuestions = gameQuestions.filter((q) =>
    gameModeFilter === 'all' ? true : q.type === gameModeFilter
  );

  const pendingWishesCount = wishes.filter((w) => !w.approved).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#1C050B] border border-[#801C2E] rounded-2xl shadow-2xl text-[#FDF8F0] overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#5C1423]/60 bg-[#140307]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E25822]/20 border border-[#E25822] flex items-center justify-center text-[#F59E0B]">
              {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                Panel Superadmin · Stella Polaris
              </h3>
              <p className="text-xs text-[#F4D9C6]/60">
                {isAdmin
                  ? 'Editor Integral del Sitio (Textos, Imágenes, Ritual, Edición Pasada, Juego, Muro y Botellas)'
                  : 'Ingresa la clave única de administración'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  sound.playTick();
                  onLogout();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#FDE68A] bg-[#801C2E]/80 hover:bg-[#801C2E] border border-[#E25822]/50 rounded-md transition-colors whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir del Superadmin</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#F4D9C6]/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Password Form if not logged in */}
        {!isAdmin ? (
          <div className="p-8 sm:p-12 max-w-md mx-auto text-center">
            <div className="w-14 h-14 rounded-full bg-[#801C2E]/40 border border-[#E25822] flex items-center justify-center mx-auto mb-4 text-[#F59E0B]">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-2xl text-white font-bold mb-2">
              Acceso Exclusivo de Administración
            </h4>
            <p className="text-xs text-[#F4D9C6]/70 mb-6">
              Ingresa la clave maestra única para gestionar botellas, editar descripciones, sustituir imágenes y administrar cada sección.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Introduce la clave única"
                  className="w-full bg-[#120306] border border-[#801C2E] rounded-md px-4 py-3 text-sm text-center text-white placeholder-white/30 focus:border-[#E25822] focus:outline-none"
                />
                {authError && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Clave incorrecta. Verifica e intenta nuevamente.</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#E25822] to-[#D94F1C] text-white text-sm font-semibold rounded-md shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Desbloquear Panel
              </button>
            </form>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Permanent Cloud Sync Status & Google Auth Banner */}
            {!isCloudAdmin ? (
              <div className="mb-4 rounded-xl bg-gradient-to-r from-[#2D0A14] via-[#3A0C18] to-[#24070F] border border-[#F59E0B]/60 p-3.5 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/50 flex items-center justify-center text-[#F59E0B] shrink-0 mt-0.5">
                      <CloudOff className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#FDE68A]">
                        Activar Guardado Permanente en la Nube
                      </h4>
                      <p className="text-[11px] text-[#F4D9C6]/80 mt-0.5 leading-relaxed">
                        Conecta tu cuenta de Google administradora para que todas tus imágenes,
                        textos, rituales, deseos y enlaces se guarden de forma permanente en todos
                        los dispositivos.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isConnectingGoogle || cloudSyncStatus === 'syncing'}
                    onClick={async () => {
                      sound.playGlassClink();
                      setIsConnectingGoogle(true);
                      const ok = await onConnectCloudAdmin();
                      setIsConnectingGoogle(false);
                      if (ok) {
                        notifySaved('Cuenta conectada y datos sincronizados');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#E25822] to-[#D94F1C] hover:brightness-110 disabled:opacity-60 rounded-lg shadow-md transition-all shrink-0"
                  >
                    {isConnectingGoogle || cloudSyncStatus === 'syncing' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Conectando y guardando...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-3.5 h-3.5" />
                        <span>Conectar Google y Guardar Permanente</span>
                      </>
                    )}
                  </button>
                </div>
                {hasLocalUnsyncedEdits && (
                  <p className="mt-2 text-[11px] text-amber-300 font-medium">
                    Tienes cambios recientes en este navegador listos para subirse en cuanto conectes tu cuenta.
                  </p>
                )}
                {cloudSyncError && (
                  <p className="mt-2 text-[11px] text-rose-300 bg-rose-950/70 border border-rose-500/40 rounded px-2.5 py-1.5">
                    {cloudSyncError}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 px-4 py-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>Guardado Permanente Activo</strong> · {cloudUserEmail}
                    </span>
                    {cloudSyncStatus === 'syncing' && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 ml-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Guardando...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={cloudSyncStatus === 'syncing'}
                      onClick={async () => {
                        sound.playGlassClink();
                        const ok = await onSyncAllToCloud();
                        if (ok) {
                          notifySaved('Todo el contenido sincronizado en la nube');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-emerald-100 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 rounded transition-colors disabled:opacity-60"
                    >
                      <Cloud className="w-3 h-3" />
                      <span>Sincronizar Todo Ahora</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playTick();
                        void onDisconnectCloudAdmin();
                      }}
                      className="px-2.5 py-1 text-[11px] text-[#F4D9C6]/70 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors"
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
                {cloudSyncError && (
                  <p className="mt-2 text-[11px] text-rose-300 bg-rose-950/70 border border-rose-500/40 rounded px-2.5 py-1.5">
                    {cloudSyncError}
                  </p>
                )}
              </div>
            )}

            {/* Save Notification Toast */}
            {saveToast && (
              <div className="mb-4 rounded-lg bg-emerald-950/90 border border-emerald-500/60 px-4 py-2.5 text-xs text-emerald-200 font-semibold flex items-center justify-between">
                <span>✓ {saveToast}</span>
                <button onClick={() => setSaveToast(null)} className="text-emerald-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Admin Navigation Tabs */}
            <div className="flex border-b border-[#5C1423]/60 mb-5 gap-1.5 overflow-x-auto pb-1">
              {[
                { id: 'bottles' as AdminTab, label: 'Botellas & Enlaces', icon: Link2 },
                { id: 'content' as AdminTab, label: 'Descripción & Música', icon: FileText },
                { id: 'images' as AdminTab, label: 'Imágenes', icon: ImageIcon },
                { id: 'ritual' as AdminTab, label: 'Ritual', icon: Wine },
                { id: 'past' as AdminTab, label: 'Edición Pasada', icon: Archive },
                { id: 'game' as AdminTab, label: 'Juegos Sobremesa', icon: Dices },
                {
                  id: 'wishes' as AdminTab,
                  label: `Muro Deseos${pendingWishesCount > 0 ? ` (${pendingWishesCount})` : ''}`,
                  icon: Heart,
                },
                { id: 'secondLife' as AdminTab, label: 'Segunda Vida', icon: Lightbulb },
                { id: 'export' as AdminTab, label: 'Código / Deploy', icon: Code2 },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      sound.playTick();
                      setActiveTab(t.id);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap rounded-t ${
                      active
                        ? 'border-[#E25822] text-[#F59E0B] bg-[#2B0912]/60'
                        : 'border-transparent text-[#F4D9C6]/65 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: BOTTLES & UNIQUE LINKS */}
            {activeTab === 'bottles' && (
              <div>
                {editingBottle ? (
                  <form
                    onSubmit={handleBottleEditSubmit}
                    className="bg-[#24070F] p-5 rounded-xl border border-[#801C2E] max-w-xl mx-auto space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-white text-base">
                        Editar Botella {editingBottle.formattedNumber} ({editingBottle.code})
                      </h4>
                      <span className="font-mono text-[11px] text-emerald-300 bg-emerald-950/70 border border-emerald-700 px-2 py-0.5 rounded">
                        Autenticada
                      </span>
                    </div>

                    <div className="bg-[#140307] border border-[#801C2E]/60 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#F59E0B] font-semibold uppercase tracking-wider">
                          Enlace Directo de esta Botella
                        </span>
                        <button
                          type="button"
                          onClick={() => handleGenerateUniqueLink(editingBottle)}
                          className="inline-flex items-center gap-1 text-[#E25822] hover:text-[#FDE68A] font-semibold"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regenerar Enlace</span>
                        </button>
                      </div>
                      <p className="font-mono text-[11px] text-[#F4D9C6]/80 break-all bg-black/40 p-2 rounded border border-white/5">
                        {buildBottleAuthUrl(
                          editingBottle.number,
                          editingBottle.authToken,
                          editingBottle.ownerName
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyBottleLink(editingBottle)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#E25822] hover:bg-[#F16E28] rounded transition-colors"
                        >
                          {copiedBottleNum === editingBottle.number ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Enlace</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateBottle({ ...editingBottle, claimed: true });
                            onPreviewBottleLink(editingBottle);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FDE68A] bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Probar Enlace</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#F4D9C6] mb-1">
                        Propietario / Titular
                      </label>
                      <input
                        type="text"
                        value={editingBottle.ownerName || ''}
                        onChange={(e) =>
                          setEditingBottle({ ...editingBottle, ownerName: e.target.value })
                        }
                        placeholder="Nombre del comprador o familia"
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#F4D9C6] mb-1">
                        Ciudad / País
                      </label>
                      <input
                        type="text"
                        value={editingBottle.location || ''}
                        onChange={(e) =>
                          setEditingBottle({ ...editingBottle, location: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#F4D9C6] mb-1">
                        Dedicatoria
                      </label>
                      <input
                        type="text"
                        value={editingBottle.dedication || ''}
                        onChange={(e) =>
                          setEditingBottle({ ...editingBottle, dedication: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingBottle(null)}
                        className="px-3 py-1.5 text-xs text-[#F4D9C6]/70 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#E25822] text-white text-xs font-semibold rounded hover:bg-[#F16E28]"
                      >
                        Guardar Cambios
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 text-[#F4D9C6]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={bottleSearch}
                          onChange={(e) => setBottleSearch(e.target.value)}
                          placeholder="Buscar botella (ej. 07, titular o código)..."
                          className="w-full bg-[#120306] border border-[#801C2E] rounded-md pl-8 pr-3 py-2 text-xs text-white placeholder-white/35 focus:border-[#E25822] focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyAllLinks}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#FDE68A] bg-[#2B0912] hover:bg-[#3A0C18] border border-[#801C2E] rounded-md transition-colors whitespace-nowrap"
                      >
                        {copiedAllLinks ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Los 50 enlaces copiados!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span>Copiar los 50 Enlaces Únicos</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#F4D9C6]/70 mb-3">
                      Las 50 botellas están autenticadas por defecto. Al abrir cualquiera de estos enlaces, el visitante entra a la web viendo inmediatamente qué botella acaba de abrir y su certificado.
                    </p>

                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                      {filteredBottles.map((b) => {
                        const uniqueUrl = buildBottleAuthUrl(b.number, b.authToken, b.ownerName);
                        const isCopied = copiedBottleNum === b.number;
                        const wasJustGenerated = generatedNoticeNum === b.number;

                        return (
                          <div
                            key={b.number}
                            className="bg-[#24070F] border border-[#801C2E]/50 hover:border-[#801C2E] rounded-xl p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-mono text-sm font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-[#801C2E]/50">
                                  {b.formattedNumber}
                                </span>
                                <span className="font-mono text-[11px] text-[#FDE68A]">
                                  {b.code}
                                </span>
                                <span className="text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-semibold">
                                  Autenticada {b.ownerName ? `· ${b.ownerName}` : ''}
                                </span>
                                {wasJustGenerated && (
                                  <span className="text-[10px] text-emerald-300 font-semibold">
                                    ✓ Nuevo enlace generado
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#F4D9C6]/65 truncate">
                                <Link2 className="w-3 h-3 text-[#E25822] shrink-0" />
                                <span className="truncate">{uniqueUrl}</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleGenerateUniqueLink(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#F4D9C6] bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                              >
                                <RefreshCw className="w-3 h-3 text-[#F59E0B]" />
                                <span>Regenerar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleCopyBottleLink(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-[#E25822] hover:bg-[#F16E28] rounded transition-colors"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>¡Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copiar Enlace</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => onPreviewBottleLink(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-[#FDE68A] bg-[#801C2E]/60 hover:bg-[#801C2E] border border-[#E25822]/40 rounded transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Probar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  sound.playTick();
                                  setEditingBottle(b);
                                }}
                                className="px-2.5 py-1.5 text-[11px] font-semibold text-[#F59E0B] hover:text-white transition-colors"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PAGE DESCRIPTIONS & MEDIA URLS */}
            {activeTab === 'content' && (
              <form
                onSubmit={handleSaveContentSettings}
                className="space-y-4 max-h-[460px] overflow-y-auto pr-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                      Año de Edición Actual
                    </label>
                    <input
                      type="number"
                      value={draftSettings.editionYear}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          editionYear: parseInt(e.target.value, 10) || 2026,
                        })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                      Color de la Botella Actual
                    </label>
                    <input
                      type="text"
                      value={draftSettings.bottleColor}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, bottleColor: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                      Cintillo Superior (Kicker Hero)
                    </label>
                    <input
                      type="text"
                      value={draftSettings.heroKicker}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, heroKicker: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                      Subtítulo Principal (Hero)
                    </label>
                    <input
                      type="text"
                      value={draftSettings.heroSubtitle}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, heroSubtitle: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                    Descripción Principal de la Página (Portada / Hero)
                  </label>
                  <textarea
                    rows={3}
                    value={draftSettings.heroDescription}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, heroDescription: e.target.value })
                    }
                    className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs sm:text-sm text-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                      Descripción Sección Historia ("Cómo Nació la Receta")
                    </label>
                    <textarea
                      rows={2}
                      value={draftSettings.storyDescription}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, storyDescription: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                      Cita / Relato Familiar (Historia)
                    </label>
                    <textarea
                      rows={2}
                      value={draftSettings.storyQuote}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, storyQuote: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#FDE68A] mb-1">
                    Descripción del Pie de Página (Footer)
                  </label>
                  <textarea
                    rows={2}
                    value={draftSettings.footerDescription}
                    onChange={(e) =>
                      setDraftSettings({ ...draftSettings, footerDescription: e.target.value })
                    }
                    className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-2 border-t border-[#5C1423]/60">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1">
                      URL Playlist Navideña (YouTube o Embed)
                    </label>
                    <input
                      type="text"
                      value={draftSettings.playlistUrl}
                      onChange={(e) =>
                        setDraftSettings({ ...draftSettings, playlistUrl: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    {confirmReset ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-rose-300">¿Restablecer todo a fábrica?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onResetData();
                            setConfirmReset(false);
                            notifySaved('Datos restablecidos a valores originales.');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-rose-700 text-white rounded hover:bg-rose-600"
                        >
                          Sí, restablecer
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmReset(false)}
                          className="px-2 py-1 text-xs text-[#F4D9C6]/70 hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        Restablecer valores de fábrica
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#E25822] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#F16E28] transition-colors"
                  >
                    Guardar Descripciones & Música
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: REPLACE SITE IMAGES */}
            {activeTab === 'images' && (
              <form
                onSubmit={handleSaveImagesUrls}
                className="space-y-4 max-h-[460px] overflow-y-auto pr-2"
              >
                <p className="text-xs text-[#F4D9C6]/75">
                  Sustituye cualquier fotografía subiendo un archivo desde tu dispositivo o pegando una URL de imagen.
                </p>

                {imageUploadError && (
                  <p className="text-xs text-rose-400 bg-rose-950/60 border border-rose-500/40 p-2.5 rounded">
                    {imageUploadError}
                  </p>
                )}

                {(
                  [
                    {
                      key: 'heroBottle',
                      label: '1. Botella Principal Portada (Edición 2026)',
                      value: draftSettings.images.heroBottle,
                      defaultVal: DEFAULT_SITE_IMAGES.heroBottle,
                      isPast: false,
                    },
                    {
                      key: 'ritualGlass',
                      label: '2. Copa del Ritual de Degustación',
                      value: draftSettings.images.ritualGlass,
                      defaultVal: DEFAULT_SITE_IMAGES.ritualGlass,
                      isPast: false,
                    },
                    {
                      key: 'storyKitchen',
                      label: '3. Fotografía "Cómo Nació la Receta" (Cocina Artesanal)',
                      value: draftSettings.images.storyKitchen,
                      defaultVal: DEFAULT_SITE_IMAGES.storyKitchen,
                      isPast: false,
                    },
                    {
                      key: 'pastEditionBottle',
                      label: `4. Fotografía Edición Pasada (${draftPast.year})`,
                      value: draftPast.imageSrc,
                      defaultVal: DEFAULT_SITE_IMAGES.pastEditionBottle,
                      isPast: true,
                    },
                    {
                      key: 'secondLifeLantern',
                      label: '5. Lámpara de Luces / Segunda Vida de la Botella',
                      value: draftSettings.images.secondLifeLantern,
                      defaultVal: DEFAULT_SITE_IMAGES.secondLifeLantern,
                      isPast: false,
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.key}
                    className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center"
                  >
                    <div className="w-28 h-20 rounded-lg overflow-hidden border border-[#801C2E] bg-black shrink-0">
                      <img
                        src={item.value}
                        alt={item.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <p className="text-xs font-semibold text-[#FDE68A]">{item.label}</p>
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (item.isPast) {
                            setDraftPast({ ...draftPast, imageSrc: val });
                          } else {
                            setDraftSettings({
                              ...draftSettings,
                              images: { ...draftSettings.images, [item.key]: val },
                            });
                          }
                        }}
                        placeholder="Pega URL o ruta de imagen..."
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-1.5 text-xs text-white font-mono"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-[#E25822] hover:bg-[#F16E28] text-white rounded transition-colors">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir Archivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSiteImageUpload(item.key, e.target.files?.[0])}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            sound.playTick();
                            if (item.isPast) {
                              const nextPast = { ...draftPast, imageSrc: item.defaultVal };
                              setDraftPast(nextPast);
                              onUpdatePastEdition(nextPast);
                            } else {
                              const nextSettings = {
                                ...draftSettings,
                                images: {
                                  ...draftSettings.images,
                                  [item.key]: item.defaultVal,
                                },
                              };
                              setDraftSettings(nextSettings);
                              onUpdateSettings(nextSettings);
                            }
                            notifySaved('Imagen restaurada a la original.');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-[#F4D9C6]/80 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restaurar Original</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#E25822] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#F16E28]"
                  >
                    Guardar Cambios de Imágenes
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: EDIT TASTING RITUAL */}
            {activeTab === 'ritual' && (
              <form
                onSubmit={handleSaveRitual}
                className="space-y-5 max-h-[460px] overflow-y-auto pr-2"
              >
                <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-3">
                  <h4 className="font-serif text-sm font-bold text-[#F59E0B]">
                    Cabecera & Detalles de Servicio del Ritual
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Título de Sección
                      </label>
                      <input
                        type="text"
                        value={draftRitual.sectionTitle}
                        onChange={(e) =>
                          setDraftRitual({ ...draftRitual, sectionTitle: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Temperatura Ideal (Etiqueta)
                      </label>
                      <input
                        type="text"
                        value={draftRitual.temperatureBadge}
                        onChange={(e) =>
                          setDraftRitual({ ...draftRitual, temperatureBadge: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Descripción Introductoria del Ritual
                    </label>
                    <textarea
                      rows={2}
                      value={draftRitual.sectionDescription}
                      onChange={(e) =>
                        setDraftRitual({ ...draftRitual, sectionDescription: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Título Tarjeta Copa
                      </label>
                      <input
                        type="text"
                        value={draftRitual.glassCardTitle}
                        onChange={(e) =>
                          setDraftRitual({ ...draftRitual, glassCardTitle: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Subtítulo Tarjeta Copa
                      </label>
                      <input
                        type="text"
                        value={draftRitual.glassCardSubtitle}
                        onChange={(e) =>
                          setDraftRitual({ ...draftRitual, glassCardSubtitle: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Ritual Steps */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-[#F59E0B]">
                      Pasos del Ritual ({draftRitual.steps.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddRitualStep}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#E25822]/20 hover:bg-[#E25822]/40 text-[#FDE68A] border border-[#E25822]/50 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Paso</span>
                    </button>
                  </div>

                  {draftRitual.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#F59E0B]">
                          Paso #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={step.iconName}
                            onChange={(e) => {
                              const next = [...draftRitual.steps];
                              next[idx] = {
                                ...step,
                                iconName: e.target.value as RitualIconName,
                              };
                              setDraftRitual({ ...draftRitual, steps: next });
                            }}
                            className="bg-[#120306] border border-[#801C2E] rounded px-2 py-1 text-[11px] text-white"
                          >
                            <option value="ThermometerSnowflake">Icono Frío</option>
                            <option value="RefreshCw">Icono Agitado</option>
                            <option value="Wine">Icono Copa</option>
                            <option value="Sparkles">Icono Destellos</option>
                            <option value="Star">Icono Estrella</option>
                            <option value="Flame">Icono Llama</option>
                          </select>
                          {draftRitual.steps.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setDraftRitual({
                                  ...draftRitual,
                                  steps: draftRitual.steps.filter((_, i) => i !== idx),
                                })
                              }
                              className="p-1 text-rose-400 hover:text-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={step.number}
                          onChange={(e) => {
                            const next = [...draftRitual.steps];
                            next[idx] = { ...step, number: e.target.value };
                            setDraftRitual({ ...draftRitual, steps: next });
                          }}
                          placeholder="01"
                          className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const next = [...draftRitual.steps];
                            next[idx] = { ...step, title: e.target.value };
                            setDraftRitual({ ...draftRitual, steps: next });
                          }}
                          placeholder="Título del paso"
                          className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white sm:col-span-2"
                        />
                      </div>

                      <input
                        type="text"
                        value={step.subtitle}
                        onChange={(e) => {
                          const next = [...draftRitual.steps];
                          next[idx] = { ...step, subtitle: e.target.value };
                          setDraftRitual({ ...draftRitual, steps: next });
                        }}
                        placeholder="Subtítulo"
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />

                      <textarea
                        rows={2}
                        value={step.desc}
                        onChange={(e) => {
                          const next = [...draftRitual.steps];
                          next[idx] = { ...step, desc: e.target.value };
                          setDraftRitual({ ...draftRitual, steps: next });
                        }}
                        placeholder="Descripción del paso..."
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />

                      <input
                        type="text"
                        value={step.tip}
                        onChange={(e) => {
                          const next = [...draftRitual.steps];
                          next[idx] = { ...step, tip: e.target.value };
                          setDraftRitual({ ...draftRitual, steps: next });
                        }}
                        placeholder="Tip / Consejo destacado..."
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-[#FDE68A]"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#E25822] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#F16E28]"
                  >
                    Guardar Ritual
                  </button>
                </div>
              </form>
            )}

            {/* TAB 5: EDIT PAST EDITION */}
            {activeTab === 'past' && (
              <form
                onSubmit={handleSavePastEdition}
                className="space-y-4 max-h-[460px] overflow-y-auto pr-2"
              >
                <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-28 h-20 rounded-lg overflow-hidden border border-[#1E4A38] bg-black shrink-0">
                    <img
                      src={draftPast.imageSrc}
                      alt={`Edición ${draftPast.year}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-semibold text-[#FDE68A]">
                      Imagen de la Edición Pasada (URL o Subir Archivo)
                    </label>
                    <input
                      type="text"
                      value={draftPast.imageSrc}
                      onChange={(e) => setDraftPast({ ...draftPast, imageSrc: e.target.value })}
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-[#E25822] hover:bg-[#F16E28] text-white rounded">
                      <Upload className="w-3 h-3" />
                      <span>Subir Foto Edición Pasada</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleSiteImageUpload('pastEditionBottle', e.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">Año</label>
                    <input
                      type="number"
                      value={draftPast.year}
                      onChange={(e) =>
                        setDraftPast({ ...draftPast, year: parseInt(e.target.value, 10) || 2025 })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Cantidad Producida
                    </label>
                    <input
                      type="number"
                      value={draftPast.quantityMade}
                      onChange={(e) =>
                        setDraftPast({
                          ...draftPast,
                          quantityMade: parseInt(e.target.value, 10) || 35,
                        })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">Estado (Sello)</label>
                    <input
                      type="text"
                      value={draftPast.status}
                      onChange={(e) => setDraftPast({ ...draftPast, status: e.target.value })}
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Color de Cristal
                    </label>
                    <input
                      type="text"
                      value={draftPast.bottleColor}
                      onChange={(e) => setDraftPast({ ...draftPast, bottleColor: e.target.value })}
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Etiqueta de Cantidad
                    </label>
                    <input
                      type="text"
                      value={draftPast.quantityLabel}
                      onChange={(e) =>
                        setDraftPast({ ...draftPast, quantityLabel: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Color Sello de Lacre
                    </label>
                    <input
                      type="text"
                      value={draftPast.waxSealColor}
                      onChange={(e) => setDraftPast({ ...draftPast, waxSealColor: e.target.value })}
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#F4D9C6] mb-1">
                    Descripción Histórica
                  </label>
                  <textarea
                    rows={3}
                    value={draftPast.description}
                    onChange={(e) => setDraftPast({ ...draftPast, description: e.target.value })}
                    className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#F4D9C6] mb-1">
                    Nota Final Ficha Histórica (Modal)
                  </label>
                  <textarea
                    rows={2}
                    value={draftPast.archiveNote}
                    onChange={(e) => setDraftPast({ ...draftPast, archiveNote: e.target.value })}
                    className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#FDE68A]">
                      Características Clave
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftPast({
                          ...draftPast,
                          keyFeatures: [...draftPast.keyFeatures, 'Nueva característica'],
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-[#F59E0B] hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {draftPast.keyFeatures.map((feat, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <input
                          type="text"
                          value={feat}
                          onChange={(e) => {
                            const next = [...draftPast.keyFeatures];
                            next[idx] = e.target.value;
                            setDraftPast({ ...draftPast, keyFeatures: next });
                          }}
                          className="flex-1 bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraftPast({
                              ...draftPast,
                              keyFeatures: draftPast.keyFeatures.filter((_, i) => i !== idx),
                            })
                          }
                          className="p-1 text-rose-400 hover:text-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#E25822] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#F16E28]"
                  >
                    Guardar Edición Pasada
                  </button>
                </div>
              </form>
            )}

            {/* TAB 6: EDIT TABLETOP GAME */}
            {activeTab === 'game' && (
              <div>
                {editingQuestion ? (
                  <form
                    onSubmit={handleSaveQuestion}
                    className="bg-[#24070F] border border-[#801C2E] rounded-xl p-5 space-y-3 max-w-2xl mx-auto max-h-[440px] overflow-y-auto"
                  >
                    <h4 className="font-serif text-base font-bold text-white">
                      {isCreatingQuestion ? 'Añadir Nueva Tarjeta de Juego' : 'Editar Tarjeta de Juego'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#F4D9C6] mb-1">
                          Categoría / Modo de Juego
                        </label>
                        <select
                          value={editingQuestion.type}
                          onChange={(e) => {
                            const t = e.target.value as GameQuestion['type'];
                            setEditingQuestion({
                              ...editingQuestion,
                              type: t,
                              options:
                                t === 'trivia'
                                  ? editingQuestion.options || [
                                      'Opción A',
                                      'Opción B',
                                      'Opción C',
                                      'Opción D',
                                    ]
                                  : undefined,
                              correctAnswer: t === 'trivia' ? editingQuestion.correctAnswer ?? 0 : undefined,
                            });
                          }}
                          className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                        >
                          <option value="likely">¿Quién es más probable que...?</option>
                          <option value="trivia">Trivia & Tradiciones</option>
                          <option value="memory">Recuerdos & Gratitud</option>
                          <option value="toast">Ruleta del Brindis</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-[#F4D9C6] mb-1">
                          Etiqueta (Tag)
                        </label>
                        <input
                          type="text"
                          value={editingQuestion.tag}
                          onChange={(e) =>
                            setEditingQuestion({ ...editingQuestion, tag: e.target.value })
                          }
                          placeholder="Ej. Sobremesa"
                          className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Título / Encabezado de la Tarjeta
                      </label>
                      <input
                        type="text"
                        value={editingQuestion.title}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, title: e.target.value })
                        }
                        placeholder="Ej. ¿Quién es más probable que..."
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Pregunta o Reto *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={editingQuestion.prompt}
                        onChange={(e) =>
                          setEditingQuestion({ ...editingQuestion, prompt: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>

                    {editingQuestion.type === 'trivia' && (
                      <div className="space-y-2 border-t border-[#801C2E]/50 pt-3">
                        <p className="text-xs font-semibold text-[#F59E0B]">
                          Opciones de Trivia (marca el círculo de la respuesta correcta)
                        </p>
                        {[0, 1, 2, 3].map((optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctTriviaOpt"
                              checked={(editingQuestion.correctAnswer ?? 0) === optIdx}
                              onChange={() =>
                                setEditingQuestion({
                                  ...editingQuestion,
                                  correctAnswer: optIdx,
                                })
                              }
                            />
                            <input
                              type="text"
                              value={editingQuestion.options?.[optIdx] || ''}
                              onChange={(e) => {
                                const opts = [
                                  ...(editingQuestion.options || ['', '', '', '']),
                                ];
                                opts[optIdx] = e.target.value;
                                setEditingQuestion({ ...editingQuestion, options: opts });
                              }}
                              placeholder={`Opción ${optIdx + 1}`}
                              className="flex-1 bg-[#120306] border border-[#801C2E] rounded px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="block text-[11px] text-[#F4D9C6] mb-1 mt-2">
                            Explicación al responder
                          </label>
                          <textarea
                            rows={2}
                            value={editingQuestion.explanation || ''}
                            onChange={(e) =>
                              setEditingQuestion({
                                ...editingQuestion,
                                explanation: e.target.value,
                              })
                            }
                            className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingQuestion(null);
                          setIsCreatingQuestion(false);
                        }}
                        className="px-3 py-1.5 text-xs text-[#F4D9C6]/70 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#E25822] text-white text-xs font-semibold rounded hover:bg-[#F16E28]"
                      >
                        Guardar Pregunta
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(
                          [
                            { id: 'all', label: 'Todas' },
                            { id: 'likely', label: '¿Quién es más probable?' },
                            { id: 'trivia', label: 'Trivia' },
                            { id: 'memory', label: 'Recuerdos' },
                            { id: 'toast', label: 'Ruleta Brindis' },
                          ] as const
                        ).map((f) => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setGameModeFilter(f.id)}
                            className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                              gameModeFilter === f.id
                                ? 'bg-[#E25822] text-white border-[#FDE68A]'
                                : 'bg-[#24070F] text-[#F4D9C6]/70 border-[#801C2E]/40 hover:text-white'
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatingQuestion(true);
                          setEditingQuestion({
                            id: `g-${Date.now()}`,
                            type: gameModeFilter === 'all' ? 'likely' : gameModeFilter,
                            title: 'Pregunta de Sobremesa',
                            prompt: '',
                            tag: 'Navidad 2026',
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#E25822] hover:bg-[#F16E28] text-white rounded-md"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Nueva Tarjeta</span>
                      </button>
                    </div>

                    <div className="max-h-[390px] overflow-y-auto space-y-2.5 pr-1">
                      {filteredQuestions.map((q) => (
                        <div
                          key={q.id}
                          className="bg-[#24070F] border border-[#801C2E]/50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono uppercase bg-black/40 text-[#F59E0B] px-2 py-0.5 rounded">
                                {q.type}
                              </span>
                              <span className="text-[10px] text-[#F4D9C6]/60">{q.tag}</span>
                            </div>
                            <p className="text-xs font-semibold text-[#FDE68A]">{q.title}</p>
                            <p className="text-xs text-white/90 mt-0.5">{q.prompt}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingQuestion(false);
                                setEditingQuestion(q);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#F59E0B] bg-white/5 hover:bg-white/10 rounded border border-white/10"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 7: WISHES WALL (EDIT INTRO, CREATE, EDIT WISH, MODERATE, PIN, DELETE) */}
            {activeTab === 'wishes' && (
              <div className="space-y-4">
                {/* Editable Wishes Wall description */}
                <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-3.5 flex flex-col sm:flex-row gap-2 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-[11px] font-semibold text-[#FDE68A] mb-1">
                      Descripción de Cabecera del Muro de Deseos
                    </label>
                    <input
                      type="text"
                      value={draftSettings.wishesDescription}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          wishesDescription: e.target.value,
                        })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSettings(draftSettings);
                      notifySaved('Descripción del muro actualizada.');
                    }}
                    className="px-3.5 py-1.5 bg-[#E25822] hover:bg-[#F16E28] text-white text-xs font-semibold rounded shrink-0"
                  >
                    Guardar Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewWishForm(!showNewWishForm);
                      setEditingWish(null);
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#801C2E] hover:bg-[#9E243A] text-[#FDE68A] text-xs font-semibold rounded shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showNewWishForm ? 'Cerrar' : 'Añadir Deseo'}</span>
                  </button>
                </div>

                {/* Add Wish Form */}
                {showNewWishForm && (
                  <form
                    onSubmit={handleCreateWishAsAdmin}
                    className="bg-[#280812] border border-[#E25822]/60 rounded-xl p-4 space-y-3"
                  >
                    <h4 className="font-serif text-sm font-bold text-white">
                      Publicar Deseo en el Muro
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Autor / Familia *"
                        value={newWishAuthor}
                        onChange={(e) => setNewWishAuthor(e.target.value)}
                        className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Ciudad"
                        value={newWishLocation}
                        onChange={(e) => setNewWishLocation(e.target.value)}
                        className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        min={1}
                        max={50}
                        placeholder="Botella # (opc)"
                        value={newWishBottle}
                        onChange={(e) => setNewWishBottle(e.target.value)}
                        className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="Mensaje navideño *"
                      value={newWishMessage}
                      onChange={(e) => setNewWishMessage(e.target.value)}
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#E25822] text-white text-xs font-semibold rounded hover:bg-[#F16E28]"
                      >
                        Publicar Ahora
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit Existing Wish Modal/Box */}
                {editingWish ? (
                  <form
                    onSubmit={handleSaveWishEdit}
                    className="bg-[#24070F] border border-[#E25822] rounded-xl p-4 space-y-3"
                  >
                    <h4 className="font-serif text-sm font-bold text-[#F59E0B]">
                      Editando Deseo de {editingWish.author}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        value={editingWish.author}
                        onChange={(e) =>
                          setEditingWish({ ...editingWish, author: e.target.value })
                        }
                        className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={editingWish.location}
                        onChange={(e) =>
                          setEditingWish({ ...editingWish, location: e.target.value })
                        }
                        className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        min={1}
                        max={50}
                        placeholder="Botella #"
                        value={editingWish.bottleNumber || ''}
                        onChange={(e) =>
                          setEditingWish({
                            ...editingWish,
                            bottleNumber: e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined,
                          })
                        }
                        className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={editingWish.message}
                      onChange={(e) =>
                        setEditingWish({ ...editingWish, message: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-xs">
                        <label className="flex items-center gap-1.5">
                          <span>Likes:</span>
                          <input
                            type="number"
                            min={0}
                            value={editingWish.likes}
                            onChange={(e) =>
                              setEditingWish({
                                ...editingWish,
                                likes: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-16 bg-[#120306] border border-[#801C2E] rounded px-2 py-1 text-xs text-white"
                          />
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingWish(null)}
                          className="px-3 py-1.5 text-xs text-[#F4D9C6]/70 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#E25822] text-white text-xs font-semibold rounded hover:bg-[#F16E28]"
                        >
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2">
                    {wishes.length === 0 ? (
                      <p className="text-center text-xs text-[#F4D9C6]/60 py-8">
                        No hay mensajes en el muro.
                      </p>
                    ) : (
                      wishes.map((w) => (
                        <div
                          key={w.id}
                          className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-white text-xs sm:text-sm">
                                {w.author}
                              </span>
                              {w.bottleNumber && (
                                <span className="text-[10px] font-mono text-[#F59E0B] bg-black/40 px-1.5 py-0.5 rounded">
                                  Botella #{w.bottleNumber}
                                </span>
                              )}
                              <span className="text-[10px] text-[#F4D9C6]/60">
                                · {w.location} · {w.createdAt}
                              </span>
                              {w.approved ? (
                                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 rounded">
                                  Aprobado
                                </span>
                              ) : (
                                <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 rounded font-semibold">
                                  Pendiente
                                </span>
                              )}
                              {w.pinned && (
                                <span className="text-[10px] text-[#F59E0B] font-semibold">
                                  ⭐ Destacado
                                </span>
                              )}
                            </div>
                            <p className="font-serif italic text-xs sm:text-sm text-[#F4D9C6]/90">
                              “{w.message}”
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                sound.playTick();
                                setEditingWish(w);
                                setShowNewWishForm(false);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#FDE68A] bg-white/5 hover:bg-white/10 rounded border border-white/10"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                sound.playGlassClink();
                                onUpdateWish({ ...w, approved: !w.approved });
                              }}
                              className={`px-2.5 py-1.5 text-xs font-semibold rounded border transition-colors ${
                                w.approved
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                  : 'bg-gradient-to-r from-[#E25822] to-[#F16E28] text-white border-[#E25822]'
                              }`}
                            >
                              {w.approved ? 'Ocultar' : 'Aprobar'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                sound.playTick();
                                onUpdateWish({ ...w, pinned: !w.pinned });
                              }}
                              title="Fijar en la cabecera del muro"
                              className={`p-1.5 rounded border ${
                                w.pinned
                                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]'
                                  : 'text-[#F4D9C6]/60 border-white/10 hover:text-white'
                              }`}
                            >
                              <Pin className="w-4 h-4" />
                            </button>

                            {confirmDeleteWishId === w.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    sound.playTick();
                                    onDeleteWish(w.id);
                                    setConfirmDeleteWishId(null);
                                  }}
                                  className="px-2 py-1 text-[11px] bg-rose-700 text-white rounded font-semibold"
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteWishId(null)}
                                  className="px-1.5 py-1 text-[11px] text-[#F4D9C6]/70"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteWishId(w.id)}
                                className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: EDIT BOTTLE SECOND LIFE */}
            {activeTab === 'secondLife' && (
              <form
                onSubmit={handleSaveSecondLife}
                className="space-y-5 max-h-[460px] overflow-y-auto pr-2"
              >
                {/* Image Editor */}
                <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-28 h-20 rounded-lg overflow-hidden border border-[#801C2E] bg-black shrink-0">
                    <img
                      src={draftSettings.images.secondLifeLantern}
                      alt="Lámpara Segunda Vida Stella Polaris"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    <label className="block text-xs font-semibold text-[#FDE68A]">
                      Fotografía de la Lámpara / Segunda Vida (URL o Subir Archivo)
                    </label>
                    <input
                      type="text"
                      value={draftSettings.images.secondLifeLantern}
                      onChange={(e) =>
                        setDraftSettings({
                          ...draftSettings,
                          images: {
                            ...draftSettings.images,
                            secondLifeLantern: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold bg-[#E25822] hover:bg-[#F16E28] text-white rounded">
                        <Upload className="w-3 h-3" />
                        <span>Subir Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleSiteImageUpload('secondLifeLantern', e.target.files?.[0])
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playTick();
                          const nextSettings = {
                            ...draftSettings,
                            images: {
                              ...draftSettings.images,
                              secondLifeLantern: DEFAULT_SITE_IMAGES.secondLifeLantern,
                            },
                          };
                          setDraftSettings(nextSettings);
                          onUpdateSettings(nextSettings);
                          notifySaved('Imagen restaurada a la original.');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#F4D9C6]/80 hover:text-white bg-white/5 hover:bg-white/10 rounded border border-white/10"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurar Original</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section Header Texts */}
                <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-3">
                  <h4 className="font-serif text-sm font-bold text-[#F59E0B]">
                    Cabecera de Sección
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Cintillo Superior (Kicker)
                      </label>
                      <input
                        type="text"
                        value={draftSecondLife.kicker}
                        onChange={(e) =>
                          setDraftSecondLife({ ...draftSecondLife, kicker: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Título Principal de Sección
                      </label>
                      <input
                        type="text"
                        value={draftSecondLife.sectionTitle}
                        onChange={(e) =>
                          setDraftSecondLife({ ...draftSecondLife, sectionTitle: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Descripción Introductoria
                    </label>
                    <textarea
                      rows={2}
                      value={draftSecondLife.sectionDescription}
                      onChange={(e) =>
                        setDraftSecondLife({
                          ...draftSecondLife,
                          sectionDescription: e.target.value,
                        })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Subtítulo de la Guía
                      </label>
                      <input
                        type="text"
                        value={draftSecondLife.guideKicker}
                        onChange={(e) =>
                          setDraftSecondLife({ ...draftSecondLife, guideKicker: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#F4D9C6] mb-1">
                        Título de la Guía
                      </label>
                      <input
                        type="text"
                        value={draftSecondLife.guideTitle}
                        onChange={(e) =>
                          setDraftSecondLife({ ...draftSecondLife, guideTitle: e.target.value })
                        }
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Steps Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-sm font-bold text-[#F59E0B]">
                      Pasos de la Guía ({draftSecondLife.steps.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddSecondLifeStep}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#E25822]/20 hover:bg-[#E25822]/40 text-[#FDE68A] border border-[#E25822]/50 rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Paso</span>
                    </button>
                  </div>

                  {draftSecondLife.steps.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#F59E0B]">
                          Paso #{idx + 1}
                        </span>
                        {draftSecondLife.steps.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setDraftSecondLife({
                                ...draftSecondLife,
                                steps: draftSecondLife.steps.filter((_, i) => i !== idx),
                              })
                            }
                            className="p-1 text-rose-400 hover:text-rose-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={s.step}
                          onChange={(e) => {
                            const next = [...draftSecondLife.steps];
                            next[idx] = { ...s, step: e.target.value };
                            setDraftSecondLife({ ...draftSecondLife, steps: next });
                          }}
                          placeholder="01"
                          className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                        <input
                          type="text"
                          value={s.title}
                          onChange={(e) => {
                            const next = [...draftSecondLife.steps];
                            next[idx] = { ...s, title: e.target.value };
                            setDraftSecondLife({ ...draftSecondLife, steps: next });
                          }}
                          placeholder="Título del paso"
                          className="bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white sm:col-span-2"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={s.desc}
                        onChange={(e) => {
                          const next = [...draftSecondLife.steps];
                          next[idx] = { ...s, desc: e.target.value };
                          setDraftSecondLife({ ...draftSecondLife, steps: next });
                        }}
                        placeholder="Descripción del paso..."
                        className="w-full bg-[#120306] border border-[#801C2E] rounded px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  ))}
                </div>

                {/* Tip Box Editor */}
                <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-2.5">
                  <h4 className="font-serif text-sm font-bold text-[#F59E0B]">
                    Nota / Consejo Destacado Final
                  </h4>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Título de la Nota (en negrita)
                    </label>
                    <input
                      type="text"
                      value={draftSecondLife.tipTitle}
                      onChange={(e) =>
                        setDraftSecondLife({ ...draftSecondLife, tipTitle: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#F4D9C6] mb-1">
                      Texto de la Nota
                    </label>
                    <textarea
                      rows={2}
                      value={draftSecondLife.tipText}
                      onChange={(e) =>
                        setDraftSecondLife({ ...draftSecondLife, tipText: e.target.value })
                      }
                      className="w-full bg-[#120306] border border-[#801C2E] rounded px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#E25822] text-white text-xs sm:text-sm font-semibold rounded hover:bg-[#F16E28]"
                  >
                    Guardar Segunda Vida
                  </button>
                </div>
              </form>
            )}

            {/* TAB 9: EXPORT TO CODE / DEPLOY SYNC */}
            {activeTab === 'export' && (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                <div className="bg-[#24070F] border border-[#F59E0B]/50 rounded-xl p-4 sm:p-5 space-y-3">
                  <h4 className="font-serif text-base font-bold text-[#FDE68A]">
                    ¿Por qué los cambios locales no salen al deployar?
                  </h4>
                  <p className="text-xs text-[#F4D9C6]/85 leading-relaxed">
                    Cuando editas textos o subes fotos dentro del panel Superadmin, esos cambios se
                    guardan primero en la memoria de este navegador (<code>localStorage</code>). Al
                    deployar, la app publicada abre en un dominio nuevo y solo muestra:
                  </p>
                  <ul className="text-xs text-[#F4D9C6]/85 space-y-1.5 list-disc pl-5">
                    <li>
                      Lo que hayas subido a la nube pulsando{' '}
                      <strong className="text-white">«Conectar Google y Guardar Permanente»</strong>{' '}
                      (Firebase Firestore).
                    </li>
                    <li>
                      O los valores guardados directamente en el código fuente (
                      <code>src/data/initialData.ts</code>).
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-3">
                    <h5 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-emerald-400" />
                      <span>1. Guardar en Base de Datos (Recomendado)</span>
                    </h5>
                    <p className="text-xs text-[#F4D9C6]/75 leading-relaxed">
                      Sube tus cambios actuales a Firebase para que aparezcan de inmediato en la URL
                      deployada y en cualquier teléfono sin tener que volver a deployar.
                    </p>
                    <button
                      type="button"
                      disabled={cloudSyncStatus === 'syncing'}
                      onClick={async () => {
                        sound.playGlassClink();
                        const ok = await onSyncAllToCloud();
                        if (ok) {
                          notifySaved('Todo el contenido sincronizado en la nube');
                        }
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#E25822] to-[#D94F1C] hover:brightness-110 disabled:opacity-60 rounded-lg transition-all"
                    >
                      <Cloud className="w-4 h-4" />
                      <span>
                        {isCloudAdmin
                          ? 'Sincronizar Todo a la Nube Ahora'
                          : 'Conectar Google y Subir Cambios'}
                      </span>
                    </button>
                  </div>

                  <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 space-y-3">
                    <h5 className="font-serif text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-[#F59E0B]" />
                      <span>2. Exportar para Grabar en el Código</span>
                    </h5>
                    <p className="text-xs text-[#F4D9C6]/75 leading-relaxed">
                      Descarga o copia el respaldo exacto de todos tus textos, imágenes, ritual,
                      botellas y deseos actuales para pegarlo en el chat y dejarlo fijo en el código
                      antes de deployar.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playGlassClink();
                          const backup = JSON.stringify(
                            {
                              settings,
                              ritualData,
                              pastEdition,
                              secondLifeData,
                              gameQuestions,
                              wishes,
                              bottles,
                            },
                            null,
                            2
                          );
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(backup);
                            setCopiedBackupJson(true);
                            setTimeout(() => setCopiedBackupJson(false), 3000);
                          }
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FDE68A] bg-[#801C2E]/70 hover:bg-[#801C2E] border border-[#E25822]/40 rounded-lg transition-colors"
                      >
                        {copiedBackupJson ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>¡Respaldo Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Respaldo JSON</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          sound.playFestiveChime();
                          const backup = JSON.stringify(
                            {
                              settings,
                              ritualData,
                              pastEdition,
                              secondLifeData,
                              gameQuestions,
                              wishes,
                              bottles,
                            },
                            null,
                            2
                          );
                          const blob = new Blob([backup], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'stella-polaris-cambios.json';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar JSON</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-[#5C1423]/60 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#F4D9C6]/60">
                Modo Superadmin activo · Cambios persistidos automáticamente en la web
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-[#F4D9C6]/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                >
                  Minimizar Panel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playTick();
                    onLogout();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#801C2E] to-[#A32238] hover:brightness-110 border border-[#E25822]/50 rounded-md shadow-sm transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>Salir del Superadmin</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
