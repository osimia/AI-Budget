import { Transaction, UserSettings, Category, Currency } from '../types';

const KEYS = {
  TRANSACTIONS: 'abt_transactions',
  SETTINGS: 'abt_settings',
};

const DEFAULT_SETTINGS: UserSettings = {
  currency: Currency.TJS,
  language: 'en',
  name: 'Guest',
  email: undefined,
  photoUrl: undefined,
  monthlyBudget: 3000,
  categoryBudgets: {
    [Category.Food]: 800,
    [Category.Savings]: 600, // 20%
    [Category.Transport]: 300,
    [Category.Utilities]: 300,
    [Category.Entertainment]: 150,
    [Category.Shopping]: 300,
    [Category.Health]: 150,
    [Category.Other]: 400,
    [Category.Income]: 0
  }
};

export const StorageService = {
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      const settings = data ? JSON.parse(data) : DEFAULT_SETTINGS;
      // Merge with default in case new fields (categoryBudgets, language, email) are missing from old save
      return { ...DEFAULT_SETTINGS, ...settings };
    } catch { return DEFAULT_SETTINGS; }
  },

  saveSettings: (settings: UserSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};