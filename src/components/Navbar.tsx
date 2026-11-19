import React from 'react';
import { Bottle } from '../types';
import { ShieldCheck, Lock, Unlock, LogOut } from 'lucide-react';
import { sound } from '../utils/storage';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  totalBottles: number;
  authenticatedBottle: Bottle | null;
  editionYear: number;
  pastEditionYear: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenAdmin,
  isAdmin,
  onLogoutAdmin,
  totalBottles,
  authenticatedBottle,
  editionYear,
  pastEditionYear,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#5C1423]/40 bg-[#1A0409]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-8 px-6 lg:px-12">
        {/* Zone 1: Single text wordmark in Rumble Brave Script style */}
        <a
          href="#"
          onClick={() => sound.playGlassClink()}
          className="group flex items-center gap-2 whitespace-nowrap shrink-0 focus:outline-none py-1"
        >
          <span className="font-brand-script text-3xl md:text-4xl text-[#F59E0B] tracking-wide transition-transform group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)] pt-1 pb-0.5 leading-[1.2]">
            Stella Polaris
          </span>
          <span className="text-xs text-[#E25822] font-serif tracking-widest uppercase hidden sm:inline-block ml-1">
            · {editionYear}
          </span>
        </a>

        {/* Zone 2: 4-5 concise single-line text links */}
        <nav className="hidden xl:flex items-center gap-6 text-xs lg:text-sm font-medium text-[#F4D9C6]/80">
          <a
            href="#ritual"
            className="hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            El Ritual
          </a>
          <a
            href="#historia"
            className="hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Historia
          </a>
          <a
            href="#musica"
            className="hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Música Navideña
          </a>
          <a
            href="#edicion-pasada"
            className="hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Edición Pasada ({pastEditionYear})
          </a>
          <a
            href="#muro"
            className="hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Muro de Deseos
          </a>
          <a
            href="#juego"
            className="hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Juego de Sobremesa
          </a>
          <a
            href="#segunda-vida"
            className="hover:text-[#F59E0B] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Lámpara de Luces
          </a>
        </nav>

        {/* Zone 3: 1 primary action + Admin controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              sound.playFestiveChime();
              onOpenAuth();
            }}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-md bg-gradient-to-r from-[#E25822] via-[#F16E28] to-[#D94F1C] px-4 py-2.5 text-xs lg:text-sm font-semibold text-white shadow-lg shadow-[#E25822]/25 transition-all hover:brightness-110 hover:shadow-[#E25822]/45 active:scale-95 whitespace-nowrap shrink-0"
          >
            <ShieldCheck className="h-4 w-4 text-[#FDE68A]" />
            <span>
              {authenticatedBottle
                ? `Botella ${authenticatedBottle.formattedNumber}`
                : 'Mi Certificado'}
            </span>
            {!authenticatedBottle && (
              <span className="hidden sm:inline font-mono text-[11px] bg-black/20 px-1.5 py-0.5 rounded">
                01/{totalBottles}
              </span>
            )}
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenAdmin}
                title="Abrir Panel Superadmin"
                className="p-2 text-[#F59E0B] hover:text-[#FDE68A] transition-colors rounded-md bg-[#F59E0B]/10 border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20"
                aria-label="Abrir Panel Superadmin"
              >
                <Unlock className="h-4 w-4" />
              </button>
              <button
                onClick={onLogoutAdmin}
                title="Salir del Superadmin"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FDE68A] bg-[#801C2E]/70 hover:bg-[#801C2E] border border-[#E25822]/50 rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir del Superadmin</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdmin}
              title="Acceso Superadmin"
              className="p-2 text-[#9A344D] hover:text-[#F59E0B] transition-colors rounded-md hover:bg-white/5"
              aria-label="Panel Superadmin"
            >
              <Lock className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
