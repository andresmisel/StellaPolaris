import React, { useState, useEffect } from 'react';
import { Wish } from '../types';
import { Heart, Sparkles, Send, Pin, Star } from 'lucide-react';
import { sound, getMyClaimedBottle } from '../utils/storage';

interface WishesWallProps {
  wishes: Wish[];
  onAddWish: (newWish: Omit<Wish, 'id' | 'createdAt' | 'likes'>) => void;
  onLikeWish: (wishId: string) => void;
  isAdmin: boolean;
  description: string;
  authenticatedBottleNumber?: number | null;
  editionYear?: number;
}

export const WishesWall: React.FC<WishesWallProps> = ({
  wishes,
  onAddWish,
  onLikeWish,
  isAdmin,
  description,
  authenticatedBottleNumber,
  editionYear = 2026,
}) => {
  const [showForm, setShowForm] = useState(false);

  // Form states
  const myInitialBottle = authenticatedBottleNumber ?? getMyClaimedBottle();
  const [author, setAuthor] = useState('');
  const [bottleNumber, setBottleNumber] = useState<string>(
    myInitialBottle ? myInitialBottle.toString() : ''
  );
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  useEffect(() => {
    if (authenticatedBottleNumber) {
      setBottleNumber(authenticatedBottleNumber.toString());
    }
  }, [authenticatedBottleNumber]);

  // Only display approved wishes for regular users, or all for admin
  const visibleWishes = wishes.filter((w) => (isAdmin ? true : w.approved));

  // Sort pinned first, then by likes
  const sortedWishes = [...visibleWishes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.likes - a.likes;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !message.trim()) return;

    sound.playFestiveChime();

    const bNum = bottleNumber.trim() ? parseInt(bottleNumber.replace(/\D/g, ''), 10) : undefined;

    onAddWish({
      author: author.trim(),
      bottleNumber: bNum && bNum >= 1 && bNum <= 50 ? bNum : undefined,
      location: location.trim() || 'Comunidad Stella Polaris',
      message: message.trim(),
      category: 'Brindis Navideño',
      approved: isAdmin, // Auto-approve if admin, otherwise queued for moderation
      pinned: false,
    });

    setMessage('');
    setSubmittedNotice(true);
    setShowForm(false);
    setTimeout(() => setSubmittedNotice(false), 5000);
  };

  return (
    <section id="muro" className="py-20 bg-[#160408] relative overflow-hidden border-t border-[#4A0E1A]/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] uppercase mb-2">
            <Heart className="w-3.5 h-3.5 fill-[#F59E0B]" />
            <span>Comunidad & Coleccionistas {editionYear}</span>
          </div>
          <h2 className="font-brand-script text-5xl sm:text-6xl text-white pt-2 pb-2 leading-[1.3] mb-4">
            Muro de Deseos Navideños
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F4D9C6]/80 leading-relaxed">
            {description}
          </p>

          {/* Action to leave a wish */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                sound.playGlassClink();
                setShowForm(!showForm);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#E25822] to-[#D94F1C] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#E25822]/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#FDE68A]" />
              <span>{showForm ? 'Cerrar Formulario' : 'Escribir un Deseo Navideño'}</span>
            </button>
          </div>
        </div>

        {/* Success / Moderation Banner */}
        {submittedNotice && (
          <div className="max-w-xl mx-auto mb-8 bg-[#2A0811] border border-[#E25822] rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-[#FDE68A]">
              ✨ ¡Gracias por tu bendición navideña!
            </p>
            <p className="text-xs text-[#F4D9C6]/80 mt-1">
              Tu mensaje ha sido recibido con amor. Pasará por nuestro cálido filtro de moderación
              comunitaria para mantener la armonía de la Nochebuena.
            </p>
          </div>
        )}

        {/* Expandable Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto mb-12 bg-[#25070E] border border-[#801C2E] rounded-xl p-6 sm:p-8 shadow-2xl text-left"
          >
            <h3 className="font-serif text-xl font-bold text-white mb-1">
              Dejar una Huella en la Nochebuena
            </h3>
            <p className="text-xs text-[#F4D9C6]/70 mb-5">
              Comparte tu saludo con los 50 poseedores de la edición y la comunidad.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#F4D9C6] mb-1">
                    Tu Nombre o Familia *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Ej. Familia Gómez Rivas"
                    className="w-full bg-[#160408] border border-[#801C2E] rounded-md px-3 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:border-[#E25822] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#F4D9C6] mb-1">
                    Nº de Botella (Opcional si eres comprador)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={bottleNumber}
                    onChange={(e) => setBottleNumber(e.target.value)}
                    placeholder="Ej. 14 (de 01 a 50)"
                    className="w-full bg-[#160408] border border-[#801C2E] rounded-md px-3 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:border-[#E25822] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F4D9C6] mb-1">
                  Ciudad / Lugar
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Caracas, Madrid, Miami..."
                  className="w-full bg-[#160408] border border-[#801C2E] rounded-md px-3 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:border-[#E25822] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#F4D9C6] mb-1">
                  Tu Deseo o Mensaje Navideño *
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe aquí tu deseo para este fin de año y Nochebuena..."
                  className="w-full bg-[#160408] border border-[#801C2E] rounded-md px-3 py-2 text-xs sm:text-sm text-white placeholder-white/30 focus:border-[#E25822] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#F4D9C6]/60 italic">
                  🛡️ Mensajes filtrados con moderación de respeto y amor.
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-md bg-[#E25822] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#F16E28] transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publicar Deseo</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Only "Todos los Deseos" heading badge */}
        <div className="flex items-center justify-center mb-8">
          <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-[#E25822] text-white shadow-sm">
            Todos los Deseos
          </span>
        </div>

        {/* Wishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWishes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#F4D9C6]/60">
              <p>Aún no hay deseos publicados. ¡Sé el primero en compartir el tuyo!</p>
            </div>
          ) : (
            sortedWishes.map((w) => (
              <div
                key={w.id}
                className={`group relative rounded-xl p-5 border transition-all flex flex-col justify-between ${
                  w.pinned
                    ? 'bg-gradient-to-b from-[#2E0914] to-[#22060D] border-[#F59E0B]/60 shadow-lg shadow-[#F59E0B]/10'
                    : 'bg-[#1E050C]/90 border-[#801C2E]/40 hover:border-[#801C2E]'
                }`}
              >
                {/* Top Badge Area */}
                <div>
                  {(w.bottleNumber || w.pinned || (!w.approved && isAdmin)) && (
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {w.bottleNumber && (
                          <span className="text-[11px] font-mono font-bold text-[#FDE68A] bg-[#801C2E]/60 px-2 py-0.5 rounded flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-[#FDE68A]" />
                            Botella #{w.bottleNumber.toString().padStart(2, '0')}/50
                          </span>
                        )}
                      </div>

                      {w.pinned && (
                        <span className="text-[10px] uppercase font-serif tracking-widest text-[#F59E0B] flex items-center gap-1 font-semibold">
                          <Pin className="w-3 h-3 text-[#F59E0B]" />
                          Destacado
                        </span>
                      )}

                      {!w.approved && isAdmin && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          Pendiente
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message body */}
                  <p className="font-serif italic text-sm text-[#FDF8F0] leading-relaxed mb-4">
                    “{w.message}”
                  </p>
                </div>

                {/* Footer of Card */}
                <div className="pt-3 border-t border-[#801C2E]/30 flex items-center justify-between text-xs text-[#F4D9C6]/70">
                  <div>
                    <p className="font-semibold text-white">
                      {w.author}
                    </p>
                    <p className="text-[11px] text-[#F4D9C6]/60">
                      {w.location} · {w.createdAt}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      sound.playGlassClink();
                      onLikeWish(w.id);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/30 hover:bg-[#801C2E]/50 text-[#F4D9C6] hover:text-[#FDE68A] transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current text-[#E25822]" />
                    <span className="font-mono text-xs">{w.likes}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
