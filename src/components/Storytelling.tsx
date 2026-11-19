import React from 'react';
import { Sparkles, Star } from 'lucide-react';

interface StorytellingProps {
  imageSrc: string;
  description: string;
  quote: string;
  editionYear: number;
}

export const Storytelling: React.FC<StorytellingProps> = ({
  imageSrc,
  description,
  quote,
  editionYear,
}) => {
  return (
    <section id="historia" className="py-20 bg-[#1A050A] relative overflow-hidden border-t border-[#4A0E1A]/60">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#E25822]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Historia Familiar · Origen Artesanal</span>
          </div>
          <h2 className="font-brand-script text-5xl sm:text-6xl text-white pt-2 pb-2 leading-[1.3] mb-3">
            Cómo Nació la Receta
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F4D9C6]/80 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Photo & Narrative Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
          {/* Left: Workshop Photo */}
          <div className="lg:col-span-6">
            <div className="group rounded-2xl overflow-hidden border border-[#801C2E]/70 bg-[#160408] shadow-2xl aspect-[4/3]">
              <img
                src={imageSrc}
                alt="Cocina artesanal de nochebuena con olla de cobre y ponche crema Stella Polaris"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Right: Family Narrative Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-serif uppercase tracking-widest text-[#F59E0B]">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
                  <span>Relato de la Casa</span>
                </div>
                <span className="font-mono text-xs text-[#F59E0B] bg-black/30 px-2.5 py-0.5 rounded border border-[#801C2E]/50">
                  Edición {editionYear}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-white mb-4">
                El Destello de la Estrella en la Cocina
              </h3>

              <p className="font-serif italic text-sm sm:text-base text-[#F4D9C6]/90 leading-relaxed">
                {quote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
