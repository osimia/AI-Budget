import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, Category, UserSettings } from '../types';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, Sparkles, Target, PiggyBank } from 'lucide-react';
import { translations } from '../utils/i18n';

interface DashboardProps {
  transactions: Transaction[];
  settings: UserSettings;
}

// Green and Gold Palette
const COLORS = ['#059669', '#d97706', '#10b981', '#f59e0b', '#047857', '#fbbf24', '#34d399', '#b45309'];

export const Dashboard: React.FC<DashboardProps> = ({ transactions, settings }) => {
  const t = translations[settings.language];

  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    // Separate Savings from other expenses for clearer view
    const savings = transactions
      .filter(t => t.type === 'expense' && t.category === Category.Savings)
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense' && t.category !== Category.Savings)
      .reduce((acc, t) => acc + t.amount, 0);

    // Balance is Income - (Real Expenses + Savings Outflow)
    const balance = income - (expenses + savings);
    
    return { income, expenses, savings, balance };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        data[t.category] = (data[t.category] || 0) + t.amount;
      });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const budgetPerformance = useMemo(() => {
    const perf = [];
    // Use categories from settings or fallback to Transaction Categories
    const categoriesToCheck = Object.keys(settings.categoryBudgets || {});
    if (categoriesToCheck.length === 0) {
       // Fallback if no specific budgets set
       Object.values(Category).forEach(c => {
         if(c !== Category.Income) categoriesToCheck.push(c);
       });
    }

    for (const cat of categoriesToCheck) {
      if (cat === Category.Income) continue;
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0);
      const limit = settings.categoryBudgets?.[cat] || 0;
      perf.push({ category: cat, spent, limit });
    }
    // Sort: Savings first, then by utilization
    return perf.sort((a, b) => {
        if (a.category === Category.Savings) return -1;
        if (b.category === Category.Savings) return 1;
        return (b.spent / (b.limit || 1)) - (a.spent / (a.limit || 1));
    });
  }, [transactions, settings]);

  return (
    <div className="space-y-6 pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Balance Card - Rich Emerald & Gold */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20 border border-emerald-700 col-span-1 md:col-span-2">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={100} className="text-amber-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-800/50 rounded-lg border border-emerald-600/50 text-amber-400"><Wallet size={20} /></div>
              <span className="text-emerald-100 font-medium tracking-wide">{t.dashboard.availableBalance}</span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight">
              {summary.balance.toFixed(2)} <span className="text-amber-400">{settings.currency}</span>
            </div>
            <div className="mt-4 text-sm text-emerald-200/80 flex items-center">
               <div className="w-2 h-2 rounded-full bg-amber-400 mr-2"></div>
               Budget: {settings.monthlyBudget} {settings.currency}
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-amber-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white text-amber-600 rounded-lg shadow-sm"><PiggyBank size={20} /></div>
            <span className="text-amber-800 font-medium">{t.dashboard.savings}</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{summary.savings.toFixed(2)} {settings.currency}</div>
          <p className="text-xs text-amber-700/60 mt-2">Good job! Keep growing.</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-stone-50 text-stone-600 rounded-lg"><TrendingDown size={20} /></div>
            <span className="text-stone-500 font-medium">{t.dashboard.expenses}</span>
          </div>
          <div className="text-2xl font-bold text-stone-800">{summary.expenses.toFixed(2)} {settings.currency}</div>
          <div className="text-xs text-emerald-600 mt-2 flex items-center">
            <TrendingUp size={12} className="mr-1"/> {t.dashboard.income}: {summary.income.toFixed(0)}
          </div>
        </div>
      </div>

      {/* AI Insight Widget */}
      {(summary.expenses + summary.savings) > settings.monthlyBudget * 0.9 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-amber-900">{t.dashboard.budgetAlert}</h4>
            <p className="text-sm text-amber-800/80 mt-1">
              You have used {(((summary.expenses + summary.savings) / settings.monthlyBudget) * 100).toFixed(0)}% of your monthly budget. 
              {summary.savings > 0 ? " Great job on the savings, though!" : " Consider reducing dining out this week."}
            </p>
          </div>
        </div>
      )}

      {/* Budget vs Actual (Fact) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center space-x-2 mb-6">
           <div className="p-2 bg-stone-100 rounded-lg text-emerald-800">
             <Target size={20} />
           </div>
           <h3 className="text-lg font-semibold text-emerald-900">{t.dashboard.planVsFact}</h3>
        </div>
        
        <div className="space-y-5">
           {budgetPerformance.map((item) => {
             const isSavings = item.category === Category.Savings;
             const percentage = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;
             
             // Color Logic:
             // For Savings: High percentage is GOOD (Green/Gold).
             // For Expenses: High percentage is BAD (Red/Orange).
             let barColor = 'bg-emerald-500';
             let labelColor = 'text-emerald-700';

             if (isSavings) {
                // Savings Logic
                if (percentage < 50) { barColor = 'bg-stone-300'; labelColor = 'text-stone-500'; } // Haven't saved enough
                else if (percentage < 100) { barColor = 'bg-amber-400'; labelColor = 'text-amber-600'; } // Getting there
                else { barColor = 'bg-emerald-500'; labelColor = 'text-emerald-700'; } // Goal met!
             } else {
                // Expense Logic
                if (percentage > 80) { barColor = 'bg-amber-500'; labelColor = 'text-amber-600'; }
                if (percentage > 100) { barColor = 'bg-red-500'; labelColor = 'text-red-600'; }
             }

             return (
               <div key={item.category}>
                 <div className="flex justify-between text-sm font-medium mb-1.5">
                    <span className={`flex items-center ${isSavings ? 'text-amber-700 font-bold' : 'text-stone-700'}`}>
                        {/* @ts-ignore */}
                        {t.categories[item.category] || item.category}
                        {isSavings && <Sparkles size={12} className="ml-1 text-amber-500" />}
                    </span>
                    <span className="text-stone-500">
                       <span className={`${labelColor} font-bold`}>
                         {item.spent.toFixed(0)}
                       </span> 
                       {' / '} 
                       {item.limit} {settings.currency}
                    </span>
                 </div>
                 <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                 </div>
               </div>
             );
           })}
           {budgetPerformance.length === 0 && (
              <p className="text-stone-400 text-sm text-center italic">No budgets configured.</p>
           )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-semibold text-emerald-900 mb-6">{t.dashboard.spendingMix}</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === Category.Savings ? '#f59e0b' : COLORS[index % COLORS.length]} 
                        stroke={entry.name === Category.Savings ? '#b45309' : undefined}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `${value} ${settings.currency}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
             {categoryData.map((entry, index) => (
               <div key={entry.name} className="flex items-center text-xs text-stone-500 font-medium">
                 <span 
                    className="w-2.5 h-2.5 rounded-full mr-1.5" 
                    style={{ backgroundColor: entry.name === Category.Savings ? '#f59e0b' : COLORS[index % COLORS.length] }}
                 ></span>
                 {/* @ts-ignore */}
                 {t.categories[entry.name] || entry.name}
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};