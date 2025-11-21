import React, { useState, useEffect } from 'react';
import { Transaction, ViewState } from './types';
import { Dashboard } from './components/Dashboard';
import { VoiceInput } from './components/VoiceInput';
import { TransactionList } from './components/TransactionList';
import { CalendarView } from './components/CalendarView';
import { LayoutDashboard, Mic, List, Settings, Sparkles } from 'lucide-react';

// Initialize state from local storage if available (mock persistence)
const loadTransactions = (): Transaction[] => {
    const stored = localStorage.getItem('voice_money_transactions');
    return stored ? JSON.parse(stored) : [];
};

const App = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [recordingDate, setRecordingDate] = useState<Date>(new Date());

  useEffect(() => {
    localStorage.setItem('voice_money_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleNewTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    setView('list'); // Auto switch to list to verify
  };

  const handleUpdateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'voice':
        return (
          <CalendarView 
            transactions={transactions} 
            onRecordClick={(date) => {
              setRecordingDate(date);
              setView('voice-record' as any);
            }} 
          />
        );
      case 'list':
        return <TransactionList transactions={transactions} onUpdateTransaction={handleUpdateTransaction} />;
      case 'settings':
        return (
            <div className="flex items-center justify-center h-full text-gray-400 flex-col gap-4">
                <Settings size={48} />
                <p>설정 페이지는 준비 중입니다.</p>
                <div className="text-sm bg-gray-200 p-4 rounded-lg max-w-md">
                    <p className="font-bold text-gray-600 mb-2">데이터 초기화</p>
                    <button onClick={() => {localStorage.clear(); window.location.reload()}} className="text-red-500 hover:underline">모든 데이터 삭제</button>
                </div>
            </div>
        );
      default:
        // Special case for direct recording view
        return (
          <VoiceInput 
            onTransactionCreated={handleNewTransaction} 
            initialDate={recordingDate}
            onCancel={() => setView('voice')}
          />
        );
    }
  };

  // Hack to handle the 'voice-record' internal state which isn't in the tab menu
  const isRecordingView = view === ('voice-record' as any);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <Sparkles size={24} />
              <span>VoiceMoney</span>
          </div>
      </div>

      {/* Sidebar / Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 md:relative md:w-64 md:h-screen md:border-t-0 md:border-r md:flex md:flex-col md:justify-between z-40">
        <div className="hidden md:flex items-center gap-2 p-6 font-bold text-2xl text-indigo-600">
            <Sparkles size={28} />
            <span>VoiceMoney</span>
        </div>
        
        <div className="flex md:flex-col justify-around md:justify-start md:px-4 md:gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`p-4 md:py-3 md:px-4 rounded-xl flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-all ${view === 'dashboard' ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <LayoutDashboard size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2}/>
            <span className="text-[10px] md:text-base">대시보드</span>
          </button>

          <button 
            onClick={() => setView('voice')}
            className={`p-4 md:py-3 md:px-4 rounded-xl flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-all ${view === 'voice' || isRecordingView ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Mic size={24} strokeWidth={view === 'voice' || isRecordingView ? 2.5 : 2}/>
            <span className="text-[10px] md:text-base">음성 기록</span>
          </button>

          <button 
            onClick={() => setView('list')}
            className={`p-4 md:py-3 md:px-4 rounded-xl flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-all ${view === 'list' ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <List size={24} strokeWidth={view === 'list' ? 2.5 : 2}/>
            <span className="text-[10px] md:text-base">지출 목록</span>
          </button>

          <button 
            onClick={() => setView('settings')}
            className={`p-4 md:py-3 md:px-4 rounded-xl flex flex-col md:flex-row items-center gap-1 md:gap-3 transition-all ${view === 'settings' ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Settings size={24} strokeWidth={view === 'settings' ? 2.5 : 2}/>
            <span className="text-[10px] md:text-base">설정</span>
          </button>
        </div>

        <div className="hidden md:block p-6 text-xs text-gray-400">
            AI Powered Expense Tracker <br/> © 2025 VoiceMoney
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] md:h-screen pb-20 md:pb-0">
          {isRecordingView ? (
            <VoiceInput 
              onTransactionCreated={handleNewTransaction} 
              initialDate={recordingDate}
              onCancel={() => setView('voice')}
            /> 
          ) : renderContent()}
      </main>
    </div>
  );
};

export default App;