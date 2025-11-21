import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Send, RotateCcw, Play, Pause, Calendar, ChevronLeft } from 'lucide-react';
import { analyzeAudioLog } from '../services/geminiService';
import { Transaction } from '../types';

// Simple ID generator to avoid external dependency for this snippet
const generateId = () => Math.random().toString(36).substr(2, 9);

interface VoiceInputProps {
  onTransactionCreated: (transaction: Transaction) => void;
  initialDate?: Date;
  onCancel?: () => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTransactionCreated, initialDate, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const targetDate = initialDate || new Date();
  const dateDisplay = targetDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
    if (!audioBlob) return;
    
    setIsProcessing(true);
    try {
      const result = await analyzeAudioLog(audioBlob);
      const newTransaction: Transaction = {
        ...result,
        id: generateId(),
        date: targetDate.toISOString(), // Use the selected date
        audioUrl: audioUrl || undefined,
        isModified: false,
      };
      onTransactionCreated(newTransaction);
      // Reset after success
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("분석에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const togglePlayback = () => {
      if (audioRef.current) {
          if (isPlaying) {
              audioRef.current.pause();
          } else {
              audioRef.current.play();
          }
          setIsPlaying(!isPlaying);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] p-6 animate-fade-in relative">
      {onCancel && (
        <button 
          onClick={onCancel}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center gap-1"
        >
          <ChevronLeft size={20} />
          <span>달력으로</span>
        </button>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-50"></div>

        {/* Date Indicator */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
           <Calendar size={16} />
           {dateDisplay}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">음성 지출 기록</h2>
        <p className="text-gray-500 mb-8">이 날 무엇을 소비하셨나요? 편하게 말씀해주세요.</p>

        <div className="relative mb-8 flex justify-center">
          {!audioBlob ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 shadow-[0_0_0_12px_rgba(239,68,68,0.3)] animate-pulse' 
                  : 'bg-gradient-to-tr from-blue-500 to-purple-600 shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              {isRecording ? (
                <Square className="text-white" size={32} fill="currentColor" />
              ) : (
                <Mic className="text-white" size={32} />
              )}
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4">
                <div className="bg-gray-100 rounded-full p-6 mb-2">
                    <button onClick={togglePlayback} className="focus:outline-none">
                        {isPlaying ? <Pause size={32} className="text-gray-700"/> : <Play size={32} className="text-gray-700 ml-1"/>}
                    </button>
                </div>
                <audio 
                    ref={audioRef} 
                    src={audioUrl || ''} 
                    onEnded={() => setIsPlaying(false)} 
                    className="hidden" 
                />
                <div className="flex gap-4">
                     <button
                        onClick={handleReset}
                        className="p-3 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                        title="다시 녹음"
                      >
                        <RotateCcw size={20} />
                      </button>
                      <button
                        onClick={handleAnalyze}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors shadow-md disabled:opacity-70"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            분석 중...
                          </>
                        ) : (
                          <>
                            <Send size={20} />
                            기록하기
                          </>
                        )}
                      </button>
                </div>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-400 h-6">
          {isRecording ? "녹음 중입니다..." : audioBlob ? "녹음 완료! 내용을 분석할까요?" : "버튼을 눌러 녹음을 시작하세요"}
        </div>
      </div>
    </div>
  );
};