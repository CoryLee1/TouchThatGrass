'use client';

import React, { useState, createContext, useContext } from 'react';
import { useTravelPlan } from '@/hooks/useTravelPlan';
import ChatBox from './components/ChatBox';
import GrassMap from './components/GrassMap';
import TabNavigation from './components/TabNavigation';
import type { AppState, TravelPlan, Message } from '@/types';

// ==================== Context Provider ====================
const TravelPlanContext = createContext<{
  state: AppState;
  updatePlan: (plan: TravelPlan) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  toggleGrassPoint: (pointId: string) => void;
  setLoading: (loading: boolean) => void;
} | null>(null);

function TravelPlanProvider({ children }: { children: React.ReactNode }) {
  const hookResult = useTravelPlan();
  return (
    <TravelPlanContext.Provider value={hookResult}>
      {children}
    </TravelPlanContext.Provider>
  );
}

// 导出Context供组件使用
export function useTravelPlanContext() {
  const context = useContext(TravelPlanContext);
  if (!context) throw new Error('useTravelPlanContext must be used within TravelPlanProvider');
  return context;
}

// ==================== 主页面 ====================
export default function TravelApp() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <TravelPlanProvider>
      <div className="h-screen flex flex-col bg-gray-100 max-w-md mx-auto">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chat' && <ChatBox />}
          {activeTab === 'map' && <GrassMap />}
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </TravelPlanProvider>
  );
}