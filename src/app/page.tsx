// src/app/page.tsx (更新版本)
'use client';

import React, { useState } from 'react';
import { useTravelPlan } from '@/hooks/useTravelPlan';
import { TravelPlanContext } from '@/hooks/useTravelPlanContext';
import ChatBox from './components/ChatBox';
import GrassMap from './components/GrassMap';
import TabNavigation from './components/TabNavigation';
import LocationDetector from './components/LocationDetector';
import RouteListPanel from './components/RouteListPanel';
import { MainPage } from './components/MainPage/MainPage';

// ==================== Context Provider ====================
function TravelPlanProvider({ children }: { children: React.ReactNode }) {
  const hookResult = useTravelPlan();
  return (
    <TravelPlanContext.Provider value={hookResult}>
      {children}
    </TravelPlanContext.Provider>
  );
}

// ==================== 主应用组件 ====================
function TravelAppContent() {
  const [activeTab, setActiveTab] = useState('chat');
  const { state, toggleGrassPoint, reorderGrassPoints, updateGrassPointTime, updateGrassPointStatus, updateGrassPointPhoto, updateGrassPointComment } = React.useContext(TravelPlanContext)!;
  const grassPoints = state.currentPlan ? state.currentPlan.grassPoints : [];
  return (
    <div className="h-[100dvh] flex flex-col bg-gray-100 max-w-md mx-auto">
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' && <ChatBox />}
        {activeTab === 'map' && <GrassMap />}
        {activeTab === 'routeList' && (
          <RouteListPanel
            grassPoints={grassPoints}
            onToggleComplete={toggleGrassPoint}
            onReorder={reorderGrassPoints}
            onTimeChange={updateGrassPointTime}
            onStatusChange={updateGrassPointStatus}
            onPhoto={updateGrassPointPhoto}
            onCommentChange={updateGrassPointComment}
          />
        )}
      </div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

// ==================== 主页面 ====================
export default function App() {
  const [started, setStarted] = useState(false);
  return (
    <TravelPlanProvider>
      <LocationDetector>
        {!started ? (
          <MainPage onStart={() => setStarted(true)} />
        ) : (
          <TravelAppContent />
        )}
      </LocationDetector>
    </TravelPlanProvider>
  );
}