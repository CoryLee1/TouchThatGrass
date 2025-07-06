'use client';

import React, { useState } from 'react';
import { useTravelPlan } from '@/hooks/useTravelPlan';
import { TravelPlanContext } from '@/hooks/useTravelPlanContext';
import ChatBox from './components/ChatBox';
import GrassMap from './components/GrassMap';
import TabNavigation from './components/TabNavigation';

// ==================== Context Provider ====================
function TravelPlanProvider({ children }: { children: React.ReactNode }) {
  const hookResult = useTravelPlan();
  return (
    <TravelPlanContext.Provider value={hookResult}>
      {children}
    </TravelPlanContext.Provider>
  );
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