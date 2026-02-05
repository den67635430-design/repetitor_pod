
export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Subject {
  name: string;
  icon: string;
}
