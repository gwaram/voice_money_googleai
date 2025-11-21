import React from 'react';
import { Transaction } from '../types';
import { Mic, Plus } from 'lucide-react';

interface CalendarViewProps {
  transactions: Transaction[];
  onRecordClick: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ transactions, onRecordClick }) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const getTransactionsForDay = (day: number) => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const handleDayClick = (day: number) => {
    // Create date for the selected day
    // Use current time for 'today', otherwise default to noon to avoid timezone edge cases
    const selectedDate = new Date(year, month, day);
    if (day === today.getDate()) {
        selectedDate.setHours(today.getHours(), today.getMinutes(), today.getSeconds());
    } else {
        selectedDate.setHours(12, 0, 0, 0);
    }
    onRecordClick(selectedDate);
  };

  return (
    <div className="p-4 md:p-8 pb-24 animate-fade-in">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{year}년 {month + 1}월</h2>
          <button 
            onClick={() => onRecordClick(new Date())}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
              <Mic size={18} />
              <span>오늘 기록하기</span>
          </button>
       </div>

       <div className="grid grid-cols-7 gap-2 md:gap-4">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="text-center font-semibold text-gray-500 py-2">{day}</div>
          ))}
          
          {padding.map((_, i) => (
              <div key={`pad-${i}`} className="h-24 md:h-32 bg-transparent"></div>
          ))}

          {days.map(day => {
              const dailyTx = getTransactionsForDay(day);
              const expenseSum = dailyTx.filter(t => t.type === '지출').reduce((acc, t) => acc + t.amount, 0);
              const incomeSum = dailyTx.filter(t => t.type === '수입').reduce((acc, t) => acc + t.amount, 0);
              const isToday = day === today.getDate();

              return (
                  <div 
                    key={day} 
                    onClick={() => handleDayClick(day)}
                    className={`group relative bg-white rounded-xl border ${isToday ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100 hover:border-blue-300'} p-2 h-24 md:h-32 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer`}
                  >
                      <div className="flex justify-between items-start">
                          <span className={`text-sm font-medium ${isToday ? 'bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>{day}</span>
                          {dailyTx.length > 0 && (
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          )}
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-right z-10">
                          {incomeSum > 0 && <span className="text-blue-500">+{incomeSum.toLocaleString()}</span>}
                          {expenseSum > 0 && <span className="text-red-500">-{expenseSum.toLocaleString()}</span>}
                      </div>
                      {dailyTx.length > 0 ? (
                          <div className="mt-1 pt-1 border-t border-gray-50">
                              <div className="text-[10px] text-gray-400 truncate">
                                  {dailyTx[0].transcript.substring(0, 10)}...
                              </div>
                          </div>
                      ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <Plus className="text-blue-200" size={24} />
                          </div>
                      )}
                  </div>
              );
          })}
       </div>
    </div>
  );
};