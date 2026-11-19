const SECRET_PEPPER = 'STELLA_POLARIS_2026_NOEL_EVAN321';

function hashMix(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + (i << 3);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  const combined = ((h1 >>> 0).toString(36) + (h2 >>> 0).toString(36)).toUpperCase();
  return combined.slice(0, 6).padStart(6, 'X');
}

export function computeBottleSignature(bottleNumber: number, salt: string): string {
  const normalizedSalt = salt.trim().toUpperCase();
  return hashMix(`${SECRET_PEPPER}:${bottleNumber}:${normalizedSalt}`);
}

export function generateRandomSalt(length = 4): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateDefaultSalt(bottleNumber: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let seed = bottleNumber * 7919 + 104729;
  let result = '';
  for (let i = 0; i < 4; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    result += chars.charAt(seed % chars.length);
  }
  return result;
}

export function generateBottleToken(bottleNumber: number, customSalt?: string): string {
  const numStr = bottleNumber.toString().padStart(2, '0');
  const salt = (customSalt || generateRandomSalt(4)).toUpperCase();
  const sig = computeBottleSignature(bottleNumber, salt);
  return `SP26-${numStr}-${salt}-${sig}`;
}

export function generateDefaultBottleToken(bottleNumber: number): string {
  return generateBottleToken(bottleNumber, generateDefaultSalt(bottleNumber));
}

export function parseAndVerifyBottleToken(token: string): {
  valid: boolean;
  bottleNumber: number | null;
} {
  const clean = token.trim().toUpperCase();
  const match = clean.match(/^SP26-(\d{2})-([A-Z0-9]{4})-([A-Z0-9]{6})$/);
  if (!match) {
    return { valid: false, bottleNumber: null };
  }
  const bottleNumber = parseInt(match[1], 10);
  if (bottleNumber < 1 || bottleNumber > 50) {
    return { valid: false, bottleNumber: null };
  }
  const salt = match[2];
  const sig = match[3];
  const expectedSig = computeBottleSignature(bottleNumber, salt);
  return {
    valid: sig === expectedSig,
    bottleNumber,
  };
}

export function buildBottleAuthUrl(
  bottleNumber: number,
  token: string,
  ownerName?: string
): string {
  const base =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : 'https://stellapolaris.app/';
  const params = new URLSearchParams();
  params.set('botella', bottleNumber.toString().padStart(2, '0'));
  params.set('token', token);
  if (ownerName && ownerName.trim()) {
    params.set('titular', ownerName.trim());
  }
  return `${base}?${params.toString()}`;
}

export function extractAuthFromUrlOrText(input: string): {
  bottleNumber: number | null;
  token: string | null;
  ownerName?: string;
} {
  const trimmed = input.trim();
  if (!trimmed) return { bottleNumber: null, token: null };

  // Check if it looks like a URL or query string
  if (trimmed.includes('botella=') || trimmed.includes('token=')) {
    try {
      const queryPart = trimmed.includes('?') ? trimmed.split('?')[1] : trimmed;
      const params = new URLSearchParams(queryPart);
      const token = params.get('token');
      const bStr = params.get('botella');
      const owner = params.get('titular') || undefined;
      if (token) {
        const parsed = parseAndVerifyBottleToken(token);
        const bottleNumber = bStr ? parseInt(bStr, 10) : parsed.bottleNumber;
        return { bottleNumber, token: token.toUpperCase(), ownerName: owner };
      }
    } catch {
      // fall through
    }
  }

  // Check if it's a direct token string SP26-XX-XXXX-XXXXXX
  const parsed = parseAndVerifyBottleToken(trimmed);
  if (parsed.valid && parsed.bottleNumber) {
    return { bottleNumber: parsed.bottleNumber, token: trimmed.toUpperCase() };
  }

  return { bottleNumber: null, token: null };
}
