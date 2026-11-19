import React from 'react';
import { Music, Volume2, ExternalLink } from 'lucide-react';
import { sound } from '../utils/storage';

interface YouTubeMusicProps {
  playlistUrl: string;
  editionYear?: number;
}

const DEFAULT_PLAYLIST_EMBED = 'https://www.youtube.com/embed/videoseries?list=PL442749EB6183B552';

function normalizeYouTubeEmbedUrl(rawUrl: string): { embedSrc: string; externalHref: string } {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      embedSrc: DEFAULT_PLAYLIST_EMBED,
      externalHref: 'https://www.youtube.com/playlist?list=PL442749EB6183B552',
    };
  }

  try {
    const parsed = new URL(trimmed);
    const listId = parsed.searchParams.get('list');
    const videoId = parsed.searchParams.get('v');

    if (parsed.pathname.startsWith('/embed/')) {
      return {
        embedSrc: trimmed,
        externalHref: listId
          ? `https://www.youtube.com/playlist?list=${listId}`
          : trimmed.replace('/embed/', '/watch?v='),
      };
    }

    if (listId) {
      return {
        embedSrc: `https://www.youtube.com/embed/videoseries?list=${listId}`,
        externalHref: `https://www.youtube.com/playlist?list=${listId}`,
      };
    }

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      if (id) {
        return {
          embedSrc: `https://www.youtube.com/embed/${id}`,
          externalHref: `https://www.youtube.com/watch?v=${id}`,
        };
      }
    }

    if (videoId) {
      return {
        embedSrc: `https://www.youtube.com/embed/${videoId}`,
        externalHref: `https://www.youtube.com/watch?v=${videoId}`,
      };
    }
  } catch {
    // Fall back to raw trimmed URL
  }

  return {
    embedSrc: trimmed,
    externalHref: trimmed,
  };
}

export const YouTubeMusic: React.FC<YouTubeMusicProps> = ({
  playlistUrl,
  editionYear = 2026,
}) => {
  const { embedSrc, externalHref } = normalizeYouTubeEmbedUrl(playlistUrl);

  return (
    <section id="musica" className="py-20 bg-[#160408] relative overflow-hidden border-t border-[#4A0E1A]/60">
      {/* Background ambient warm illumination */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#801C2E]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-serif tracking-widest text-[#F59E0B] uppercase mb-2">
            <Music className="w-3.5 h-3.5" />
            <span>Banda Sonora de Nochebuena {editionYear}</span>
          </div>
          <h2 className="font-brand-script text-5xl sm:text-6xl text-white pt-2 pb-2 leading-[1.3] mb-3">
            Música para la Mesa
          </h2>
          <p className="font-sans text-sm sm:text-base text-[#F4D9C6]/80 leading-relaxed">
            Sintoniza nuestra playlist navideña en YouTube pensada para acompañar cada copa de Stella Polaris.
          </p>
        </div>

        {/* Centered YouTube Player */}
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="rounded-2xl overflow-hidden border border-[#801C2E] bg-[#120306] shadow-2xl aspect-video relative">
            <iframe
              src={embedSrc}
              title="Playlist Navideña Stella Polaris"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>

          {/* Bottom Info Bar */}
          <div className="bg-[#24070F] border border-[#801C2E]/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E25822]/20 border border-[#E25822] flex items-center justify-center text-[#F59E0B] shrink-0">
                <Volume2 className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="font-serif font-bold text-white text-sm">
                  Playlist Navideña Stella Polaris
                </p>
                <p className="text-[#F4D9C6]/70 text-[11px]">
                  Melodías seleccionadas para compartir la sobremesa en familia.
                </p>
              </div>
            </div>

            <a
              href={externalHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playGlassClink()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-white/5 hover:bg-white/10 text-[#F59E0B] hover:text-[#FDE68A] transition-colors shrink-0 text-xs font-medium border border-white/10"
            >
              <span>Abrir en YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
