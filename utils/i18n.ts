import { Category } from "../types";

export type Language = 'en' | 'ru';

export const translations = {
  en: {
    nav: { dashboard: 'Dashboard', history: 'History', advisor: 'Wealth Advisor', premium: 'Premium', logout: 'Log Out' },
    common: { save: 'Save', cancel: 'Cancel', back: 'Back', next: 'Next', finish: 'Finish Setup' },
    dashboard: { overview: 'Overview', totalBalance: 'Total Balance', availableBalance: 'Available Balance', income: 'Income', expenses: 'Expenses', savings: 'Invested / Saved', budgetAlert: 'Budget Alert', planVsFact: 'Plan vs. Fact', spendingMix: 'Spending & Investment Mix', dailyActivity: 'Daily Activity' },
    history: { title: 'Transactions', noTransactions: 'No transactions yet. Add one to start tracking wealth!', analysis: 'Activity Analysis' },
    setup: { welcome: 'Welcome to Budget', name: 'Your Name', currency: 'Currency', language: 'Language', totalBudget: 'Total Monthly Income/Budget', distribute: 'Distribute Budget', smartDist: 'Smart Distribution', savingsNote: 'We\'ve allocated 20% to Savings automatically.', googleSignIn: 'Continue with Google', manualSetup: 'Or continue manually' },
    form: { newTx: 'New Transaction', manual: 'Manual', voice: 'Voice', scan: 'Scan', amount: 'Amount', description: 'Description', category: 'Category', date: 'Date', saveTx: 'Save Transaction', tapToSpeak: 'Tap to Speak', tapToScan: 'Tap to scan receipt', processing: 'Processing...', typeExpense: 'Expense', typeIncome: 'Income', exchRate: 'Exchange Rate', detected: 'Detected currency' },
    advisor: { title: 'Wealth Advisor', subtitle: 'Powered by Gemini AI', placeholder: 'Ask for financial advice...', welcome: "Hello! I'm your private Wealth Advisor. How can I help you grow your wealth today?" },
    categories: {
      [Category.Food]: 'Food',
      [Category.Transport]: 'Transport',
      [Category.Utilities]: 'Utilities',
      [Category.Entertainment]: 'Entertainment',
      [Category.Shopping]: 'Shopping',
      [Category.Health]: 'Health',
      [Category.Savings]: 'Savings',
      [Category.Income]: 'Income',
      [Category.Other]: 'Other'
    }
  },
  ru: {
    nav: { dashboard: 'Дашборд', history: 'История', advisor: 'AI Советник', premium: 'Премиум', logout: 'Выйти' },
    common: { save: 'Сохранить', cancel: 'Отмена', back: 'Назад', next: 'Далее', finish: 'Завершить' },
    dashboard: { overview: 'Обзор', totalBalance: 'Общий баланс', availableBalance: 'Доступный баланс', income: 'Доходы', expenses: 'Расходы', savings: 'Накопления', budgetAlert: 'Бюджет', planVsFact: 'План / Факт', spendingMix: 'Структура расходов', dailyActivity: 'Ежедневная активность' },
    history: { title: 'История операций', noTransactions: 'Операций пока нет. Добавьте первую!', analysis: 'Анализ активности' },
    setup: { welcome: 'Добро пожаловать', name: 'Ваше имя', currency: 'Валюта', language: 'Язык', totalBudget: 'Месячный доход/бюджет', distribute: 'Распределить', smartDist: 'Умное распределение', savingsNote: 'Мы автоматически выделили 20% на накопления.', googleSignIn: 'Войти через Google', manualSetup: 'Или продолжить вручную' },
    form: { newTx: 'Новая операция', manual: 'Вручную', voice: 'Голос', scan: 'Скан', amount: 'Сумма', description: 'Описание', category: 'Категория', date: 'Дата', saveTx: 'Сохранить', tapToSpeak: 'Нажмите, чтобы говорить', tapToScan: 'Нажмите для сканирования', processing: 'Обработка...', typeExpense: 'Расход', typeIncome: 'Доход', exchRate: 'Курс обмена', detected: 'Обнаружена валюта' },
    advisor: { title: 'AI Советник', subtitle: 'На базе Gemini AI', placeholder: 'Спросите совета...', welcome: "Привет! Я ваш личный финансовый советник. Как я могу помочь вам приумножить капитал?" },
    categories: {
      [Category.Food]: 'Еда',
      [Category.Transport]: 'Транспорт',
      [Category.Utilities]: 'Коммуналка',
      [Category.Entertainment]: 'Развлечения',
      [Category.Shopping]: 'Шопинг',
      [Category.Health]: 'Здоровье',
      [Category.Savings]: 'Накопления',
      [Category.Income]: 'Доход',
      [Category.Other]: 'Другое'
    }
  }
};