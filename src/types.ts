export interface Bottle {
  number: number; // 1 to 50
  formattedNumber: string; // e.g. "01/50"
  code: string; // e.g. "SP26-01"
  authToken: string; // Unique signed authentication token per bottle
  tokenRegenerated?: boolean; // True if superadmin regenerated token locally
  claimed: boolean;
  ownerName?: string;
  claimDate?: string;
  dedication?: string;
  location?: string;
}

export interface Wish {
  id: string;
  author: string;
  bottleNumber?: number;
  location: string;
  message: string;
  category: 'Paz & Familia' | 'Gratitud' | 'Nuevos Comienzos' | 'Brindis Navideño';
  createdAt: string;
  approved: boolean;
  pinned?: boolean;
  likes: number;
}

export interface GameQuestion {
  id: string;
  type: 'likely' | 'trivia' | 'memory' | 'toast';
  title: string;
  prompt: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  tag: string;
}

export type RitualIconName =
  | 'ThermometerSnowflake'
  | 'RefreshCw'
  | 'Wine'
  | 'Sparkles'
  | 'Star'
  | 'Flame';

export interface RitualStep {
  number: string;
  title: string;
  subtitle: string;
  desc: string;
  tip: string;
  iconName: RitualIconName;
}

export interface RitualData {
  sectionTitle: string;
  sectionDescription: string;
  glassCardTitle: string;
  glassCardSubtitle: string;
  temperatureBadge: string;
  pairings: string[];
  steps: RitualStep[];
}

export interface SiteImages {
  heroBottle: string;
  ritualGlass: string;
  storyKitchen: string;
  secondLifeLantern: string;
}

export interface AppSettings {
  videoUrl: string; // YouTube video URL or ID
  playlistUrl: string; // YouTube playlist embed
  editionYear: number;
  totalBottles: number;
  bottleColor: string;
  heroKicker: string;
  heroSubtitle: string;
  heroDescription: string;
  storyDescription: string;
  storyQuote: string;
  wishesDescription: string;
  footerDescription: string;
  images: SiteImages;
}

export interface PastEdition {
  year: number;
  bottleColor: string;
  quantityMade: number;
  quantityLabel: string;
  status: string;
  description: string;
  tastingNotes: string;
  imageSrc: string;
  waxSealColor: string;
  keyFeatures: string[];
  archiveNote: string;
}

export interface SecondLifeStep {
  step: string;
  title: string;
  desc: string;
}

export interface SecondLifeData {
  kicker: string;
  sectionTitle: string;
  sectionDescription: string;
  guideKicker: string;
  guideTitle: string;
  steps: SecondLifeStep[];
  tipTitle: string;
  tipText: string;
}
