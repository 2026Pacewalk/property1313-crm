import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_INTRO =
  "Hi {{name}}! 👋\n\nThank you for your interest in *Property1313* — your trusted real-estate partner in Tricity. 🏡\n\nWe help you find premium, RERA-approved homes that match your budget and lifestyle. Our team will reach out shortly with the best options for you.\n\nFeel free to reply here with any questions!";

interface WhatsAppConnectionState {
  businessNumber: string;   // digits incl. country code, e.g. 919876543210
  businessName: string;
  connected: boolean;
  connectedAt: string | null;
  introMessage: string;     // supports {{name}}
  autoIntro: boolean;       // auto-open intro when a new lead is added

  setBusinessNumber: (n: string) => void;
  setBusinessName: (n: string) => void;
  setIntroMessage: (m: string) => void;
  setAutoIntro: (b: boolean) => void;
  connect: (number: string) => void;
  disconnect: () => void;
  /** Render the intro for a given lead name. */
  renderIntro: (name: string) => string;
}

export const useWhatsAppConnectionStore = create<WhatsAppConnectionState>()(
  persist(
    (set, get) => ({
      businessNumber: '919876543210',
      businessName: 'Property1313',
      connected: false,
      connectedAt: null,
      introMessage: DEFAULT_INTRO,
      autoIntro: true,

      setBusinessNumber: (n) => set({ businessNumber: n.replace(/\D/g, '') }),
      setBusinessName: (n) => set({ businessName: n }),
      setIntroMessage: (m) => set({ introMessage: m }),
      setAutoIntro: (b) => set({ autoIntro: b }),
      connect: (number) => set({ connected: true, businessNumber: number.replace(/\D/g, ''), connectedAt: new Date().toISOString() }),
      disconnect: () => set({ connected: false, connectedAt: null }),
      renderIntro: (name) => get().introMessage.replace(/\{\{\s*name\s*\}\}/g, name || 'there'),
    }),
    { name: 'p13-whatsapp-connection' }
  )
);

export { DEFAULT_INTRO };
