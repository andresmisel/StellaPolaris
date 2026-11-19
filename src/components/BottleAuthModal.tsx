import React, { useState, useEffect } from 'react';
import { Bottle } from '../types';
import { CertificateView } from './CertificateView';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  ArrowLeft,
  X,
  Edit3,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { sound } from '../utils/storage';

interface BottleAuthModalProps {
  bottles: Bottle[];
  isOpen: boolean;
  onClose: () => void;
  onBottleUpdated: (updatedBottle: Bottle) => void;
  authenticatedBottle: Bottle | null;
  openedViaBottleLink: boolean;
  isAdmin: boolean;
  linkAuthError?: string | null;
  initialBottleNumber?: number;
}

export const BottleAuthModal: React.FC<BottleAuthModalProps> = ({
  bottles,
  isOpen,
  onClose,
  onBottleUpdated,
  authenticatedBottle,
  openedViaBottleLink,
  isAdmin,
  linkAuthError,
  initialBottleNumber,
}) => {
  const [query, setQuery] = useState('');
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [ownerName, setOwnerName] = useState('');
  const [location, setLocation] = useState('');
  const [dedication, setDedication] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Only allow browsing all 50 certificates if Superadmin is browsing without an active unique link preview
  const canBrowseAllBottles = isAdmin && !openedViaBottleLink;

  useEffect(() => {
    if (!isOpen) return;
    setSearchError(null);
    setIsEditingDetails(false);

    if (initialBottleNumber && canBrowseAllBottles) {
      const target = bottles.find((b) => b.number === initialBottleNumber) || null;
      setSelectedBottle(target);
      if (target) {
        setOwnerName(
          target.ownerName && !target.ownerName.startsWith('Propietario Ejemplar')
            ? target.ownerName
            : ''
        );
        setLocation(target.location || '');
        setDedication(target.dedication || '');
      }
      return;
    }

    if (authenticatedBottle) {
      const latest =
        bottles.find((b) => b.number === authenticatedBottle.number) || authenticatedBottle;
      setSelectedBottle(latest);
      setOwnerName(
        latest.ownerName && !latest.ownerName.startsWith('Propietario Ejemplar')
          ? latest.ownerName
          : ''
      );
      setLocation(latest.location || '');
      setDedication(latest.dedication || '');
    } else {
      setSelectedBottle(null);
    }
  }, [isOpen, initialBottleNumber, authenticatedBottle, canBrowseAllBottles, bottles]);

  if (!isOpen) return null;

  const handleSelectBottle = (bottle: Bottle) => {
    if (!canBrowseAllBottles) return;
    sound.playGlassClink();
    setSearchError(null);
    setSelectedBottle(bottle);
    setOwnerName(
      bottle.ownerName && !bottle.ownerName.startsWith('Propietario Ejemplar')
        ? bottle.ownerName
        : ''
    );
    setLocation(bottle.location || '');
    setDedication(bottle.dedication || '');
    setIsEditingDetails(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBrowseAllBottles) return;
    sound.playGlassClink();
    setSearchError(null);
    const trimmed = query.trim();
    if (!trimmed) return;

    const cleanQuery = trimmed.toUpperCase();
    const num = parseInt(cleanQuery.replace(/\D/g, ''), 10);
    const found = bottles.find(
      (b) =>
        b.number === num ||
        b.code.toUpperCase() === cleanQuery ||
        b.formattedNumber === cleanQuery ||
        (b.ownerName && b.ownerName.toLowerCase().includes(trimmed.toLowerCase()))
    );

    if (found) {
      handleSelectBottle(found);
      setQuery('');
    } else {
      setSearchError(
        'No se encontró ninguna botella con ese número o titular en la colección 01/50.'
      );
    }
  };

  const handleSavePersonalization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBottle) return;

    sound.playFestiveChime();

    const today =
      selectedBottle.claimDate ||
      new Date().toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

    const updated: Bottle = {
      ...selectedBottle,
      claimed: true,
      ownerName: ownerName.trim() || `Propietario Ejemplar ${selectedBottle.formattedNumber}`,
      location: location.trim() || 'Edición Particular 2026',
      dedication: dedication.trim() || 'Brindis de Nochebuena Stella Polaris',
      claimDate: today,
    };

    onBottleUpdated(updated);
    setSelectedBottle(updated);
    setIsEditingDetails(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto print:static print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-[#1F060D] border border-[#801C2E] rounded-2xl shadow-2xl text-[#FDF8F0] overflow-hidden my-8 print:my-0 print:border-0 print:shadow-none print:bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#5C1423]/60 bg-[#160408]/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E25822]/20 border border-[#E25822] flex items-center justify-center text-[#F59E0B]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                {selectedBottle
                  ? `Certificado Exclusivo · Botella Nº ${selectedBottle.formattedNumber}`
                  : 'Certificado de Autenticidad Privado'}
              </h3>
              <p className="text-xs text-[#F4D9C6]/70">
                Ponche Crema Stella Polaris · Lote Especial 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="p-1.5 text-[#F4D9C6]/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 print:p-0">
          {linkAuthError && !selectedBottle && (
            <div className="mb-5 bg-rose-950/70 border border-rose-500/60 rounded-xl p-4 flex items-start gap-3 text-xs sm:text-sm text-rose-100">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Enlace de botella no reconocido</p>
                <p className="text-rose-200/90 mt-0.5">{linkAuthError}</p>
              </div>
            </div>
          )}

          {selectedBottle ? (
            <div>
              {/* Only Superadmin (when not testing a single buyer link) can navigate back to other bottles */}
              {canBrowseAllBottles && (
                <button
                  onClick={() => setSelectedBottle(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F59E0B] hover:text-[#FDE68A] mb-4 transition-colors print:hidden"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al listado completo (Solo Superadmin)</span>
                </button>
              )}

              <div className="bg-gradient-to-r from-[#2E0A14] via-[#3A0C18] to-[#24070F] border-2 border-[#F59E0B]/70 rounded-xl p-5 mb-6 shadow-xl print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#F59E0B] block mb-1">
                        Botella Auténtica Certificada · {selectedBottle.code}
                      </span>
                      <h4 className="font-serif text-lg sm:text-2xl font-bold text-white leading-snug">
                        Usted es propietario y está disfrutando de la botella número{' '}
                        <span className="text-[#FDE68A] font-mono">
                          {selectedBottle.formattedNumber}
                        </span>
                      </h4>
                      <p className="text-xs text-[#F4D9C6]/80 mt-1">
                        Código de ejemplar:{' '}
                        <span className="font-mono text-[#FDE68A]">{selectedBottle.code}</span>
                        {selectedBottle.ownerName && (
                          <>
                            {' · '}Titular:{' '}
                            <strong className="text-white">{selectedBottle.ownerName}</strong>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playTick();
                      setIsEditingDetails(!isEditingDetails);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#FDE68A] bg-black/40 hover:bg-black/60 border border-[#F59E0B]/40 rounded-lg transition-colors shrink-0 self-start sm:self-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingDetails ? 'Ocultar Edición' : 'Personalizar Certificado'}</span>
                  </button>
                </div>

                {isEditingDetails && (
                  <form
                    onSubmit={handleSavePersonalization}
                    className="mt-5 pt-5 border-t border-[#801C2E]/60 grid grid-cols-1 sm:grid-cols-3 gap-3"
                  >
                    <div>
                      <label className="block text-[11px] font-medium text-[#F4D9C6] mb-1">
                        Tu Nombre o Familia
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Ej. Familia Rodríguez"
                        className="w-full bg-[#160408] border border-[#801C2E] rounded px-3 py-2 text-xs text-white focus:border-[#E25822] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#F4D9C6] mb-1">
                        Ciudad / País
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ej. Caracas, VE"
                        className="w-full bg-[#160408] border border-[#801C2E] rounded px-3 py-2 text-xs text-white focus:border-[#E25822] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#F4D9C6] mb-1">
                        Dedicatoria Navideña
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={dedication}
                          onChange={(e) => setDedication(e.target.value)}
                          placeholder="Tu recuerdo o brindis..."
                          className="w-full bg-[#160408] border border-[#801C2E] rounded px-3 py-2 text-xs text-white focus:border-[#E25822] focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#E25822] hover:bg-[#F16E28] text-white text-xs font-semibold rounded shrink-0 transition-colors"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              <CertificateView bottle={selectedBottle} onClose={onClose} embedded={false} />
            </div>
          ) : canBrowseAllBottles ? (
            /* Superadmin-only view of all 50 certificates */
            <div>
              <div className="bg-[#280812]/80 border border-[#801C2E]/60 rounded-xl p-4 sm:p-5 mb-6 max-w-2xl mx-auto">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F4D9C6]/50" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar botella por número (ej: 07), código o titular..."
                      className="w-full bg-[#160408] border border-[#801C2E] rounded-md pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#E25822] focus:outline-none focus:ring-1 focus:ring-[#E25822]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#E25822] text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-[#F16E28] transition-colors shrink-0"
                  >
                    Abrir Certificado
                  </button>
                </form>
                {searchError && <p className="text-xs text-rose-400 mt-2">{searchError}</p>}
              </div>

              <div className="text-center mb-5">
                <p className="text-xs text-[#F4D9C6]/75">
                  Vista de Superadmin: selecciona cualquiera de las{' '}
                  <strong className="text-[#F59E0B]">50 botellas de la colección 2026</strong> para
                  inspeccionar su Certificado Oficial:
                </p>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-[360px] overflow-y-auto p-1 pr-2">
                {bottles.map((bottle) => {
                  const isOpenedBottle = authenticatedBottle?.number === bottle.number;

                  return (
                    <button
                      key={bottle.number}
                      onClick={() => handleSelectBottle(bottle)}
                      className={`relative p-2 rounded-md text-center transition-all border flex flex-col items-center justify-center ${
                        isOpenedBottle
                          ? 'bg-[#E25822]/30 border-[#F59E0B] text-white ring-1 ring-[#F59E0B]'
                          : 'bg-[#360C16]/80 border-[#801C2E] text-white hover:border-[#F59E0B]'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold block">
                        {bottle.number.toString().padStart(2, '0')}
                      </span>
                      <span className="text-[9px] mt-0.5 block truncate max-w-full">
                        {isOpenedBottle ? (
                          <span className="text-[#FDE68A] font-bold">★ Abierta</span>
                        ) : (
                          <span className="text-emerald-400 font-medium">✓ Auténtica</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Private Notice when visitor has not opened a unique bottle link */
            <div className="bg-[#280812] border border-[#801C2E] rounded-xl p-8 max-w-lg mx-auto text-center">
              <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/40 flex items-center justify-center mx-auto mb-4 text-[#F59E0B]">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-2xl text-white font-bold mb-2">
                Certificado Exclusivo y Privado
              </h4>
              <p className="text-sm text-[#F4D9C6]/85 leading-relaxed mb-6">
                Para proteger la privacidad de los coleccionistas, cada persona puede visualizar
                únicamente el Certificado de Autenticidad de su propia botella ingresando desde el{' '}
                <strong className="text-white">enlace único</strong> incluido con su ejemplar.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-md bg-[#E25822] hover:bg-[#F16E28] text-xs sm:text-sm font-semibold text-white transition-colors"
              >
                Volver a la Web
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
