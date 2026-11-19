import React, { useState } from 'react';
import { PastEdition } from '../types';
import { Archive, CheckCircle2, ChevronRight, X, Calendar } from 'lucide-react';
import { sound } from '../utils/storage';

interface PastEditionSectionProps {
  edition: PastEdition;
  currentYear: number;
  currentTotalBottles: number;
  currentBottleColor: string;
}

export const PastEditionSection: React.FC<PastEditionSectionProps> = ({
  edition,
  currentYear,
  currentTotalBottles,
  currentBottleColor,
}) => {
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  return (
    <section id="edicion-pasada" className="py-20 bg-[#140307] relative overflow-hidden border-t border-[#4A0E1A]/60">
      {/* Background radial accent */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-[#1B4D3E]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] uppercase mb-2">
            <Archive className="w-3.5 h-3.5" />
            <span>Memoria de la Casa · Archivo Histórico</span>
          </div>
          <h2 className="font-brand-script text-5xl sm:text-6xl text-white pt-2 pb-2 leading-[1.3] mb-3">
            La Edición Pasada
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F4D9C6]/80 leading-relaxed">
            Cada año, Stella Polaris viste una botella conmemorativa diferente con un tiraje estrictamente limitado y numerado a mano.
          </p>
        </div>

        {/* 2-Column Comparison Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Image of past bottle */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="group relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-[#1E4A38]/60 bg-[#0C1A14]/90 p-3 shadow-2xl transition-all duration-500 hover:border-[#F59E0B]/60">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#06100C]">
                <img
                  src={edition.imageSrc}
                  alt={`Botella de Ponche Crema Stella Polaris Edición Pasada ${edition.year}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Status Stamp */}
                <div className="absolute top-4 left-4 bg-black/85 border border-[#1E4A38] px-3 py-1 rounded backdrop-blur-md">
                  <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
                    {edition.status}
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-[#0A1A12]/90 border border-[#C5A059]/60 px-3 py-1 rounded text-right backdrop-blur-md">
                  <span className="text-[10px] uppercase font-serif text-[#FDE68A] block">
                    Tiraje Total
                  </span>
                  <span className="text-xs font-mono font-bold text-white">
                    {edition.quantityMade} Botellas
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md border border-[#1E4A38]/80 rounded-lg p-3">
                  <p className="font-serif text-xs text-[#FDE68A] font-semibold">
                    Stella Polaris · Cosecha {edition.year}
                  </p>
                  <p className="text-[11px] text-emerald-200/80">
                    {edition.bottleColor}
                  </p>
                </div>
              </div>

              {/* Action button to view full archive document */}
              <div className="mt-3 flex items-center justify-between px-1">
                <span className="text-xs text-[#F4D9C6]/60 font-mono">
                  Registro: SP-ARCH-{edition.year}
                </span>
                <button
                  onClick={() => {
                    sound.playGlassClink();
                    setShowArchiveModal(true);
                  }}
                  className="text-xs font-semibold text-[#F59E0B] hover:text-[#FDE68A] flex items-center gap-1 transition-colors"
                >
                  <span>Ver Ficha Histórica</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Historical details & comparison with current edition */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[#1C060B] border border-[#801C2E]/60 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1B4D3E]/30 border border-[#1B4D3E] flex items-center justify-center text-emerald-400 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Cosecha {edition.year} · {edition.bottleColor}
                  </h3>
                  <p className="text-xs font-mono text-[#F59E0B]">
                    Año {edition.year} · {edition.quantityLabel}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#F4D9C6]/85 leading-relaxed mb-6">
                {edition.description}
              </p>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {edition.keyFeatures.map((feat, idx) => (
                  <div
                    key={`${feat}-${idx}`}
                    className="flex items-center gap-2.5 bg-[#140307] border border-white/5 p-3 rounded-lg text-xs text-[#F4D9C6]/90"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Contrast / Evolution strip */}
              <div className="border-t border-[#801C2E]/40 pt-5">
                <p className="text-[11px] font-serif uppercase tracking-widest text-[#F59E0B] font-semibold mb-3">
                  Evolución de las Ediciones de Colección
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* Past Edition */}
                  <div className="bg-[#0C1A14] border border-[#1E4A38] p-3.5 rounded-lg">
                    <span className="font-mono text-[11px] text-emerald-400 font-bold block mb-1">
                      Edición {edition.year} (Pasada)
                    </span>
                    <p className="font-serif text-white font-semibold">
                      {edition.bottleColor}
                    </p>
                    <p className="text-[#F4D9C6]/70 text-[11px] mt-0.5">
                      {edition.quantityMade} botellas numeradas
                    </p>
                    <span className="inline-block mt-2 font-mono text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                      Agotada
                    </span>
                  </div>

                  {/* Current Edition */}
                  <div className="bg-[#2A0811] border border-[#E25822] p-3.5 rounded-lg shadow-md shadow-[#E25822]/10">
                    <span className="font-mono text-[11px] text-[#F59E0B] font-bold block mb-1">
                      Edición {currentYear} (Actual)
                    </span>
                    <p className="font-serif text-white font-semibold">
                      {currentBottleColor}
                    </p>
                    <p className="text-[#F4D9C6]/70 text-[11px] mt-0.5">
                      {currentTotalBottles} botellas numeradas
                    </p>
                    <span className="inline-block mt-2 font-mono text-[10px] bg-[#E25822]/30 text-[#FDE68A] px-2 py-0.5 rounded border border-[#E25822]/50 font-semibold">
                      Autenticadas (01/{currentTotalBottles})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#0D1C16] border-2 border-[#1E4A38] rounded-2xl p-6 sm:p-8 text-[#FDF8F0] shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E4A38]/60 mb-6">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif text-lg font-bold text-white">
                  Ficha Histórica · Stella Polaris Cosecha {edition.year}
                </h3>
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center mb-6">
              <div className="rounded-xl overflow-hidden border border-[#1E4A38] aspect-[4/3]">
                <img
                  src={edition.imageSrc}
                  alt={`Edición ${edition.year}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#C5A059] uppercase font-mono tracking-widest text-[10px] block">
                    Año de Embotellado
                  </span>
                  <span className="text-sm font-bold font-serif text-white">
                    Navidad {edition.year}
                  </span>
                </div>

                <div>
                  <span className="text-[#C5A059] uppercase font-mono tracking-widest text-[10px] block">
                    Cantidad Producida
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-300">
                    {edition.quantityMade} Botellas Numeradas a Mano
                  </span>
                </div>

                <div>
                  <span className="text-[#C5A059] uppercase font-mono tracking-widest text-[10px] block">
                    Color del Cristal
                  </span>
                  <span className="text-white font-medium">
                    {edition.bottleColor}
                  </span>
                </div>

                <div>
                  <span className="text-[#C5A059] uppercase font-mono tracking-widest text-[10px] block">
                    Sello de Lacre
                  </span>
                  <span className="text-white font-medium">
                    {edition.waxSealColor}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#F4D9C6]/80 leading-relaxed border-t border-[#1E4A38]/50 pt-4 mb-6">
              {edition.archiveNote}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowArchiveModal(false)}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
