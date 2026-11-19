import React, { useRef, useState } from 'react';
import { Bottle } from '../types';
import {
  ShieldCheck,
  Printer,
  Share2,
  Check,
  Star,
  Download,
  LogOut,
} from 'lucide-react';
import { sound } from '../utils/storage';

interface CertificateViewProps {
  bottle: Bottle;
  onClose?: () => void;
  embedded?: boolean;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[n] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, currY);
    currY += lineHeight;
  }
  return currY;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  bottle,
  onClose,
  embedded = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    sound.playGlassClink();
    window.print();
  };

  const handleShare = () => {
    sound.playGlassClink();
    const shareText = `¡Disfrutando de mi botella exclusiva ${bottle.formattedNumber} de Ponche Crema Stella Polaris Edición Limitada 2026! ⭐🎄`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText + ' ' + window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    sound.playFestiveChime();

    try {
      const width = 1400;
      const height = 1080;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        window.print();
        return;
      }

      // Warm parchment gradient background
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        80,
        width / 2,
        height / 2,
        width * 0.7
      );
      grad.addColorStop(0, '#FCF8F2');
      grad.addColorStop(1, '#F3E7D6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Outer gold border
      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 10;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      // Inner filigree borders
      ctx.strokeStyle = 'rgba(197, 160, 89, 0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(46, 46, width - 92, height - 92);

      ctx.strokeStyle = 'rgba(197, 160, 89, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      // Corner ornaments
      ctx.fillStyle = 'rgba(197, 160, 89, 0.75)';
      ctx.font = '28px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('❖', 88, 96);
      ctx.fillText('❖', width - 88, 96);
      ctx.fillText('❖', 88, height - 76);
      ctx.fillText('❖', width - 88, height - 76);

      // Top Star badge
      ctx.beginPath();
      ctx.arc(width / 2, 128, 36, 0, Math.PI * 2);
      ctx.fillStyle = '#FAF1E3';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#C5A059';
      ctx.stroke();

      ctx.fillStyle = '#B38728';
      ctx.font = '32px Georgia, serif';
      ctx.fillText('★', width / 2, 140);

      // Kicker
      ctx.fillStyle = '#7D5B23';
      ctx.font = 'bold 17px Georgia, serif';
      ctx.fillText('CERTIFICADO DE AUTENTICIDAD ÚNICO', width / 2, 200);

      // Brand title
      ctx.fillStyle = '#3D0A14';
      ctx.font = 'italic bold 76px "Rumble Brave", "Great Vibes", Georgia, serif';
      ctx.fillText('Stella Polaris', width / 2, 285);

      // Subtitle
      ctx.fillStyle = '#721B24';
      ctx.font = 'italic 20px Georgia, serif';
      ctx.fillText(
        'Ponche Crema Artesanal · Cosecha Especial de Navidad 2026',
        width / 2,
        330
      );

      // Body statement
      ctx.fillStyle = '#4A3228';
      ctx.font = '20px Georgia, serif';
      const bodyEndY = wrapCanvasText(
        ctx,
        'Hacemos constar que esta botella forma parte de una edición limitada y numerada de Stella Polaris, concebida bajo estándares de cuidado en cada detalle, textura envolvente y carácter propio, nacida en casa y hecha en lotes pequeños para quienes valoran lo auténtico y el sabor a Navidad de verdad.',
        width / 2,
        382,
        960,
        30
      );

      // Number showcase box
      const boxW = 580;
      const boxH = 144;
      const boxX = (width - boxW) / 2;
      const boxY = Math.max(500, bodyEndY + 22);
      ctx.fillStyle = '#FAF1E3';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#7D5B23';
      ctx.font = '15px Georgia, serif';
      ctx.fillText('EJEMPLAR REGISTRADO', width / 2, boxY + 35);

      ctx.fillStyle = '#801C2E';
      ctx.font = 'bold 54px monospace';
      ctx.fillText(bottle.formattedNumber, width / 2, boxY + 93);

      ctx.fillStyle = '#8C6D37';
      ctx.font = '18px monospace';
      ctx.fillText(`Código de Verificación: ${bottle.code}`, width / 2, boxY + 128);

      // Owner & details divider
      const topDivY = boxY + boxH + 28;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(220, topDivY);
      ctx.lineTo(width - 220, topDivY);
      ctx.stroke();

      // Left detail: Owner
      ctx.textAlign = 'left';
      ctx.fillStyle = '#8C6D37';
      ctx.font = '14px Georgia, serif';
      ctx.fillText('TITULAR / PROPIETARIO', 240, topDivY + 34);

      ctx.fillStyle = '#240A10';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText(bottle.ownerName || `Propietario Ejemplar ${bottle.formattedNumber}`, 240, topDivY + 64);

      ctx.fillStyle = '#7D5B23';
      ctx.font = '17px Georgia, serif';
      ctx.fillText(bottle.location || 'Edición Limitada 2026', 240, topDivY + 92);

      // Right detail: Year of Issue
      ctx.fillStyle = '#8C6D37';
      ctx.font = '14px Georgia, serif';
      ctx.fillText('AÑO DE EMISIÓN', 840, topDivY + 34);

      ctx.fillStyle = '#240A10';
      ctx.font = 'bold 26px monospace';
      ctx.fillText('2026', 840, topDivY + 68);

      // Dedication
      ctx.textAlign = 'center';
      if (bottle.dedication) {
        ctx.fillStyle = '#5C2B14';
        ctx.font = 'italic 19px Georgia, serif';
        ctx.fillText(`“${bottle.dedication}”`, width / 2, topDivY + 132);
      }

      // Bottom divider
      const bottomDivY = topDivY + (bottle.dedication ? 158 : 122);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
      ctx.beginPath();
      ctx.moveTo(220, bottomDivY);
      ctx.lineTo(width - 220, bottomDivY);
      ctx.stroke();

      // Single centered Stella Polaris Seal
      const sealY = Math.min(930, bottomDivY + 86);
      ctx.beginPath();
      ctx.arc(width / 2, sealY, 56, 0, Math.PI * 2);
      ctx.fillStyle = '#801C2E';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#D4AF37';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, sealY, 48, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(253, 230, 138, 0.5)';
      ctx.stroke();

      ctx.fillStyle = '#FDE68A';
      ctx.font = '20px Georgia, serif';
      ctx.fillText('★', width / 2, sealY - 18);
      ctx.font = 'bold 12px Georgia, serif';
      ctx.fillText('STELLA', width / 2, sealY + 2);
      ctx.fillText('POLARIS', width / 2, sealY + 17);
      ctx.font = 'bold 11px monospace';
      ctx.fillText('2026', width / 2, sealY + 34);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Certificado-Stella-Polaris-${bottle.code}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2800);
    } catch {
      window.print();
    }
  };

  return (
    <div className={`flex flex-col items-center ${embedded ? '' : 'p-2 sm:p-4 max-w-3xl mx-auto'}`}>
      {/* Top action bar */}
      {!embedded && (
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#5C1423]/50 mb-6 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-sm font-semibold text-[#FDF8F0]">
              Certificado Oficial de Autenticidad
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FDF8F0] bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FDF8F0] bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E25822] hover:bg-[#F16E28] rounded transition-colors shadow-sm"
            >
              {downloaded ? (
                <Check className="w-3.5 h-3.5 text-[#FDE68A]" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{downloaded ? '¡Descargado!' : 'Descargar Certificado'}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={() => {
                  sound.playTick();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#FDE68A] bg-[#801C2E]/80 hover:bg-[#801C2E] border border-[#E25822]/50 rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir del Certificado</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* The Printable Certificate Physical Frame */}
      <div
        ref={certRef}
        id="printable-certificate"
        className="w-full bg-[#FCF8F2] text-[#250910] p-6 sm:p-10 rounded-xl shadow-2xl border-4 border-[#C5A059] relative overflow-hidden select-text"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, #FCF8F2 0%, #F5ECE0 100%)',
        }}
      >
        {/* Double inner gold filigree hairline border */}
        <div className="absolute inset-2 sm:inset-3 border border-[#C5A059]/60 pointer-events-none rounded-lg" />
        <div className="absolute inset-3 sm:inset-4 border border-[#C5A059]/30 pointer-events-none rounded-lg" />

        {/* Vintage corner accents */}
        <div className="absolute top-4 left-4 text-[#C5A059] opacity-60 text-lg">❖</div>
        <div className="absolute top-4 right-4 text-[#C5A059] opacity-60 text-lg">❖</div>
        <div className="absolute bottom-4 left-4 text-[#C5A059] opacity-60 text-lg">❖</div>
        <div className="absolute bottom-4 right-4 text-[#C5A059] opacity-60 text-lg">❖</div>

        {/* Certificate Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Header Monogram / Star */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-[#C5A059] bg-[#FAF1E3] text-[#B38728] mb-3 shadow-inner">
            <Star className="w-6 h-6 fill-[#C5A059]" />
          </div>

          <p className="text-[11px] font-serif tracking-[0.25em] uppercase text-[#7D5B23] mb-1">
            Certificado de Autenticidad Único
          </p>

          {/* Brand Logo in Rumble Brave Script typography */}
          <div className="overflow-visible py-1">
            <h2 className="font-brand-script text-4xl sm:text-6xl text-[#3D0A14] leading-[1.3] pt-2 pb-1 mb-1">
              Stella Polaris
            </h2>
          </div>

          <p className="text-xs font-serif italic text-[#721B24] tracking-wider mb-6">
            Ponche Crema Artesanal · Cosecha Especial de Navidad 2026
          </p>

          {/* Certificate Main Text */}
          <p className="font-serif text-xs sm:text-sm text-[#4A3228] max-w-xl leading-relaxed mb-6">
            Hacemos constar que esta botella forma parte de una edición limitada y numerada de Stella Polaris, concebida bajo estándares de cuidado en cada detalle, textura envolvente y carácter propio, nacida en casa y hecha en lotes pequeños para quienes valoran lo auténtico y el sabor a Navidad de verdad.
          </p>

          {/* Big Collector Number */}
          <div className="w-full max-w-md bg-[#FAF1E3] border border-[#D4AF37]/50 rounded-lg p-4 sm:p-5 mb-6 shadow-sm">
            <span className="text-[10px] tracking-widest uppercase font-serif text-[#7D5B23] block mb-1">
              Ejemplar Registrado
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[#801C2E]">
              {bottle.formattedNumber}
            </div>
            <p className="text-xs font-mono text-[#8C6D37] mt-1">
              Código de Verificación: {bottle.code}
            </p>
          </div>

          {/* Owner & Year Details */}
          <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4 text-left border-y border-[#D4AF37]/40 py-4 mb-8 text-xs font-serif text-[#3A2218]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8C6D37] block">
                Titular / Propietario
              </span>
              <span className="font-semibold text-sm text-[#240A10]">
                {bottle.ownerName || 'Poseedor de la Edición 2026'}
              </span>
              {bottle.location && (
                <span className="text-[11px] text-[#7D5B23] block mt-0.5">
                  {bottle.location}
                </span>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#8C6D37] block">
                Año de Emisión
              </span>
              <span className="font-mono font-bold text-base text-[#240A10]">
                2026
              </span>
            </div>

            {bottle.dedication && (
              <div className="sm:col-span-2 bg-white/40 p-2.5 rounded border border-[#D4AF37]/30 italic text-[12px] text-[#5C2B14] text-center">
                “{bottle.dedication}”
              </div>
            )}
          </div>

          {/* Single Centered Stella Polaris Seal */}
          <div className="flex flex-col items-center justify-center pt-1">
            <div className="w-24 h-24 rounded-full bg-[#801C2E] border-2 border-[#D4AF37] shadow-lg flex items-center justify-center text-[#FDE68A] ring-1 ring-[#FDE68A]/40 ring-inset transform rotate-[-4deg]">
              <div className="text-center leading-tight px-1">
                <Star className="w-4 h-4 mx-auto fill-[#FDE68A] mb-1" />
                <span className="text-[9px] font-serif tracking-widest uppercase block font-bold">
                  STELLA
                </span>
                <span className="text-[9px] font-serif tracking-widest uppercase block font-bold">
                  POLARIS
                </span>
                <span className="text-[8px] font-mono block mt-0.5 text-[#FDE68A]/90">
                  2026
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
