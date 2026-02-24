import React, { useMemo } from 'react';
import { Transaction, UserSettings } from '../types';
import { List, Plus, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { translations } from '../utils/i18n';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface HistoryViewProps {
  transactions: Transaction[];
  settings: UserSettings;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions, settings }) => {
  const t = translations[settings.language];

  // Daily Activity Logic (Moved from Dashboard)
  const recentData = useMemo(() => {
     // Last 7 days
     const data: Record<string, number> = {};
     const today = new Date();
     for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const str = d.toISOString().split('T')[0];
        data[str.substring(5)] = 0; // MM-DD
     }
     
     transactions.forEach(tx => {
         if(tx.type === 'expense') {
            const dateStr = tx.date.substring(5, 10); // MM-DD
            if (data[dateStr] !== undefined) {
                data[dateStr] += tx.amount;
            }
         }
     });

     return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div className="space-y-6 pb-20">
       {/* Analysis Section */}
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <Calendar size={20} />
            </div>
            <h3 className="text-lg font-semibold text-emerald-900">{t.history.analysis}</h3>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={recentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#78716c'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#78716c'}} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{fill: '#fafaf9'}}
                   formatter={(value: number) => [`${value} ${settings.currency}`, t.dashboard.expenses]}
                   contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
       </div>

       {/* Transaction List */}
       <div className="space-y-4">
         <h3 className="text-lg font-semibold text-emerald-900 px-1">{t.history.title}</h3>
         {transactions.map(tx => (
           <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center hover:shadow-md transition-shadow animate-fade-in">
              <div className="flex items-center space-x-4">
                 <div className={`p-3 rounded-full ${tx.type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                    {tx.type === 'expense' ? <TrendingDown size={20}/> : <TrendingUp size={20}/>}
                 </div>
                 <div>
                    <p className="font-semibold text-emerald-950">{tx.description}</p>
                    <p className="text-xs text-stone-500">
                        {t.categories[tx.category]} • {tx.date}
                    </p>
                 </div>
              </div>
              <span className={`font-bold ${tx.type === 'expense' ? 'text-stone-800' : 'text-emerald-600'}`}>
                 {tx.type === 'expense' ? '-' : '+'}{tx.amount.toFixed(2)}
              </span>
           </div>
         ))}
         {transactions.length === 0 && (
           <div className="text-center py-20 text-stone-400">{t.history.noTransactions}</div>
         )}
       </div>
    </div>
  );
};