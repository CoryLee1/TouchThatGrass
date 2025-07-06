import { createContext, useContext } from 'react';
import type { AppState, TravelPlan, Message } from '@/types';

export const TravelPlanContext = createContext<{
  state: AppState;
  updatePlan: (plan: TravelPlan) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  toggleGrassPoint: (pointId: string) => void;
  setLoading: (loading: boolean) => void;
} | null>(null);

export function useTravelPlanContext() {
  const context = useContext(TravelPlanContext);
  if (!context) throw new Error('useTravelPlanContext must be used within TravelPlanProvider');
  return context;
} 