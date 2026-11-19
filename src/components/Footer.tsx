import React from 'react';
import { Star, Shield, Lock, LogOut, Heart } from 'lucide-react';
import { sound } from '../utils/storage';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onOpenAuth: () => void;
  totalBottles: number;
  footerDescription: string;
  editionYear: number;
  pastEditionYear: number;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  isAdmin,
  onLogoutAdmin,
  onOpenAuth,
  totalBottles,
  footerDescription,
  editionYear,
  pastEditionYear,
}) => {
  return (
    <footer className="bg-[#0F0205] border-t border-[#4A0E1A]/60 pt-16 pb-12 text-[#F4D9C6]/80 text-xs">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#360C16]">
          {/* Brand & Story */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="overflow-visible py-1">
              <span className="font-brand-script text-4xl sm:text-5xl text-[#F59E0B] pt-1 pb-1 leading-[1.3] block">
                Stella Polaris
              </span>
            </div>
            <p className="font-serif italic text-sm text-[#FDF8F0]">
              Ponche Crema Artesanal de Autor · Cosecha {editionYear}
            </p>
            <p className="text-xs text-[#F4D9C6]/70 leading-relaxed max-w-sm">
              {footerDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 flex flex-col gap-2">
            <p className="font-serif uppercase tracking-widest text-xs font-bold text-[#F59E0B] mb-1">
              Experiencia Navideña
            </p>
            <button
              onClick={() => {
                sound.playGlassClink();
                onOpenAuth();
              }}
              className="text-left hover:text-white transition-colors"
            >
              Certificados de Botellas (01/{totalBottles})
            </button>
            <a href="#ritual" className="hover:text-white transition-colors">
              El Ritual de Servicio
            </a>
            <a href="#historia" className="hover:text-white transition-colors">
              Historia de la Receta
            </a>
            <a href="#musica" className="hover:text-white transition-colors">
              Música Navideña (YouTube)
            </a>
            <a href="#edicion-pasada" className="hover:text-white transition-colors">
              Edición Pasada ({pastEditionYear})
            </a>
            <a href="#muro" className="hover:text-white transition-colors">
              Muro Comunitario de Deseos
            </a>
            <a href="#juego" className="hover:text-white transition-colors">
              Juego de Sobremesa Familiar
            </a>
            <a href="#segunda-vida" className="hover:text-white transition-colors">
              Lámpara de Luces (Upcycling)
            </a>
          </div>

          {/* Collector Statement */}
          <div className="md:col-span-4 flex flex-col gap-3 bg-[#1C060B] border border-[#801C2E]/40 p-5 rounded-xl">
            <div className="flex items-center gap-2 text-[#F59E0B] font-serif text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <span>Garantía de Origen Stella Polaris</span>
            </div>
            <p className="text-xs text-[#F4D9C6]/80 leading-relaxed">
              Botellas selladas con lacre borgoña, tapón de corcho natural y certificado individual de procedencia con firma del maestro artesano.
            </p>
            <div className="pt-2 flex items-center justify-between text-[11px] text-[#FDE68A] font-mono">
              <span>Lote: NOEL-{editionYear}</span>
              <span>Cristal Ámbar · 01/{totalBottles}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin access */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#F4D9C6]/60">
          <p>
            © {editionYear} Stella Polaris. Todos los derechos reservados. Elaborado con devoción artesanal.
          </p>

          <div className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <button
                  onClick={() => {
                    sound.playTick();
                    onOpenAdmin();
                  }}
                  className="inline-flex items-center gap-1.5 text-[#F59E0B] hover:text-[#FDE68A] transition-colors"
                >
                  <Shield className="w-3 h-3" />
                  <span>Panel Superadmin</span>
                </button>
                <span aria-hidden="true">·</span>
                <button
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center gap-1.5 text-[#FDE68A] hover:text-white font-semibold transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Salir del Superadmin</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  sound.playTick();
                  onOpenAdmin();
                }}
                className="inline-flex items-center gap-1.5 hover:text-[#F59E0B] transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Administrar Web</span>
              </button>
            )}

            <span aria-hidden="true">·</span>

            <span className="flex items-center gap-1 text-[#F4D9C6]/50">
              <span>Hecho con</span>
              <Heart className="w-3 h-3 fill-rose-500 text-rose-500 inline" />
              <span>para la mesa familiar</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
