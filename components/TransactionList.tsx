import React, { useState } from 'react';
import { Transaction, Category } from '../types';
import { Edit2, Check, X, PlayCircle, FileText } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdateTransaction: (updated: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onUpdateTransaction }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const handleEditClick = (t: Transaction) => {
    setEditingId(t.id);
    setEditForm(t);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = () => {
    if (editingId && editForm) {
      // Merge changes
      const original = transactions.find(t => t.id === editingId);
      if (original) {
        onUpdateTransaction({
          ...original,
          ...editForm,
          isModified: true,
        });
      }
      setEditingId(null);
      setEditForm({});
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 max-w-6xl mx-auto animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">지출/수입 내역</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold">날짜/시간</th>
                <th className="p-4 font-semibold">구분</th>
                <th className="p-4 font-semibold">카테고리</th>
                <th className="p-4 font-semibold">내용 (상호명)</th>
                <th className="p-4 font-semibold text-right">금액</th>
                <th className="p-4 font-semibold text-center">분석</th>
                <th className="p-4 font-semibold text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 && (
                  <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">아직 기록된 내역이 없습니다.</td>
                  </tr>
              )}
              {transactions.map((t) => {
                const isEditing = editingId === t.id;

                return (
                  <tr key={t.id} className={`hover:bg-gray-50 transition-colors ${t.isModified ? 'bg-yellow-50' : ''}`}>
                    <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString()} <br/>
                      {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    
                    <td className="p-4">
                         <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${t.type === '수입' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                           {t.type}
                         </span>
                    </td>

                    <td className="p-4">
                      {isEditing ? (
                        <select 
                          className="border rounded p-1 text-sm w-full"
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value as Category})}
                        >
                          {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS[t.category]}}></div>
                           <span className="text-sm text-gray-700">{t.category}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                       {isEditing ? (
                           <input 
                             type="text" 
                             className="border rounded p-1 text-sm w-full mb-1"
                             value={editForm.merchant}
                             onChange={(e) => setEditForm({...editForm, merchant: e.target.value})}
                             placeholder="상호명"
                           />
                       ) : (
                           <div>
                               <p className="font-medium text-gray-800">{t.merchant}</p>
                               <p className="text-xs text-gray-400">{t.subcategory}</p>
                           </div>
                       )}
                    </td>

                    <td className="p-4 text-right">
                        {isEditing ? (
                            <input 
                              type="number" 
                              className="border rounded p-1 text-sm w-full text-right"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({...editForm, amount: Number(e.target.value)})}
                            />
                        ) : (
                            <span className="font-bold text-gray-800">{t.amount.toLocaleString()}원</span>
                        )}
                    </td>

                    <td className="p-4">
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span className={`w-2 h-2 rounded-full ${t.impulseScore > 7 ? 'bg-red-500' : t.impulseScore > 3 ? 'bg-yellow-400' : 'bg-green-500'}`}></span>
                                <span>심리: {t.emotion} ({t.impulseScore}점)</span>
                            </div>
                            <details className="text-xs text-gray-400 cursor-pointer relative group">
                                <summary className="list-none flex items-center gap-1 hover:text-blue-500">
                                    <FileText size={12}/> 전사문 보기
                                </summary>
                                <div className="absolute z-10 bg-white border p-3 rounded shadow-lg w-64 -left-20 top-6 hidden group-open:block">
                                    <p className="mb-2 italic">"{t.transcript}"</p>
                                    <hr className="my-1"/>
                                    <p className="font-semibold text-gray-600">이유:</p>
                                    <p>{t.reason}</p>
                                    <p className="font-semibold text-gray-600 mt-1">일기:</p>
                                    <p>{t.diary}</p>
                                </div>
                            </details>
                            {t.audioUrl && (
                                <a href={t.audioUrl} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-blue-500 hover:underline">
                                   <PlayCircle size={12} /> 원본 듣기
                                </a>
                            )}
                        </div>
                    </td>

                    <td className="p-4 text-center">
                        {isEditing ? (
                            <div className="flex justify-center gap-2">
                                <button onClick={handleSaveEdit} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"><Check size={16}/></button>
                                <button onClick={handleCancelEdit} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><X size={16}/></button>
                            </div>
                        ) : (
                             <button onClick={() => handleEditClick(t)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                 <Edit2 size={16} />
                             </button>
                        )}
                        {t.isModified && !isEditing && <div className="text-[10px] text-yellow-600 mt-1 font-medium">수정됨</div>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};