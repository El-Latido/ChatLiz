export interface UserObj {
  username: string;
  profilePic?: string;
  statusMessage?: string;
  role?: string;
  djSchedule?: { start: string, end: string };
  countryLanguage?: string;
  pais_idioma?: string;
  securityEmail?: string;
  timezone?: string;
  systemInstruction?: string;
  friends_list?: string[];
  blocked_list?: string[];
  is_friends_public?: boolean;
  awards?: string[];
  friend_requests?: any[];
  preferred_background?: string;
  preferred_theme?: string;
  isAi?: boolean;
  lizCoins?: number;
  activeDecoration?: string | null;
  ownedDecorations?: string[];
  elo?: number;
  uid?: string;
  profileLikes?: number;
}

export interface TutiFruttiState {
  isActive: boolean;
  players: string[];
  currentLetter: string;
  scores: Record<string, number>;
  roundEndTime: number;
  answers: Record<string, any>;
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;
  isCalculating?: boolean;
  roundResults?: any;
}

export interface HallOfFameEntry {
  id: string;
  title: string;
  phrases: { sender: string, text: string }[];
  authors: string[];
  date: number;
}

export interface MessageObj {
  id: string;
  text: string;
  sender: string;
  senderId?: string;
  createdAt: number | Date | any;
  audio?: string;
  image?: string;
  type?: string;
  isAi?: boolean;
  inviteData?: {
    gameId: string;
    gameType: string;
    bet: number;
    host: string;
  };
}

export interface PostObj {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[]; // Array of usernames or uids
  createdAt: number;
}

export interface CommentObj {
  id: string;
  postId: string;
  username: string;
  userAvatar?: string;
  text: string;
  createdAt: number;
}

export interface StoryObj {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: number;
}
