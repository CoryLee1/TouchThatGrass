// src/app/components/LocationDetector.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { LocationService } from '@/app/services/locationService';
import type { UserLocation } from '@/app/services/locationService';

interface LocationDetectorProps {
  children: React.ReactNode;
}

export default function LocationDetector({ children }: LocationDetectorProps) {
  const [isDetecting, setIsDetecting] = useState(true);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      setIsDetecting(true);
      setError(null);

      // 检查定位权限
      const permission = await LocationService.checkLocationPermission();
      setPermissionStatus(permission);
      
      console.log('📍 开始位置检测，权限状态:', permission);
      
      // 获取用户位置
      const userLocation = await LocationService.getUserLocation();
      setLocation(userLocation);
      
      console.log('✅ 位置检测完成:', userLocation);
      
    } catch (err) {
      console.error('❌ 位置检测失败:', err);
      setError(err instanceof Error ? err.message : '位置检测失败');
    } finally {
      setIsDetecting(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setError(null);
      
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);
        
        if (result.state === 'granted') {
          await detectLocation();
        }
      }
    } catch (err) {
      console.error('权限请求失败:', err);
    }
  };

  const skipLocationDetection = () => {
    setIsDetecting(false);
    setLocation({
      country: 'Unknown',
      countryCode: 'US',
      isChina: false,
      detectionMethod: 'unknown',
      accuracy: 'low'
    });
  };

  const retryDetection = () => {
    detectLocation();
  };

  // 如果正在检测且是首次加载，显示加载界面
  if (isDetecting && !location) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
          <div className="text-6xl mb-4">🌍</div>
          <div className="text-2xl font-bold mb-2 text-gray-800">正在定位中...</div>
          <div className="text-sm text-gray-600 mb-6">
            {permissionStatus === 'prompt' && '请允许获取位置信息以提供更好的服务'}
            {permissionStatus === 'denied' && '位置权限被拒绝，将使用IP定位'}
            {permissionStatus === 'granted' && '正在获取精确位置...'}
            {permissionStatus === 'unknown' && '正在检测最佳地图服务...'}
          </div>
          
          {/* 加载动画 */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>

          {/* 权限提示和操作 */}
          {permissionStatus === 'prompt' && (
            <div className="space-y-3">
              <button
                onClick={requestLocationPermission}
                className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                🎯 获取精确位置
              </button>
              <button
                onClick={skipLocationDetection}
                className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                跳过定位
              </button>
            </div>
          )}

          {permissionStatus === 'denied' && (
            <div className="space-y-3">
              <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg">
                💡 位置权限被拒绝，正在使用IP定位。如需精确定位，请在浏览器设置中允许位置访问。
              </div>
              <button
                onClick={skipLocationDetection}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition-colors"
              >
                继续使用IP定位
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 如果检测失败，显示错误和重试选项
  if (error && !location) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-400 to-pink-500">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
          <div className="text-6xl mb-4">😅</div>
          <div className="text-xl font-bold mb-2 text-gray-800">位置检测遇到问题</div>
          <div className="text-sm text-gray-600 mb-6">{error}</div>
          
          <div className="space-y-3">
            <button
              onClick={retryDetection}
              className="w-full py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              🔄 重试检测
            </button>
            <button
              onClick={skipLocationDetection}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              跳过定位，直接使用
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 位置检测成功，显示主应用
  return (
    <>
      {/* 位置信息指示器（可选，用于开发调试） */}
      {location && process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs py-1 px-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>{location.isChina ? '🇨🇳' : '🌍'}</span>
            <span>{location.city || location.country}</span>
            <span className="opacity-70">
              ({location.detectionMethod}{location.accuracy ? ` - ${location.accuracy}` : ''})
            </span>
          </div>
          <button
            onClick={retryDetection}
            className="text-xs opacity-70 hover:opacity-100"
          >
            🔄
          </button>
        </div>
      )}
      
      {children}
    </>
  );
}