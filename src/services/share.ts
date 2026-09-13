// ARCADEX Social Sharing & Viral Bragging Engine
// Generates viral formatted messages with WhatsApp and Web Share API support

export interface ShareData {
  gameTitle: string;
  level?: number;
  score?: number;
  streak?: number;
  customNote?: string;
}

export const generateShareMessage = (data: ShareData): string => {
  const url = typeof window !== 'undefined' ? window.location.origin : 'https://arcadex.app';
  const lines: string[] = [
    '⚡ ARCADEX // COGNITIVE ARCADE',
    `🎮 Protocol: ${data.gameTitle}`,
  ];

  if (data.level !== undefined) {
    lines.push(`🏆 Cleared Level ${data.level}`);
  }
  if (data.score !== undefined) {
    lines.push(`🎯 Score: ${data.score} PTS`);
  }
  if (data.streak !== undefined && data.streak > 0) {
    lines.push(`🔥 Streak: ${data.streak} Days Active`);
  }
  if (data.customNote) {
    lines.push(`💬 "${data.customNote}"`);
  }

  lines.push('');
  lines.push('Can you beat my record? Challenge accepted:');
  lines.push(`👉 ${url}`);

  return lines.join('\n');
};

/** Shares directly to WhatsApp */
export const shareToWhatsApp = (data: ShareData): void => {
  const text = generateShareMessage(data);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
};

/** Shares via native mobile share sheet (WhatsApp, Instagram, Telegram, etc.) with WhatsApp fallback */
export const shareAchievement = async (data: ShareData): Promise<boolean> => {
  const text = generateShareMessage(data);
  const url = typeof window !== 'undefined' ? window.location.origin : 'https://arcadex.app';

  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share({
        title: `ARCADEX: ${data.gameTitle}`,
        text: text,
        url: url,
      });
      return true;
    } catch {
      // If user dismissed or cancelled, or fallback needed:
      return false;
    }
  } else {
    shareToWhatsApp(data);
    return true;
  }
};

/** Copy formatted score text to clipboard */
export const copyShareText = async (data: ShareData): Promise<boolean> => {
  const text = generateShareMessage(data);
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
