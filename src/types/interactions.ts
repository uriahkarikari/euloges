export type Candle = {
  id: string;
  createdAt: string;
};

export type MemorialMessage = {
  id: string;
  name: string;
  message: string;
  type: "memory" | "story" | "reflection" | "tribute" | "condolence";
  createdAt: string;
  approved: boolean;
};

export type MemorialAnalytics = {
  views: number;
  qrScans: number;
};

export type MemorialInteractions = {
  candles: Candle[];
  messages: MemorialMessage[];
  analytics: MemorialAnalytics;
};
