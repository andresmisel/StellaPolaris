import React, { useState, useRef, useEffect } from 'react';
import { GameQuestion } from '../types';
import { Dices, Sparkles, RefreshCw, Heart, Wine, ArrowRight, Check, X } from 'lucide-react';
import { sound } from '../utils/storage';

interface TabletopGameProps {
  questions: GameQuestion[];
}

export const TabletopGame: React.FC<TabletopGameProps> = ({ questions }) => {
  const [selectedMode, setSelectedMode] = useState<'likely' | 'trivia' | 'memory' | 'toast'>('likely');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTriviaAnswer, setSelectedTriviaAnswer] = useState<number | null>(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownNum, setCountdownNum] = useState(3);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelDegree, setWheelDegree] = useState(0);

  const timersRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Filter questions for the selected mode
  const currentQuestions = questions.filter((q) => q.type === selectedMode);
  const safeCount = currentQuestions.length;
  const currentQ = safeCount > 0 ? currentQuestions[currentIndex % safeCount] : null;

  const handleNextQuestion = () => {
    if (safeCount === 0) return;
    clearTimers();
    setIsSpinning(false);
    sound.playGlassClink();
    setSelectedTriviaAnswer(null);
    setShowCountdown(false);
    setCurrentIndex((prev) => (prev + 1) % safeCount);
  };

  const handlePrevQuestion = () => {
    if (safeCount === 0) return;
    clearTimers();
    setIsSpinning(false);
    sound.playTick();
    setSelectedTriviaAnswer(null);
    setShowCountdown(false);
    setCurrentIndex((prev) => (prev - 1 + safeCount) % safeCount);
  };

  const handleModeChange = (mode: 'likely' | 'trivia' | 'memory' | 'toast') => {
    clearTimers();
    setIsSpinning(false);
    sound.playTick();
    setSelectedMode(mode);
    setCurrentIndex(0);
    setSelectedTriviaAnswer(null);
    setShowCountdown(false);
  };

  const triggerCountdown = () => {
    clearTimers();
    sound.playTick();
    setShowCountdown(true);
    setCountdownNum(3);

    const timer1 = window.setTimeout(() => {
      sound.playTick();
      setCountdownNum(2);
    }, 1000);

    const timer2 = window.setTimeout(() => {
      sound.playTick();
      setCountdownNum(1);
    }, 2000);

    const timer3 = window.setTimeout(() => {
      sound.playFestiveChime();
      setCountdownNum(0); // 0 means "¡SEÑALEN YA!"
    }, 3000);

    timersRef.current = [timer1, timer2, timer3];
  };

  const spinToastWheel = () => {
    if (isSpinning || safeCount === 0) return;
    clearTimers();
    setIsSpinning(true);
    sound.playTick();

    const randomRot = 1440 + Math.floor(Math.random() * 360);
    setWheelDegree((prev) => prev + randomRot);

    // Audio clicks during spin
    let ticks = 0;
    intervalRef.current = window.setInterval(() => {
      sound.playTick();
      ticks++;
      if (ticks > 12 && intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 150);

    const finishTimer = window.setTimeout(() => {
      clearTimers();
      setIsSpinning(false);
      sound.playFestiveChime();
      setSelectedTriviaAnswer(null);
      setShowCountdown(false);
      setCurrentIndex((prev) => (prev + 1) % safeCount);
    }, 2200);

    timersRef.current = [finishTimer];
  };

  return (
    <section id="juego" className="py-20 bg-[#1A050A] relative overflow-hidden border-t border-[#4A0E1A]/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] uppercase mb-2">
            <Dices className="w-3.5 h-3.5" />
            <span>Dinámica Familiar de Nochebuena</span>
          </div>
          <h2 className="font-brand-script text-5xl sm:text-6xl text-white mb-4">
            Juego de Sobremesa
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F4D9C6]/80 leading-relaxed">
            Las mejores cenas de Navidad ocurren cuando las copas chocan y las historias comienzan.
            Pasa el teléfono o la pantalla al centro de la mesa y jueguen juntos.
          </p>

          {/* Game Modes Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto mt-6">
            <button
              onClick={() => handleModeChange('likely')}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedMode === 'likely'
                  ? 'bg-[#E25822] text-white border-[#FDE68A] shadow-lg shadow-[#E25822]/20'
                  : 'bg-[#25070E] text-[#F4D9C6]/70 border-[#801C2E]/40 hover:text-white'
              }`}
            >
              ¿Quién es más probable?
            </button>

            <button
              onClick={() => handleModeChange('trivia')}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedMode === 'trivia'
                  ? 'bg-[#E25822] text-white border-[#FDE68A] shadow-lg shadow-[#E25822]/20'
                  : 'bg-[#25070E] text-[#F4D9C6]/70 border-[#801C2E]/40 hover:text-white'
              }`}
            >
              Trivia & Tradiciones
            </button>

            <button
              onClick={() => handleModeChange('memory')}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedMode === 'memory'
                  ? 'bg-[#E25822] text-white border-[#FDE68A] shadow-lg shadow-[#E25822]/20'
                  : 'bg-[#25070E] text-[#F4D9C6]/70 border-[#801C2E]/40 hover:text-white'
              }`}
            >
              Recuerdos & Gratitud
            </button>

            <button
              onClick={() => handleModeChange('toast')}
              className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedMode === 'toast'
                  ? 'bg-[#E25822] text-white border-[#FDE68A] shadow-lg shadow-[#E25822]/20'
                  : 'bg-[#25070E] text-[#F4D9C6]/70 border-[#801C2E]/40 hover:text-white'
              }`}
            >
              Ruleta del Brindis
            </button>
          </div>
        </div>

        {/* The Game Console Card */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-[#2B0912] to-[#1E050C] border-2 border-[#801C2E] rounded-2xl p-6 sm:p-10 shadow-2xl relative">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-4 text-[#C5A059] opacity-50 text-sm">✦</div>
          <div className="absolute top-3 right-4 text-[#C5A059] opacity-50 text-sm">✦</div>
          <div className="absolute bottom-3 left-4 text-[#C5A059] opacity-50 text-sm">✦</div>
          <div className="absolute bottom-3 right-4 text-[#C5A059] opacity-50 text-sm">✦</div>

          {!currentQ ? (
            <div className="py-10 text-center text-sm text-[#F4D9C6]/70">
              No hay tarjetas disponibles en esta categoría. Puedes añadir nuevas preguntas desde el Panel Superadmin.
            </div>
          ) : (
            <>
          {/* Top Tag & Card Counter */}
          <div className="flex items-center justify-between border-b border-[#801C2E]/40 pb-4 mb-6">
            <span className="font-mono text-xs text-[#F59E0B] uppercase tracking-wider bg-black/40 px-3 py-1 rounded">
              {currentQ.tag}
            </span>
            <span className="font-mono text-xs text-[#F4D9C6]/60">
              Tarjeta {(currentIndex % currentQuestions.length) + 1} de {currentQuestions.length}
            </span>
          </div>

          {/* Mode 1: ¿Quién es más probable que...? */}
          {selectedMode === 'likely' && (
            <div className="text-center py-4">
              <p className="font-serif text-lg text-[#F59E0B] mb-2">{currentQ.title}</p>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-bold leading-snug mb-8">
                {currentQ.prompt}
              </h3>

              {showCountdown ? (
                <div className="my-6">
                  {countdownNum > 0 ? (
                    <div className="inline-block font-mono text-6xl font-extrabold text-[#FDE68A] animate-pulse">
                      {countdownNum}
                    </div>
                  ) : (
                    <div className="inline-block font-serif text-2xl sm:text-3xl font-bold text-[#E25822] animate-bounce">
                      👉 ¡SEÑALEN TODOS EN LA MESA A LA VEZ! 👈
                    </div>
                  )}
                  <p className="text-xs text-[#F4D9C6]/60 mt-2">
                    ¡El más votado debe explicar por qué o beber un sorbo de Stella Polaris!
                  </p>
                </div>
              ) : (
                <button
                  onClick={triggerCountdown}
                  className="inline-flex items-center gap-2 rounded-md bg-[#E25822] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#F16E28] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#FDE68A]" />
                  <span>Iniciar Conteo 3, 2, 1...</span>
                </button>
              )}
            </div>
          )}

          {/* Mode 2: Trivia Navideña */}
          {selectedMode === 'trivia' && (
            <div className="py-2">
              <p className="font-serif text-xs text-[#F59E0B] uppercase tracking-wider mb-2">
                {currentQ.title}
              </p>
              <h3 className="font-serif text-xl sm:text-2xl text-white font-bold mb-6">
                {currentQ.prompt}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options?.map((opt, idx) => {
                  const isSelected = selectedTriviaAnswer === idx;
                  const isCorrect = currentQ.correctAnswer === idx;
                  const hasAnswered = selectedTriviaAnswer !== null;

                  let btnStyle = 'bg-[#180509] border-[#801C2E]/50 text-white hover:border-[#E25822]';
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-900/60 border-emerald-400 text-emerald-100 font-semibold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-[#180509]/40 border-white/5 text-white/40';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      disabled={hasAnswered}
                      onClick={() => {
                        setSelectedTriviaAnswer(idx);
                        if (isCorrect) sound.playFestiveChime();
                        else sound.playTick();
                      }}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                      {hasAnswered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {selectedTriviaAnswer !== null && (
                <div className="bg-[#180509] border border-[#F59E0B]/40 rounded-lg p-4 text-xs sm:text-sm text-[#FDF8F0] mb-4">
                  <p className="font-semibold text-[#FDE68A] mb-1">
                    {selectedTriviaAnswer === currentQ.correctAnswer ? '🎉 ¡Respuesta Correcta!' : '💡 ¿Sabías qué?'}
                  </p>
                  <p className="text-[#F4D9C6]/90 leading-relaxed">{currentQ.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Mode 3: Recuerdos & Gratitud */}
          {selectedMode === 'memory' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-[#E25822]/20 border border-[#E25822] flex items-center justify-center mx-auto mb-4 text-[#F59E0B]">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <p className="font-serif text-sm text-[#F59E0B] uppercase tracking-wider mb-2">
                Momento de Sobremesa
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal leading-relaxed mb-6">
                “{currentQ.prompt}”
              </h3>
              <p className="text-xs text-[#F4D9C6]/60 italic max-w-md mx-auto">
                Tómate un minuto, escucha a quien habla sin interrumpir y celebra el regalo de estar juntos hoy.
              </p>
            </div>
          )}

          {/* Mode 4: Ruleta del Brindis */}
          {selectedMode === 'toast' && (
            <div className="text-center py-4">
              <p className="font-serif text-sm text-[#F59E0B] uppercase tracking-wider mb-2">
                Gira la Ruleta & Brinda
              </p>

              {/* Rotating Bottle Graphic */}
              <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#F59E0B]/40 animate-spin-slow" />
                <div
                  className="w-28 h-28 flex items-center justify-center transition-transform duration-1000 ease-out"
                  style={{ transform: `rotate(${wheelDegree}deg)` }}
                >
                  <Wine className="w-16 h-16 text-[#E25822] drop-shadow-[0_0_15px_rgba(226,88,34,0.6)]" />
                </div>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl text-white font-bold mb-4">
                {currentQ.prompt}
              </h3>

              <button
                disabled={isSpinning}
                onClick={spinToastWheel}
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#E25822] to-[#D94F1C] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Girando la copa...' : 'Girar Ruleta'}</span>
              </button>
            </div>
          )}

          {/* Bottom Card Navigation */}
          <div className="flex items-center justify-between border-t border-[#801C2E]/40 pt-5 mt-6">
            <button
              onClick={handlePrevQuestion}
              className="text-xs text-[#F4D9C6]/60 hover:text-white transition-colors"
            >
              ← Anterior
            </button>

            <button
              onClick={handleNextQuestion}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B] hover:text-[#FDE68A] transition-colors"
            >
              <span>Siguiente Pregunta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </section>
  );
};
