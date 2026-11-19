import React from 'react';
import { Bottle, AppSettings } from '../types';
import { Sparkles, ShieldCheck, Flame, CheckCircle2, Star, AlertCircle } from 'lucide-react';
import { sound } from '../utils/storage';

interface HeroProps {
  onOpenAuth: () => void;
  totalBottles: number;
  authenticatedBottle: Bottle | null;
  openedViaBottleLink: boolean;
  linkAuthError?: string | null;
  settings: AppSettings;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenAuth,
  totalBottles,
  authenticatedBottle,
  openedViaBottleLink,
  linkAuthError,
  settings,
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-24">
      {/* Background warm festive atmosphere & subtle ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[#E25822]/15 via-[#801C2E]/25 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-10 left-10 w-96 h-96 bg-[#D9531E]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Story, Title, Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Subtle editorial kicker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] mb-3">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <span>{settings.heroKicker}</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#F4D9C6]/80 font-mono uppercase">{settings.bottleColor}</span>
            </div>

            {/* Brand Logo in Rumble Brave Script style - fixed vertical clearance to prevent top clipping */}
            <div className="overflow-visible py-1">
              <h1 className="font-brand-script text-6xl sm:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#E25822] leading-[1.25] sm:leading-[1.3] pt-3 pb-2 drop-shadow-[0_4px_24px_rgba(226,88,34,0.3)]">
                Stella Polaris
              </h1>
            </div>

            <p className="font-serif text-2xl sm:text-3xl text-[#FDF8F0] tracking-wide mb-6 font-normal">
              {settings.heroSubtitle}
            </p>

            <p className="font-sans text-base sm:text-lg text-[#F4D9C6]/90 leading-relaxed max-w-2xl mb-8 whitespace-pre-line">
              {settings.heroDescription}
            </p>

            {/* Error banner if visitor arrived with unrecognized link */}
            {linkAuthError && !authenticatedBottle && (
              <div className="mb-6 rounded-xl border border-rose-500/60 bg-rose-950/60 p-4 flex items-start gap-3 text-xs sm:text-sm text-rose-100">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Enlace de botella no reconocido</p>
                  <p className="text-rose-200/85 mt-0.5">{linkAuthError}</p>
                </div>
              </div>
            )}

            {/* Instant Bottle Recognition Banner when visitor opens a bottle's unique link (all 50 pre-authenticated) */}
            {authenticatedBottle && (
              <div className="mb-6 rounded-xl border-2 border-[#F59E0B]/70 bg-gradient-to-r from-[#2D0813] via-[#3A0C18] to-[#23060E] p-4 sm:p-5 shadow-xl shadow-[#E25822]/15">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#F59E0B] block mb-0.5">
                      {openedViaBottleLink
                        ? `Acabas de abrir la Botella Nº ${authenticatedBottle.formattedNumber} · ${authenticatedBottle.code}`
                        : `Botella Auténtica Nº ${authenticatedBottle.formattedNumber} · ${authenticatedBottle.code}`}
                    </span>
                    <p className="font-serif text-base sm:text-xl font-bold text-white leading-snug">
                      Usted es propietario y está disfrutando de la botella número{' '}
                      <span className="font-mono text-[#FDE68A]">
                        {authenticatedBottle.formattedNumber}
                      </span>
                    </p>
                    {authenticatedBottle.ownerName && (
                      <p className="text-xs text-[#F4D9C6]/80 mt-1">
                        Titular: <strong className="text-white">{authenticatedBottle.ownerName}</strong>
                      </p>
                    )}
                    <button
                      onClick={() => {
                        sound.playFestiveChime();
                        onOpenAuth();
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FDE68A] hover:text-white underline underline-offset-4 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Ver mi Certificado Oficial Nº {authenticatedBottle.formattedNumber}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() => {
                  sound.playFestiveChime();
                  onOpenAuth();
                }}
                className="group inline-flex items-center gap-3 rounded-md bg-gradient-to-r from-[#E25822] via-[#F16E28] to-[#D94F1C] px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#E25822]/30 transition-all hover:scale-[1.02] hover:shadow-[#E25822]/50 active:scale-95"
              >
                <ShieldCheck className="w-5 h-5 text-[#FDE68A] transition-transform group-hover:rotate-6" />
                <span>
                  {authenticatedBottle
                    ? `Mi Botella ${authenticatedBottle.formattedNumber}`
                    : 'Mi Certificado'}
                </span>
                <span className="font-mono text-xs bg-black/25 px-2 py-0.5 rounded text-white/90">
                  {totalBottles}/{totalBottles}
                </span>
              </button>

              <a
                href="#ritual"
                onClick={() => sound.playGlassClink()}
                className="inline-flex items-center gap-2 rounded-md border border-[#801C2E] bg-[#2A0811]/60 px-5 py-3.5 text-sm font-medium text-[#FDF8F0] hover:bg-[#801C2E]/40 hover:border-[#E25822]/50 transition-all"
              >
                <Flame className="w-4 h-4 text-[#E25822]" />
                <span>Ver Ritual de Degustación</span>
              </a>
            </div>

            {/* Limited Run Stats Strip */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#4A0E1A]/60 max-w-sm">
              <div>
                <p className="font-mono text-2xl font-bold text-[#F59E0B] tabular-nums">
                  01–{totalBottles}
                </p>
                <p className="text-xs text-[#F4D9C6]/70 mt-0.5">Tiraje Único {settings.editionYear}</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                  {totalBottles}/{totalBottles}
                </p>
                <p className="text-xs text-[#F4D9C6]/70 mt-0.5">Botellas Autenticadas</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Bottle Showcase */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Glowing ring backdrop */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#E25822]/20 via-[#801C2E]/40 to-transparent rounded-2xl filter blur-xl transform scale-95" />

            <div className="relative group w-full max-w-md rounded-2xl overflow-hidden border border-[#801C2E]/60 bg-[#25070E]/80 p-3 shadow-2xl transition-all duration-500 hover:border-[#E25822]/60">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#180509]">
                <img
                  src={settings.images.heroBottle}
                  alt="Botella de Ponche Crema Artesanal Stella Polaris Edición Limitada Ámbar Naranja"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C060B] via-transparent to-transparent opacity-60" />

                {/* Floating Collector Stamp */}
                <div className="absolute top-4 right-4 bg-[#1A0409]/90 border border-[#F59E0B]/50 px-3 py-1.5 rounded backdrop-blur-md shadow-lg text-right">
                  <p className="text-[10px] uppercase font-serif tracking-widest text-[#F59E0B]">
                    Edición Limitada
                  </p>
                  <p className="text-xs font-mono font-bold text-white">
                    01/{totalBottles} a {totalBottles}/{totalBottles}
                  </p>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-[#1C060B]/85 border border-[#801C2E]/80 backdrop-blur-md rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-serif text-[#FDE68A] font-medium">
                        {authenticatedBottle
                          ? `Stella Polaris Nº ${authenticatedBottle.formattedNumber}`
                          : `Stella Polaris · 01/${totalBottles}`}
                      </p>
                      <p className="text-[11px] text-[#F4D9C6]/70">
                        {authenticatedBottle
                          ? 'Botella Auténtica en Tu Mesa'
                          : 'Todas las Botellas Autenticadas'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        sound.playGlassClink();
                        onOpenAuth();
                      }}
                      className="text-[11px] font-semibold text-[#E25822] hover:text-[#F59E0B] underline underline-offset-2"
                    >
                      {authenticatedBottle ? 'Ver Certificado' : 'Mi Certificado'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
