export interface DBState {
  users: Record<string, { password?: string, profilePic?: string, statusMessage?: string, role?: string, pais_idioma?: string, securityEmail?: string, timezone?: string, systemInstruction?: string, friend_requests?: string[], friends_list?: string[], blocked_list?: string[], awards?: string[], is_friends_public?: boolean, preferred_theme?: string }>;
  globalMessages: any[];
  hallOfFame?: any[];
}
