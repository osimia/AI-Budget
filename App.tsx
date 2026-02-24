import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { AIAdvisor } from './components/AIAdvisor';
import { SetupScreen } from './components/SetupScreen';
import { HistoryView } from './components/HistoryView';
import { StorageService } from './services/storageService';
import { FirebaseService } from './services/firebase';
import { Transaction, UserSettings } from './types';
import { translations } from './utils/i18n';
import { LayoutGrid, Plus, MessageSquareText, List, Settings, Crown, Wallet, LogOut } from 'lucide-react';

// Simple Navigation State
type View = 'dashboard' | 'transactions' | 'advisor' | 'premium';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  const t = translations[settings.language];

  // Initial Load
  useEffect(() => {
    const loadedTx = StorageService.getTransactions();
    setTransactions(loadedTx);
    
    // Check if user has configured the app (Guest name is default)
    if (settings.name !== 'Guest') {
      setIsSetupComplete(true);
    }

    // Listen to Firebase Auth state
    const unsubscribe = FirebaseService.onAuthStateChanged((user) => {
        if (user && isSetupComplete) {
            // If logged in, we could sync here
            // console.log("User logged in:", user.email);
        }
    });
    return () => unsubscribe();
  }, [isSetupComplete]);

  // Persistence
  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Date.now().toString()
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleSetupComplete = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
    setIsSetupComplete(true);
  };
  
  const handleLogout = async () => {
      await FirebaseService.signOut();
      // Optional: Reset state or just stay as is, depending on desired behavior
      // For now, we keep local state but user is signed out of cloud
      alert("Logged out of Google Account");
  };

  const NavButton = ({ view, icon: Icon, label }: { view: View; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center space-y-1 w-full py-2 transition-colors ${
        currentView === view ? 'text-emerald-800' : 'text-stone-400 hover:text-stone-600'
      }`}
    >
      <Icon size={24} strokeWidth={currentView === view ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  if (!isSetupComplete) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row max-w-7xl mx-auto shadow-2xl overflow-hidden">
      
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <aside className="hidden md:flex flex-col w-72 bg-emerald-950 text-stone-300 p-6 shadow-2xl z-20">
         <div className="flex items-center space-x-3 mb-10 text-white">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl shadow-lg shadow-amber-900/50 text-emerald-950">
                <Wallet size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Budget<span className="text-amber-400">AI</span></h1>
         </div>
         
         <nav className="flex-1 space-y-3">
            <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${currentView === 'dashboard' ? 'bg-emerald-900/50 text-amber-400 border border-emerald-800 shadow-inner' : 'hover:bg-emerald-900 hover:text-white'}`}>
               <LayoutGrid size={20} className={currentView === 'dashboard' ? 'text-amber-400' : 'text-stone-400 group-hover:text-white'} /> 
               <span className="font-medium">{t.nav.dashboard}</span>
            </button>
            <button onClick={() => setCurrentView('transactions')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${currentView === 'transactions' ? 'bg-emerald-900/50 text-amber-400 border border-emerald-800 shadow-inner' : 'hover:bg-emerald-900 hover:text-white'}`}>
               <List size={20} className={currentView === 'transactions' ? 'text-amber-400' : 'text-stone-400 group-hover:text-white'} /> 
               <span className="font-medium">{t.nav.history}</span>
            </button>
            <button onClick={() => setCurrentView('advisor')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${currentView === 'advisor' ? 'bg-emerald-900/50 text-amber-400 border border-emerald-800 shadow-inner' : 'hover:bg-emerald-900 hover:text-white'}`}>
               <MessageSquareText size={20} className={currentView === 'advisor' ? 'text-amber-400' : 'text-stone-400 group-hover:text-white'} /> 
               <span className="font-medium">{t.nav.advisor}</span>
            </button>
            <button onClick={() => setCurrentView('premium')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${currentView === 'premium' ? 'bg-amber-900/20 text-amber-400 border border-amber-900/50' : 'hover:bg-amber-900/10 hover:text-amber-300'}`}>
               <Crown size={20} className={currentView === 'premium' ? 'text-amber-400 fill-amber-400/20' : 'text-amber-600 group-hover:text-amber-400'} /> 
               <span className="font-medium">{t.nav.premium}</span>
            </button>
         </nav>

         <div className="pt-6 border-t border-emerald-900 space-y-3">
             <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-emerald-900/30 border border-emerald-800/50">
                 {settings.photoUrl ? (
                    <img src={settings.photoUrl} alt="User" className="w-10 h-10 rounded-full border border-amber-500/50 shadow-md" />
                 ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-emerald-950 font-bold shadow-md">
                        {settings.name.charAt(0)}
                    </div>
                 )}
                 <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-semibold text-stone-100 truncate">{settings.name}</p>
                    <p className="text-xs text-emerald-400/80">{settings.email || 'Basic Plan'}</p>
                 </div>
             </div>
             {settings.email && (
                 <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-xs text-emerald-400 hover:text-white py-2 hover:bg-emerald-900/50 rounded-lg transition-colors">
                    <LogOut size={14} />
                    <span>{t.nav.logout}</span>
                 </button>
             )}
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-stone-200 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
           <h1 className="font-bold text-lg text-emerald-950">
             {currentView === 'dashboard' && t.nav.dashboard}
             {currentView === 'transactions' && t.nav.history}
             {currentView === 'advisor' && t.nav.advisor}
             {currentView === 'premium' && t.nav.premium}
           </h1>
           <div className="flex items-center space-x-2">
               {settings.photoUrl && <img src={settings.photoUrl} className="w-8 h-8 rounded-full border border-stone-200" />}
               <button className="p-2 bg-stone-100 rounded-full text-stone-600">
                 <Settings size={20} />
               </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           {currentView === 'dashboard' && (
             <Dashboard transactions={transactions} settings={settings} />
           )}

           {currentView === 'transactions' && (
             <HistoryView transactions={transactions} settings={settings} />
           )}

           {currentView === 'advisor' && (
             <AIAdvisor transactions={transactions} settings={settings} />
           )}

           {currentView === 'premium' && (
             <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl shadow-amber-200 border-4 border-white">
                   <Crown size={48} className="text-white drop-shadow-md" />
                </div>
                <div>
                   <h2 className="text-3xl font-bold text-emerald-950">Upgrade to Gold</h2>
                   <p className="text-stone-500 mt-2 max-w-sm mx-auto">Unlock unlimited AI power, deep financial forecasting, and exclusive wealth reports.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xl w-full max-w-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                   <div className="text-4xl font-bold text-emerald-950 mb-1">$2.99<span className="text-base font-normal text-stone-400">/mo</span></div>
                   <button className="w-full py-4 bg-emerald-900 text-amber-400 rounded-xl font-bold mt-6 hover:bg-emerald-950 transition-colors shadow-lg shadow-emerald-900/20">
                      Start 7-Day Free Trial
                   </button>
                   <p className="text-xs text-stone-400 mt-4">Cancel anytime. Secure payment.</p>
                </div>
             </div>
           )}
        </div>

        {/* Floating Action Button (Mobile & Desktop) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-24 md:bottom-10 right-4 md:right-10 w-16 h-16 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-full shadow-2xl shadow-amber-500/40 flex items-center justify-center transition-transform hover:scale-105 z-40 border-4 border-white/20"
        >
          <Plus size={32} />
        </button>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden bg-white border-t border-stone-200 flex justify-between px-6 pb-6 pt-2 fixed bottom-0 left-0 right-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <NavButton view="dashboard" icon={LayoutGrid} label="Home" />
          <NavButton view="transactions" icon={List} label="History" />
          <div className="w-8"></div> {/* Spacer for FAB */}
          <NavButton view="advisor" icon={MessageSquareText} label="Advisor" />
          <NavButton view="premium" icon={Crown} label="Premium" />
        </div>
      </main>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionForm
          onAdd={handleAddTransaction}
          onClose={() => setIsModalOpen(false)}
          settings={settings}
        />
      )}
    </div>
  );
};

export default App;