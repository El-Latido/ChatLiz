export interface Message {
  id: string;
  sender: string;
  text?: string;
  image?: string;
  audio?: string;
}

export interface User {
  username: string;
}
