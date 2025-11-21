export enum TransactionType {
  EXPENSE = '지출',
  INCOME = '수입',
}

export enum Category {
  FOOD = '식비',
  BUSINESS = '사업 비용',
  TRANSPORT = '교통/차량',
  FIXED = '고정비',
  LIVING = '생활/쇼핑',
  LEISURE = '여가/외식',
  HEALTH = '건강/의료',
  RELATIONSHIP = '교회/교제/경조사',
  LOAN = '대출 관련',
  UNCATEGORIZED = '미분류'
}

export interface GemniAnalysisResult {
  type: TransactionType;
  amount: number;
  merchant: string;
  method: string;
  category: Category;
  subcategory?: string; // e.g., coffee, taxi based on the description
  reason: string; // The "excuse" or reason
  emotion: string; // Voice tone/sentiment
  diary: string; // Daily diary entry
  transcript: string; // The transcription
  impulseScore: number; // 1 (Necessary) to 10 (Impulsive)
}

export interface Transaction extends GemniAnalysisResult {
  id: string;
  date: string; // ISO string
  audioUrl?: string; // Blob URL for the session
  isModified: boolean;
}

export type ViewState = 'dashboard' | 'voice' | 'list' | 'settings';