import { createContext, useContext } from 'react';
import type { AppState, TravelPlan, Message, GrassPoint } from '@/types';

export const TravelPlanContext = createContext<{
  state: AppState;
  updatePlan: (plan: TravelPlan) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  toggleGrassPoint: (pointId: string) => void;
  setLoading: (loading: boolean) => void;
  reorderGrassPoints: (newOrder: GrassPoint[]) => void;
  updateGrassPointTime: (pointId: string, newTime: string) => void;
  updateGrassPointStatus: (pointId: string, status: 'liked' | 'disliked' | 'none') => void;
  updateGrassPointPhoto: (pointId: string, photoUrl: string) => void;
  updateGrassPointComment: (pointId: string, comment: { text: string; user?: string; time?: string }) => void;
  updateGrassPointGrassStatus: (pointId: string, grassStatus: 'none' | 'planted' | 'removed') => void;
} | null>(null);

export function useTravelPlanContext() {
  const context = useContext(TravelPlanContext);
  if (!context) throw new Error('useTravelPlanContext must be used within TravelPlanProvider');
  return context;
} 