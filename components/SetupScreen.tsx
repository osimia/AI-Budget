import React, { useState, useEffect } from 'react';
import { Currency, UserSettings, Category } from '../types';
import { translations, Language } from '../utils/i18n';
import { FirebaseService } from '../services/firebase';
import { Wallet, Check, ChevronDown, Sparkles, PieChart, ArrowRight, TrendingUp, Globe, UserCircle } from 'lucide-react';

interface SetupScreenProps {
  onComplete: (settings: UserSettings) => void;
}

// Recommended percentages for auto-distribution
const DISTRIBUTION = {
  [Category.Savings]: 0.20,
  [Category.Food]: 0.25,
  [Category.Transport]: 0.10,
  [Category.Utilities]: 0.10,
  [Category.Shopping]: 0.10,
  [Category.Entertainment]: 0.05,
  [Category.Health]: 0.10,
  [Category.Other]: 0.10,
};

export const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<Currency>(Currency.TJS);
  const [language, setLanguage] = useState<Language>('en');
  const [totalBudget, setTotalBudget] = useState('3000');
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);

  const t = translations[language];

  // Auto-calculate budgets when total changes
  useEffect(() => {
    const total = parseFloat(totalBudget) || 0;
    const newBudgets: Record<string, number> = {};
    
    Object.keys(DISTRIBUTION).forEach((cat) => {
      // @ts-ignore
      newBudgets[cat] = Math.round(total * DISTRIBUTION[cat]);
    });
    
    setCategoryBudgets(newBudgets);
  }, [totalBudget]);

  const handleBudgetChange = (category: string, value: string) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await FirebaseService.signInWithGoogle();
      if (user) {
        if (user.displayName) setName(user.displayName);
        if (user.photoURL) setPhotoUrl(user.photoURL);
        if (user.email) setEmail(user.email);
        setStep(2); // Move to budget step after login
      }
    } catch (error) {
      // Error handled in service or silent catch
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !totalBudget) return;

    if (step === 1) {
      setStep(2);
    } else {
      const finalSettings: UserSettings = {
        name,
        currency,
        language,
        monthlyBudget: parseFloat(totalBudget),
        categoryBudgets,
        email,
        photoUrl
      };
      
      // Optionally sync to cloud if logged in
      // FirebaseService.saveUserProfile(currentUser, finalSettings)

      onComplete(finalSettings);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden border border-stone-100">
        {/* Header */}
        <div className="bg-emerald-950 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={80} className="text-amber-400" />
          </div>
          <div className="inline-flex p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg shadow-amber-900/50 mb-6 text-emerald-950">
            <Wallet size={40} strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Budget<span className="text-amber-400">AI</span></h1>
          <p className="text-emerald-200/80 text-sm">{t.setup.welcome}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider ml-1">{t.setup.language}</label>
                <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => setLanguage('en')} 
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-emerald-900' : 'text-stone-500'}`}
                    >
                      English
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setLanguage('ru')} 
                      className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${language === 'ru' ? 'bg-white shadow-sm text-emerald-900' : 'text-stone-500'}`}
                    >
                      Русский
                    </button>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 bg-white border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center space-x-3 shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    className="text-blue-500"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    className="text-green-500"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    className="text-yellow-500"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    className="text-red-500"
                  />
                </svg>
                <span>{t.setup.googleSignIn}</span>
              </button>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-stone-400 font-medium uppercase">{t.setup.manualSetup}</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider ml-1">{t.setup.name}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-base font-medium text-stone-800 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all outline-none"
                  placeholder="e.g. Akramhon"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider ml-1">{t.setup.currency}</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(Currency).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`flex items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 font-bold ${
                        currency === c
                          ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                          : 'border-stone-100 bg-stone-50 text-stone-400 hover:border-stone-200'
                      }`}
                    >
                      {c}
                      {currency === c && <Check size={16} className="ml-1.5" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-emerald-900 uppercase tracking-wider ml-1">{t.setup.totalBudget}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    className="w-full pl-4 pr-16 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xl font-bold text-stone-800 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all outline-none"
                    placeholder="0"
                    required
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-stone-400 font-bold">
                    {currency}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-emerald-900/20 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center space-x-2"
              >
                <span>{t.common.next}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          )}

          {step === 2 && (
             <div className="space-y-6 animate-fade-in">
               <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start space-x-3">
                  <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 mt-1">
                    <PieChart size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">{t.setup.smartDist}</h3>
                    <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                      {t.setup.savingsNote}
                    </p>
                  </div>
               </div>

               <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                 {Object.keys(DISTRIBUTION).map((cat) => (
                   <div key={cat} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-500">
                         <span className={cat === Category.Savings ? 'text-amber-600 flex items-center' : ''}>
                           {/* @ts-ignore */}
                           {t.categories[cat] || cat}
                           {cat === Category.Savings && <TrendingUp size={12} className="ml-1" />}
                         </span>
                         <span className="text-emerald-700">{(DISTRIBUTION[cat as keyof typeof DISTRIBUTION] * 100).toFixed(0)}%</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={categoryBudgets[cat] || 0}
                          onChange={(e) => handleBudgetChange(cat, e.target.value)}
                          className={`w-full pl-3 pr-12 py-2.5 bg-stone-50 border rounded-lg font-bold text-stone-700 focus:bg-white focus:ring-2 transition-all outline-none ${
                             cat === Category.Savings 
                               ? 'border-amber-200 bg-amber-50/50 focus:border-amber-400 focus:ring-amber-200'
                               : 'border-stone-200 focus:border-emerald-400 focus:ring-emerald-200'
                          }`}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400 text-xs font-bold">
                          {currency}
                        </div>
                      </div>
                   </div>
                 ))}
               </div>

               <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-emerald-900/20 active:scale-[0.99] transition-all duration-200 mt-2"
              >
                {t.common.finish}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 text-stone-500 font-semibold text-sm hover:text-stone-700 transition-colors"
              >
                {t.common.back}
              </button>
             </div>
          )}
        </form>
      </div>
    </div>
  );
};