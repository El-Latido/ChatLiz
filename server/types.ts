export interface DBState {
  users: Record<string, { password?: string, profilePic?: string, statusMessage?: string, role?: string, pais_idioma?: string, securityEmail?: string }>;
  globalMessages: any[];
}
