const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const targetUserObj = /export interface UserObj {[\s\S]*?}/;

const newUserObj = `export interface UserObj {
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
  replyTo?: { id: string, sender: string, text: string };
  reactions?: Record<string, string[]>;
  lizCoins?: number;
  activeDecoration?: string | null;  
  ownedDecorations?: string[];
  elo?: number;
  uid?: string;
  profileLikes?: number;
  profileComments?: { author: string, text: string, timestamp: number, stars?: number }[];
  bubbleColor?: string;
  bubbleBorder?: string;
  bubbleShape?: string;
  bubbleTexture?: string;
  nameColor?: string;
  nameNeon?: string;
  nameRainbow?: boolean;
  nameFont?: string;
  chatFont?: string;
  bgImage?: string;
}`;

code = code.replace(targetUserObj, newUserObj);
fs.writeFileSync('src/types.ts', code);
