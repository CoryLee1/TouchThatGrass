// hooks/useTravelPlan.ts - MVP简化版

import { useState, useCallback } from 'react';
import type { AppState, TravelPlan, Message, GrassPoint } from '@/types';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const parseAIResponse = (content: string): TravelPlan | null => {
  try {
    const jsonMatch = content.match(/\[\s*{[\s\S]*?}\s*\]/);
    if (!jsonMatch) return null;
    
    const grassPointsData = JSON.parse(jsonMatch[0]);
    const titleMatch = content.match(/["'](.*?一日游.*?)["']/) || content.match(/(.*?)(?:\n|$)/);
    const title = titleMatch ? titleMatch[1]?.trim() || '精彩一日游' : '精彩一日游';
    const cityMatch = content.match(/(东京|巴黎|纽约|伦敦|首尔|台北|香港|新加坡|上海|北京)/);
    const city = cityMatch ? cityMatch[1] : '未知城市';
    
    const grassPoints: GrassPoint[] = grassPointsData.map((point: Record<string, unknown>) => ({
      id: generateId(),
      name: typeof point.name === 'string' ? point.name : '',
      type: typeof point.type === 'string' ? point.type : '其他',
      address: typeof point.address === 'string' ? point.address : '',
      completed: false,
      description: typeof point.description === 'string' ? point.description : (typeof point.reason === 'string' ? point.reason : '')
    }));

    return {
      id: generateId(),
      title,
      city,
      grassPoints
    };
  } catch (error) {
    console.error('解析AI回复失败:', error);
    return null;
  }
};

export const useTravelPlan = () => {
  const [state, setState] = useState<AppState>({
    currentPlan: null,
    chatHistory: [],
    loading: false
  });

  const updatePlan = useCallback((plan: TravelPlan) => {
    setState(prev => ({ ...prev, currentPlan: plan }));
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, newMessage]
    }));

    // 如果是AI回复，尝试解析行程
    if (message.role === 'assistant') {
      const plan = parseAIResponse(message.content);
      if (plan) {
        setState(prev => ({ ...prev, currentPlan: plan }));
      }
    }
  }, []);

  const toggleGrassPoint = useCallback((pointId: string) => {
    setState(prev => {
      if (!prev.currentPlan) return prev;
      
      const updatedPoints = prev.currentPlan.grassPoints.map(point =>
        point.id === pointId ? { ...point, completed: !point.completed } : point
      );
      
      return {
        ...prev,
        currentPlan: { ...prev.currentPlan, grassPoints: updatedPoints }
      };
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // 新增：草点顺序、时间、状态、拍照、评论的全局更新方法
  const reorderGrassPoints = useCallback((newOrder: GrassPoint[]) => {
    setState(prev => {
      if (!prev.currentPlan) return prev;
      return {
        ...prev,
        currentPlan: { ...prev.currentPlan, grassPoints: newOrder }
      };
    });
  }, []);

  const updateGrassPointTime = useCallback((pointId: string, newTime: string) => {
    setState(prev => {
      if (!prev.currentPlan) return prev;
      const updatedPoints = prev.currentPlan.grassPoints.map(point =>
        point.id === pointId ? { ...point, time: newTime } : point
      );
      return {
        ...prev,
        currentPlan: { ...prev.currentPlan, grassPoints: updatedPoints }
      };
    });
  }, []);

  const updateGrassPointStatus = useCallback((pointId: string, status: 'liked' | 'disliked' | 'none') => {
    setState(prev => {
      if (!prev.currentPlan) return prev;
      const updatedPoints = prev.currentPlan.grassPoints.map(point =>
        point.id === pointId ? { ...point, status } : point
      );
      return {
        ...prev,
        currentPlan: { ...prev.currentPlan, grassPoints: updatedPoints }
      };
    });
  }, []);

  const updateGrassPointPhoto = useCallback((pointId: string, photoUrl: string) => {
    setState(prev => {
      if (!prev.currentPlan) return prev;
      const updatedPoints = prev.currentPlan.grassPoints.map(point =>
        point.id === pointId ? { ...point, photoUrl } : point
      );
      return {
        ...prev,
        currentPlan: { ...prev.currentPlan, grassPoints: updatedPoints }
      };
    });
  }, []);

  const updateGrassPointComment = useCallback((pointId: string, commentObj: { text: string; user?: string; time?: string }) => {
    setState(prev => {
      if (!prev.currentPlan) return prev;
      const updatedPoints = prev.currentPlan.grassPoints.map(point =>
        point.id === pointId
          ? { ...point, comments: [...(point.comments || []), commentObj] }
          : point
      );
      return {
        ...prev,
        currentPlan: { ...prev.currentPlan, grassPoints: updatedPoints }
      };
    });
  }, []);

  return {
    state,
    updatePlan,
    addMessage,
    toggleGrassPoint,
    setLoading,
    reorderGrassPoints,
    updateGrassPointTime,
    updateGrassPointStatus,
    updateGrassPointPhoto,
    updateGrassPointComment
  };
};