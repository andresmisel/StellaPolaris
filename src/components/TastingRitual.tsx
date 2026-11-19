import React, { useState } from 'react';
import {
  Wine,
  ThermometerSnowflake,
  RefreshCw,
  Sparkles,
  Flame,
  Star,
} from 'lucide-react';
import { RitualData, RitualIconName } from '../types';
import { sound } from '../utils/storage';

interface TastingRitualProps {
  ritualData: RitualData;
  imageSrc: string;
}

const ICON_MAP: Record<RitualIconName, React.ComponentType<{ className?: string }>> = {
  ThermometerSnowflake,
  RefreshCw,
  Wine,
  Sparkles,
  Star,
  Flame,
};

export const TastingRitual: React.FC<TastingRitualProps> = ({ ritualData, imageSrc }) => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ritualData.steps;
  const safeActiveStep = steps.length > 0 && activeStep < steps.length ? activeStep : 0;

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    if (index % 2 === 0) sound.playGlassClink();
    else sound.playFestiveChime();
  };

  return (
    <section id="ritual" className="py-20 bg-[#160408] relative overflow-hidden border-t border-[#4A0E1A]/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] uppercase mb-2">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
            <span>Guía de Degustación Oficial</span>
          </div>
          <h2 className="font-brand-script text-5xl sm:text-6xl text-white pt-2 pb-2 leading-[1.25] mb-4">
            {ritualData.sectionTitle}
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F4D9C6]/80 leading-relaxed">
            {ritualData.sectionDescription}
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Glass Image */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="group relative rounded-2xl overflow-hidden border border-[#801C2E] bg-[#22060D] shadow-2xl">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={imageSrc}
                  alt="Copa de ponche crema Stella Polaris con nuez moscada y canela"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4 bg-[#1F060D] border-t border-[#801C2E]/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-serif text-[#FDE68A] font-semibold">
                    {ritualData.glassCardTitle}
                  </p>
                  <p className="text-[#F4D9C6]/70">
                    {ritualData.glassCardSubtitle}
                  </p>
                </div>
                <span className="font-mono text-[#F59E0B] bg-black/40 px-2 py-1 rounded">
                  {ritualData.temperatureBadge}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Stepper */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {steps.length === 0 ? (
              <div className="rounded-xl border border-[#801C2E]/40 bg-[#1C060B]/70 p-6 text-center text-xs text-[#F4D9C6]/70">
                No hay pasos configurados para el ritual de degustación.
              </div>
            ) : steps.map((step, index) => {
              const Icon = ICON_MAP[step.iconName] || Star;
              const isActive = safeActiveStep === index;

              return (
                <div
                  key={`${step.number}-${index}`}
                  onClick={() => handleStepClick(index)}
                  className={`cursor-pointer rounded-xl p-5 transition-all border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2F0914] to-[#24060E] border-[#E25822] shadow-xl shadow-[#E25822]/15 scale-[1.01]'
                      : 'bg-[#1C060B]/70 border-[#5C1423]/40 hover:border-[#801C2E] hover:bg-[#22060D]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isActive
                          ? 'bg-[#E25822] border-[#FDE68A] text-white shadow-md'
                          : 'bg-[#160408] border-[#801C2E]/60 text-[#F59E0B]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#F59E0B]">
                            Paso {step.number}
                          </span>
                          <span className="text-[#F4D9C6]/40">·</span>
                          <h3 className="font-serif text-base sm:text-lg font-bold text-white">
                            {step.title}
                          </h3>
                        </div>
                        {isActive && (
                          <span className="text-[10px] font-mono text-[#FDE68A] bg-[#E25822]/30 px-2 py-0.5 rounded border border-[#E25822]/40">
                            Activo
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#E25822] font-medium mb-2">
                        {step.subtitle}
                      </p>

                      <p className="text-xs sm:text-sm text-[#F4D9C6]/85 leading-relaxed">
                        {step.desc}
                      </p>

                      {isActive && (
                        <div className="mt-3 pt-3 border-t border-[#801C2E]/40 flex items-center gap-2 text-xs text-[#FDE68A]/90 bg-black/20 p-2.5 rounded">
                          <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0" />
                          <span>{step.tip}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
