import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Coins, Wallet, AlertCircle } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const totalExpense = useMemo(() => 
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0)
  , [transactions]);

  const totalIncome = useMemo(() => 
    transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0)
  , [transactions]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      });
    
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const impulseData = useMemo(() => {
    // Average impulse score per day of the week
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const scores = new Array(7).fill(0);
    const counts = new Array(7).fill(0);

    transactions.forEach(t => {
      const date = new Date(t.date);
      const day = date.getDay();
      scores[day] += t.impulseScore;
      counts[day] += 1;
    });

    return days.map((day, index) => ({
      name: day,
      score: counts[index] ? (scores[index] / counts[index]).toFixed(1) : 0,
    }));
  }, [transactions]);

  const averageImpulseScore = useMemo(() => {
     if (transactions.length === 0) return 0;
     const sum = transactions.reduce((acc, curr) => acc + curr.impulseScore, 0);
     return (sum / transactions.length).toFixed(1);
  }, [transactions]);

  const getSpectrumColor = (score: number) => {
      if (score <= 3) return 'bg-green-500';
      if (score <= 7) return 'bg-yellow-500';
      return 'bg-red-500';
  };

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in pb-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">이번 달 금융 브리핑</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-full text-red-600">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">총 지출</p>
            <p className="text-xl font-bold text-gray-800">{totalExpense.toLocaleString()}원</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">총 수입</p>
            <p className="text-xl font-bold text-gray-800">{totalIncome.toLocaleString()}원</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">평균 충동 지수</p>
            <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-800">{averageImpulseScore} / 10</span>
                <div className={`w-3 h-3 rounded-full ${getSpectrumColor(Number(averageImpulseScore))}`}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">카테고리별 지출</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
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
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
             {categoryData.map((cat) => (
                 <div key={cat.name} className="flex items-center space-x-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name as keyof typeof CATEGORY_COLORS]}}></div>
                     <span className="text-gray-600 truncate">{cat.name}</span>
                 </div>
             ))}
          </div>
        </div>

        {/* Impulse Spectrum */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">소비 심리 스펙트럼 (요일별)</h3>
          <p className="text-xs text-gray-400 mb-4">1점(합리적) ~ 10점(충동적)</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impulseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {impulseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSpectrumColor(Number(entry.score)).replace('bg-', '').replace('-500', '') === 'green' ? '#22c55e' : getSpectrumColor(Number(entry.score)).replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};