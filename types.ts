
export enum Currency {
  TJS = 'TJS',
  UZS = 'UZS',
  USD = 'USD'
}

export enum Category {
  Food = 'Food',
  Transport = 'Transport',
  Utilities = 'Utilities',
  Entertainment = 'Entertainment',
  Shopping = 'Shopping',
  Health = 'Health',
  Savings = 'Savings', // Investments/Accumulation
  Income = 'Income',
  Other = 'Other'
}

export interface Transaction {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO string
  type: 'expense' | 'income';
}

export interface UserSettings {
  currency: Currency;
  language: 'en' | 'ru';
  name: string;
  email?: string; // New field for Google Auth
  photoUrl?: string; // New field for Google Auth
  monthlyBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
