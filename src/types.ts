export type TabType = 'reply' | 'crush' | 'portal';

export interface UserProfile {
  nickname: string;
  aura: number;
}

export interface ReplyTone {
  id: string;
  label: string;
  emoji: string;
}

export interface CrushAnalysis {
  vibe: string;
  interest: 'low' | 'medium' | 'high';
  reason: string;
  suggestedReply: string;
}
