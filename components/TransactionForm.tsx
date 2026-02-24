import React, { useState, useRef } from 'react';
import { Camera, Mic, Type, X, Loader2, AlertCircle, ChevronDown, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { Category, Transaction, UserSettings, Currency } from '../types';
import { GeminiService } from '../services/geminiService';
import { translations } from '../utils/i18n';

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  settings: UserSettings;
}

type InputMode = 'manual' | 'voice' | 'scan';

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, settings }) => {
  const [mode, setMode] = useState<InputMode>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = translations[settings.language];

  // Transaction State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.Food);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  
  // Currency Logic
  const [selectedCurrency, setSelectedCurrency] = useState<string>(settings.currency);
  const [exchangeRate, setExchangeRate] = useState<string>('');

  // Voice State
  const [isListening, setIsListening] = useState(false);
  
  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    // Automatically switch category based on type
    if (newType === 'income') {
      setCategory(Category.Income);
    } else {
      setCategory(Category.Food);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    let finalAmount = parseFloat(amount);
    let finalDescription = description;

    // Convert currency if needed
    if (selectedCurrency !== settings.currency && exchangeRate) {
        const rate = parseFloat(exchangeRate);
        if (!isNaN(rate) && rate > 0) {
            finalAmount = finalAmount * rate;
            finalDescription = `${description} (Exch: ${amount} ${selectedCurrency} @ ${rate})`;
        }
    }

    onAdd({
      amount: finalAmount,
      description: finalDescription,
      category,
      date,
      type
    });
    onClose();
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = settings.language === 'ru' ? 'ru-RU' : 'en-US'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => setIsListening(false);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setIsLoading(true);
      try {
        const result = await GeminiService.parseVoiceCommand(text);
        if (result) {
          setAmount(result.amount.toString());
          setDescription(result.description);
          const foundCat = Object.values(Category).find(c => c.toLowerCase() === result.category.toLowerCase());
          if (foundCat) setCategory(foundCat);
          setMode('manual');
        }
      } catch (err) {
        setError("Failed to process voice command.");
      } finally {
        setIsLoading(false);
      }
    };

    recognition.start();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; 

      try {
        const result = await GeminiService.parseReceipt(base64Data);
        if (result) {
          setAmount(result.amount.toString());
          setDescription(result.description);
          if (result.date) setDate(result.date);
          
          const foundCat = Object.values(Category).find(c => c.toLowerCase() === result.category.toLowerCase());
          if (foundCat) setCategory(foundCat);
          
          if (result.currency) {
            setSelectedCurrency(result.currency);
            // Optional: reset rate if currency changes
            if (result.currency === settings.currency) setExchangeRate('');
          }

          setMode('manual');
        } else {
            setError("Could not read receipt data.");
        }
      } catch (err) {
        setError("Failed to analyze receipt.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const calculatedTotal = selectedCurrency !== settings.currency && exchangeRate && amount 
    ? (parseFloat(amount) * parseFloat(exchangeRate)).toFixed(2)
    : null;

  // Filter categories based on selected type
  const availableCategories = type === 'income' 
    ? [Category.Income]
    : Object.values(Category).filter(c => c !== Category.Income);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up transform transition-all border border-stone-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-stone-100 bg-white">
          <div className="flex items-center space-x-2">
             <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Sparkles size={16} />
             </div>
             <h2 className="text-xl font-bold text-emerald-950 tracking-tight">{t.form.newTx}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 bg-white">
          <div className="flex p-1.5 bg-stone-100 rounded-xl gap-1">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                mode === 'manual' 
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-stone-500 hover:bg-stone-200/50 hover:text-stone-700'
              }`}
            >
              <Type size={16} strokeWidth={2.5} /> <span>{t.form.manual}</span>
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                mode === 'voice' 
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-stone-500 hover:bg-stone-200/50 hover:text-stone-700'
              }`}
            >
              <Mic size={16} strokeWidth={2.5} /> <span>{t.form.voice}</span>
            </button>
            <button
              onClick={() => setMode('scan')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 ${
                mode === 'scan' 
                  ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-black/5' 
                  : 'text-stone-500 hover:bg-stone-200/50 hover:text-stone-700'
              }`}
            >
              <Camera size={16} strokeWidth={2.5} /> <span>{t.form.scan}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8 pt-2 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-5 animate-pulse">
              <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100">
                <Loader2 className="animate-spin text-emerald-600" size={40} />
              </div>
              <div className="text-center space-y-1">
                <p className="text-emerald-950 font-medium text-lg">{t.form.processing}</p>
                <p className="text-emerald-600/70 text-sm">AI is extracting details</p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-start shadow-sm">
                   <AlertCircle className="shrink-0 w-5 h-5 mt-0.5 mr-3" />
                   {error}
                </div>
              )}

              {mode === 'manual' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {selectedCurrency !== settings.currency && (
                     <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs flex items-center">
                        <Sparkles size={14} className="mr-2 text-amber-500"/>
                        {t.form.detected}: <strong className="ml-1">{selectedCurrency}</strong>.
                     </div>
                  )}

                  {/* Type Toggle */}
                  <div className="flex bg-stone-100 p-1 rounded-xl">
                    <button 
                      type="button" 
                      onClick={() => handleTypeChange('expense')} 
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                        type === 'expense' 
                          ? 'bg-white text-red-600 shadow-sm ring-1 ring-black/5' 
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {t.form.typeExpense}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleTypeChange('income')} 
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                        type === 'income' 
                          ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-black/5' 
                          : 'text-stone-500 hover:text-stone-700'
                      }`}
                    >
                      {t.form.typeIncome}
                    </button>
                  </div>

                  {/* Amount & Currency Grid */}
                  <div className="grid grid-cols-3 gap-3">
                     <div className="col-span-2 space-y-2">
                        <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider ml-1">{t.form.amount}</label>
                        <div className="relative group">
                          <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full pl-4 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-xl text-3xl font-bold text-emerald-950 placeholder-stone-300 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all duration-200 outline-none"
                            placeholder="0.00"
                            required
                            autoFocus
                          />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider ml-1">{t.setup.currency}</label>
                        <div className="relative h-[72px]">
                          <select
                             value={selectedCurrency}
                             onChange={(e) => setSelectedCurrency(e.target.value)}
                             className="w-full h-full px-2 bg-stone-50 border border-stone-200 rounded-xl text-lg font-bold text-stone-700 focus:bg-white focus:border-amber-400 outline-none appearance-none text-center"
                          >
                             {Object.values(Currency).map(c => <option key={c} value={c}>{c}</option>)}
                             {!Object.values(Currency).includes(selectedCurrency as Currency) && (
                                <option value={selectedCurrency}>{selectedCurrency}</option>
                             )}
                          </select>
                           <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-stone-400">
                             <ChevronDown size={14} />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Exchange Rate Input (Conditional) */}
                  {selectedCurrency !== settings.currency && (
                     <div className="animate-fade-in-down bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-4">
                        <div className="space-y-2">
                           <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">{t.form.exchRate}</label>
                           <div className="flex items-center space-x-3">
                              <span className="text-sm font-semibold text-stone-500">1 {selectedCurrency} = </span>
                              <input
                                type="number"
                                step="0.01"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value)}
                                className="flex-1 px-4 py-2 bg-white border border-stone-300 rounded-lg text-lg font-bold text-emerald-900 focus:border-amber-400 outline-none"
                                placeholder="e.g. 11.20"
                                required
                              />
                              <span className="text-sm font-semibold text-stone-500">{settings.currency}</span>
                           </div>
                        </div>
                        {calculatedTotal && (
                           <div className="flex justify-between items-center pt-2 border-t border-stone-200">
                              <span className="text-sm text-stone-500">Converted Total:</span>
                              <span className="text-xl font-bold text-emerald-700">{calculatedTotal} {settings.currency}</span>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Description Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider ml-1">{t.form.description}</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-base font-medium text-stone-800 placeholder-stone-400 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all duration-200 outline-none"
                      placeholder="e.g. Starbucks"
                      required
                    />
                  </div>

                  {/* Category & Date Grid */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider ml-1">{t.form.category}</label>
                      <div className="relative">
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as Category)}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 appearance-none focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all duration-200 outline-none"
                        >
                          {availableCategories.map((c) => (
                            // @ts-ignore
                            <option key={c} value={c}>{t.categories[c] || c}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400">
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-amber-600 uppercase tracking-wider ml-1">{t.form.date}</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-800 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all duration-200 outline-none appearance-none"
                        />
                         <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-stone-400 md:hidden">
                           <Calendar size={18} />
                         </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-200 active:scale-[0.99] transition-all duration-200 mt-4 flex items-center justify-center space-x-2"
                  >
                    <span>{t.form.saveTx}</span>
                  </button>
                </form>
              )}

              {mode === 'voice' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-8">
                  <button
                    onClick={handleVoiceInput}
                    className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-50 text-red-500 ring-8 ring-red-100 animate-pulse' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 shadow-xl shadow-emerald-100'
                    }`}
                  >
                    <Mic size={48} strokeWidth={1.5} />
                  </button>
                  <div className="text-center space-y-3 max-w-xs">
                    <p className="font-semibold text-emerald-950">{t.form.tapToSpeak}</p>
                    <p className="text-stone-500 text-sm leading-relaxed">
                       {settings.language === 'en' ? 'Try: "Lunch at Cafe for 50 TJS"' : 'Скажи: "Обед в кафе 50 сомони"'}
                    </p>
                  </div>
                </div>
              )}

              {mode === 'scan' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-stone-300 rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 group"
                   >
                      <div className="p-4 bg-stone-100 rounded-full mb-3 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors text-stone-400">
                        <Camera size={32} />
                      </div>
                      <span className="text-stone-600 font-semibold group-hover:text-emerald-700">{t.form.tapToScan}</span>
                      <span className="text-xs text-stone-400 mt-1">Supports JPG, PNG</span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        capture="environment" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                   </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};