import React from 'react';
import { Lightbulb, Star } from 'lucide-react';
import { SecondLifeData } from '../types';

interface BottleSecondLifeProps {
  imageSrc: string;
  data: SecondLifeData;
}

export const BottleSecondLife: React.FC<BottleSecondLifeProps> = ({ imageSrc, data }) => {
  return (
    <section id="segunda-vida" className="py-20 bg-[#160408] relative overflow-hidden border-t border-[#4A0E1A]/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] uppercase mb-2">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{data.kicker}</span>
          </div>
          <h2 className="font-brand-script text-5xl sm:text-6xl text-white pt-2 pb-2 leading-[1.3] mb-4">
            {data.sectionTitle}
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F4D9C6]/80 leading-relaxed whitespace-pre-line">
            {data.sectionDescription}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Bottle Lantern Preview */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="group relative w-full max-w-md rounded-2xl overflow-hidden border border-[#801C2E] bg-[#120306] p-3 shadow-2xl">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0A0204]">
                <img
                  src={imageSrc}
                  alt="Lámpara artesanal hecha con la botella ámbar de ponche crema Stella Polaris"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Right Column: DIY Upcycling Guide Steps */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="mb-2">
              <span className="text-xs font-serif uppercase tracking-widest text-[#E25822] font-semibold">
                {data.guideKicker}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                {data.guideTitle}
              </h3>
            </div>

            <div className="space-y-3.5">
              {data.steps.length === 0 ? (
                <div className="rounded-xl border border-[#801C2E]/40 bg-[#1F060D]/80 p-5 text-center text-xs text-[#F4D9C6]/70">
                  No hay pasos configurados para la Segunda Vida de la Botella.
                </div>
              ) : (
                data.steps.map((s, idx) => (
                  <div
                    key={`${s.step}-${idx}`}
                    className="rounded-xl border border-[#801C2E]/40 bg-[#1F060D]/80 p-4 transition-all hover:border-[#801C2E] hover:bg-[#25070E]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-sm font-bold text-[#F59E0B] bg-black/40 px-2 py-0.5 rounded border border-[#801C2E]/40">
                        {s.step}
                      </span>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-white mb-1">
                          {s.title}
                        </h4>
                        <p className="text-xs text-[#F4D9C6]/80 leading-relaxed">
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {(data.tipTitle.trim() || data.tipText.trim()) && (
              <div className="rounded-xl bg-[#280812] border border-[#E25822]/40 p-4 mt-2 flex items-center gap-3">
                <Star className="w-5 h-5 text-[#F59E0B] shrink-0" />
                <p className="text-xs text-[#F4D9C6]/90">
                  {data.tipTitle.trim() && <strong>{data.tipTitle} </strong>}
                  {data.tipText}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
