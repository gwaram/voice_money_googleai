import { Category } from './types';

export const CATEGORY_DESCRIPTIONS: Record<Category, string[]> = {
  [Category.FOOD]: ['삼끼식사', '홈메이드 간식', '원두'],
  [Category.BUSINESS]: ['사업 관련 지출'],
  [Category.TRANSPORT]: ['유류비', '차량보험', '정비비', '교통비', '주차료', '톨비'],
  [Category.FIXED]: ['관리비', '통신비', '구독료'],
  [Category.LIVING]: ['소모품', '옷', '미용', '인테리어', '제품'],
  [Category.LEISURE]: ['군것질', '외식', '카페', '여행', '입장료'],
  [Category.HEALTH]: ['병원', '약', '비타민'],
  [Category.RELATIONSHIP]: ['현금', '십일조', '집초대(식사)', '동반카페', '부모님용돈', '축의', '부의', '선물'],
  [Category.LOAN]: ['이자+원금'],
  [Category.UNCATEGORIZED]: ['기타']
};

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#FF6B6B',
  [Category.BUSINESS]: '#4D96FF',
  [Category.TRANSPORT]: '#FFD93D',
  [Category.FIXED]: '#6BCB77',
  [Category.LIVING]: '#A66CFF',
  [Category.LEISURE]: '#FF9F1C',
  [Category.HEALTH]: '#FF6392',
  [Category.RELATIONSHIP]: '#2EC4B6',
  [Category.LOAN]: '#5D6D7E',
  [Category.UNCATEGORIZED]: '#95A5A6'
};