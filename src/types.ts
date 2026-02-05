export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Subject {
  name: string;
  icon: string;
}

export interface PricingPlan {
  name: string;
  description: string;
  price: number;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}
