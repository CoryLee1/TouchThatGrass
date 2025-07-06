'use client';
import React from 'react';
import type { UserLocation } from '@/app/services/locationService';

export default function LocationDebugInfo() {
  const [location, setLocation] = React.useState<UserLocation | null>(null);
  React.useEffect(() => {
    import('@/app/services/locationService').then(({ LocationService }) => {
      LocationService.getUserLocation().then(setLocation);
    });
  }, []);
  if (!location || process.env.NODE_ENV !== 'development') return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-black bg-opacity-80 text-white text-xs p-3 rounded-lg z-40">
      <div className="font-bold mb-1">🐛 位置调试信息</div>
      <div>国家: {location.country} ({location.countryCode})</div>
      <div>城市: {location.city || '未知'}</div>
      <div>检测方式: {location.detectionMethod}</div>
      <div>精度: {location.accuracy}</div>
      <div>是否中国: {location.isChina ? '是' : '否'}</div>
      {location.coords && (
        <div>坐标: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}</div>
      )}
    </div>
  );
} 