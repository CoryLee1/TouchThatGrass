'use client';

import React from 'react';
import { useTravelPlanContext } from '@/hooks/useTravelPlanContext';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { state } = useTravelPlanContext();
  
  const tabs = [
    { 
      id: 'chat', 
      icon: '💬', 
      label: 'AI种草',
      badge: state.chatHistory.length > 0 ? state.chatHistory.length : null
    },
    { 
      id: 'map', 
      icon: '🗺️', 
      label: '打卡地图',
      badge: state.currentPlan ? 
        `${state.currentPlan.grassPoints.filter(p => p.completed).length}/${state.currentPlan.grassPoints.length}` 
        : null
    }
  ];

  return (
    <div className="bg-white border-t">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-4 text-center transition-colors relative ${
              activeTab === tab.id 
                ? 'text-blue-500 bg-blue-50' 
                : 'text-gray-600'
            }`}
          >
            <div className="text-xl mb-1">{tab.icon}</div>
            <div className="text-xs font-medium">{tab.label}</div>
            {tab.badge && (
              <div className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                {tab.badge}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}