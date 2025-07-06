'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTravelPlanContext } from '@/hooks/useTravelPlanContext';
import { GRASS_POINT_TYPES } from '@/constants/prompts';
import { MapService } from '@/app/services/mapService';
import ShareCard from './ShareCard';
import { visualizeGrassPoints, visualizeRouteLine } from '@/app/services/visualizeRoute';
import RouteListPanel from './RouteListPanel';

// 定义 UserLocation 类型
interface UserLocation {
  city?: string;
  country?: string;
  isChina?: boolean;
  lat?: number;
  lng?: number;
}

// 定义 WindowWithMapService 类型
interface WindowWithMapService extends Window {
  mapService_openNavigation?: (address: string, lat: number, lng: number) => void;
  mapService_togglePoint?: (pointId: string) => void;
}

export default function GrassMap() {
  const { state, toggleGrassPoint, updatePlan, reorderGrassPoints, updateGrassPointTime, updateGrassPointStatus, updateGrassPointPhoto, updateGrassPointComment } = useTravelPlanContext();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [isLoadingCoords, setIsLoadingCoords] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapService, setMapService] = useState<'amap' | 'mapbox'>('mapbox');
  const [showShareCard, setShowShareCard] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // hooks 必须在顶层
  const currentPlan = state.currentPlan;
  const grassPoints = useMemo(() => currentPlan ? currentPlan.grassPoints : [], [currentPlan]);
  const completedCount = grassPoints.filter(p => p.completed).length;
  const progress = grassPoints.length > 0 ? (completedCount / grassPoints.length) * 100 : 0;
  const isAllCompleted = completedCount === grassPoints.length && grassPoints.length > 0;

  // 事件函数 handleGetCoordinates
  const handleGetCoordinates = async () => {
    setIsLoadingCoords(true);
    try {
      const updatedPoints = await MapService.addCoordinatesToGrassPoints(grassPoints);
      if (currentPlan) {
        updatePlan({
          id: currentPlan.id,
          title: currentPlan.title,
          city: currentPlan.city,
          grassPoints: updatedPoints
        });
      }
    } catch (error) {
      console.error('Failed to get coordinates:', error);
    } finally {
      setIsLoadingCoords(false);
    }
  };

  useEffect(() => {
    if (isAllCompleted && !showCompletionCelebration) {
      setShowCompletionCelebration(true);
      setTimeout(() => {
        setShowShareCard(true);
        setShowCompletionCelebration(false);
      }, 2000);
    }
  }, [isAllCompleted, showCompletionCelebration]);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await MapService.getUserLocationInfo();
        setUserLocation(location);
        const recommendedService = await MapService.getRecommendedMapService(grassPoints);
        setMapService(recommendedService);
      } catch (error) {
        console.error('位置初始化失败:', error);
      }
    };
    initializeLocation();
  }, [grassPoints]);

  useEffect(() => {
    let map: import('mapbox-gl').Map | null = null;

    if (!mapContainer.current || mapRef.current || viewMode !== 'map') return;
    const pointsWithCoords = grassPoints.filter(p => p.lat && p.lng);
    if (pointsWithCoords.length === 0) return;
    const center = MapService.getMapCenter(grassPoints);
    if (!center) return;

    import('mapbox-gl').then(module => {
      const mapbox = module.default || module;
      if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        mapbox.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      }
      const Map = mapbox.Map;
      const Popup = mapbox.Popup;
      const Marker = mapbox.Marker;
      const LngLatBounds = mapbox.LngLatBounds;
      if (!Map || !Popup || !Marker || !LngLatBounds) return;
      if (!mapContainer.current) return;
      map = new Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center,
        zoom: 13
      });
      map.on('load', () => {
        try {
          // 草点和路径可视化解耦
          visualizeGrassPoints(map!, pointsWithCoords);
          if (pointsWithCoords.length > 1) {
            // 推荐路线为蓝色
            visualizeRouteLine(map!, pointsWithCoords, { color: '#3B82F6', width: 10, animated: true });
          }
          // 清理旧 marker
          markersRef.current.forEach(m => m.remove());
          markersRef.current = [];
          pointsWithCoords.forEach((point, index) => {
            console.log('marker', point.name, 'comment:', point.comments);
            const typeInfo = GRASS_POINT_TYPES[point.type] || GRASS_POINT_TYPES['其他'];
            const el = document.createElement('div');
            el.style.cssText = `
              width: 35px;
              height: 35px;
              background: ${point.completed ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #3B82F6, #1D4ED8)'};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: bold;
              color: white;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              transition: transform 0.2s ease;
            `;
            el.innerHTML = point.completed
              ? '✓'
              : `${index + 1}${point.status === 'liked' ? ' <span style="margin-left:2px;font-size:16px;">🌱</span>' : ''}`;
            el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.1)'; });
            el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });
            const popup = new Popup({ offset: 25, className: 'grass-point-popup' }).setHTML(`
              <div class="p-3 min-w-[200px]">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg">${typeInfo.icon}</span>
                  <h3 class="font-bold text-sm">${point.name}</h3>
                  <span class="text-xs px-2 py-1 rounded-full" style="background-color: ${typeInfo.color}20; color: ${typeInfo.color}">
                    ${point.type}
                  </span>
                </div>
                ${point.description ? `<p class="text-xs text-gray-600 mb-2">${point.description}</p>` : ''}
                <p class="text-xs text-gray-500 mb-3">📍 ${point.address}</p>
                <div class="flex gap-2">
                  <button onclick="window.mapService_openNavigation('${point.address}', ${point.lat}, ${point.lng})" 
                          class="flex-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                    🧭 智能导航
                  </button>
                  <button onclick="window.mapService_togglePoint('${point.id}')" 
                          class="px-3 py-1 ${point.completed ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white text-xs rounded transition-colors">
                    ${point.completed ? '↩️ 撤销' : '✅ 完成'}
                  </button>
                </div>
              </div>
            `);
            const marker = new Marker(el)
              .setLngLat([point.lng!, point.lat!])
              .setPopup(popup)
              .addTo(map!);
            markersRef.current.push(marker);
          });
          if (pointsWithCoords.length > 1) {
            const bounds = new LngLatBounds();
            pointsWithCoords.forEach(point => {
              bounds.extend([point.lng!, point.lat!]);
            });
            map!.fitBounds(bounds, { padding: 50 });
          }
        } catch (err) {
          // 捕获渲染异常，避免地图挂掉
          console.error('地图渲染异常:', err);
        }
      });
      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // 清理 marker
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [grassPoints, toggleGrassPoint, viewMode]);

  useEffect(() => {
    (window as unknown as WindowWithMapService).mapService_openNavigation = (address: string, lat: number, lng: number) => {
      MapService.openNavigation(address, lat, lng);
    };
    (window as unknown as WindowWithMapService).mapService_togglePoint = (pointId: string) => {
      toggleGrassPoint(pointId);
    };
  }, [toggleGrassPoint]);

  const hasCoordinates = grassPoints.some(p => p.lat && p.lng);
  const isMapSupported = MapService.isMapSupported();

  return (
    <div className="h-full bg-gray-50 flex flex-col relative">
      {/* 完成庆祝动画 */}
      {showCompletionCelebration && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center z-40">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <div className="text-2xl font-bold mb-2">恭喜完成所有打卡！</div>
            <div className="text-lg opacity-90">你的旅程精彩纷呈</div>
            <div className="mt-4 flex justify-center space-x-4">
              <span className="text-4xl animate-pulse">✨</span>
              <span className="text-4xl animate-pulse" style={{animationDelay: '0.2s'}}>🌟</span>
              <span className="text-4xl animate-pulse" style={{animationDelay: '0.4s'}}>⭐</span>
            </div>
          </div>
        </div>
      )}

      {/* 分享卡片 */}
      <ShareCard 
        isVisible={showShareCard} 
        onClose={() => setShowShareCard(false)} 
      />

      {/* 头部信息 */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-lg">{state.currentPlan?.title ?? ''}</h2>
            <div className="text-sm text-gray-600 flex items-center gap-2">
              {state.currentPlan?.city ?? ''}
              {userLocation && (
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {userLocation.isChina ? '🇨🇳' : '🌍'} {userLocation.country}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-500">{completedCount}/{grassPoints.length}</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAllCompleted ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 完成状态提示 */}
        {isAllCompleted && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-green-700">
              <span className="text-xl">🎊</span>
              <div>
                <div className="font-medium">全部打卡完成！</div>
                <div className="text-sm">点击分享按钮记录这次精彩旅程</div>
              </div>
              <button
                onClick={() => setShowShareCard(true)}
                className="ml-auto px-3 py-1 bg-green-500 text-white text-sm rounded-full hover:bg-green-600 transition-colors"
              >
                📱 分享
              </button>
            </div>
          </div>
        )}

        {/* 地图服务信息 */}
        {userLocation && (
          <div className="text-xs text-gray-500 mb-3 flex items-center gap-2">
            <span>🗺️ 地图服务:</span>
            <span className={`px-2 py-1 rounded ${mapService === 'amap' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {mapService === 'amap' ? '高德地图' : 'Mapbox'}
            </span>
            <span className="text-gray-400">
              (基于位置: {userLocation.city || userLocation.country})
            </span>
          </div>
        )}

        {/* 视图切换 */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            📋 列表模式
          </button>
          <button
            onClick={() => setViewMode('map')}
            disabled={!isMapSupported}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'map' 
                ? 'bg-blue-500 text-white' 
                : isMapSupported 
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            🗺️ 地图模式
          </button>
        </div>

        {/* 获取坐标按钮 */}
        {viewMode === 'map' && isMapSupported && !hasCoordinates && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-sm text-orange-700 mb-2">
              📍 需要获取草点坐标才能显示地图
            </div>
            <button 
              onClick={handleGetCoordinates}
              disabled={isLoadingCoords}
              className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {isLoadingCoords ? '获取中...' : '智能获取坐标'}
            </button>
          </div>
        )}
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'map' ? (
          !isMapSupported ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <div className="text-4xl mb-3">🗺️</div>
                <div className="text-lg font-medium mb-2">地图功能未配置</div>
                <div className="text-sm text-gray-600">
                  请设置环境变量<br/>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code>
                </div>
              </div>
            </div>
          ) : !hasCoordinates ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <div className="text-4xl mb-3">📍</div>
                <div className="text-lg font-medium mb-2">等待获取坐标</div>
                <div className="text-sm text-gray-600">点击上方按钮获取草点坐标</div>
              </div>
            </div>
          ) : (
            <>
              <div ref={mapContainer} className="w-full h-full" />
              {/* 路线底部面板，带动画 */}
              <RouteListPanel
                grassPoints={grassPoints}
                onToggleComplete={toggleGrassPoint}
                onReorder={reorderGrassPoints}
                onTimeChange={updateGrassPointTime}
                onStatusChange={updateGrassPointStatus}
                onPhoto={updateGrassPointPhoto}
                onCommentChange={(id, comment) => {
                  updateGrassPointComment(id, comment);
                  console.log('评论已发送', id, comment);
                }}
              />
            </>
          )
        ) : (
          /* 列表视图 */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {grassPoints.map((point, index) => {
                const typeInfo = GRASS_POINT_TYPES[point.type] || GRASS_POINT_TYPES['其他'];
                return (
                  <div 
                    key={point.id}
                    onClick={() => toggleGrassPoint(point.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      point.completed 
                        ? 'bg-green-50 border-green-300 transform scale-[0.98]' 
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                        point.completed ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-100'
                      }`}>
                        {point.completed ? '✓' : index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-medium ${point.completed ? 'line-through text-gray-500' : ''}`}>
                            {point.name}
                          </h3>
                          <span 
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                          >
                            {point.type}
                          </span>
                          {point.completed && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              已完成
                            </span>
                          )}
                        </div>
                        
                        {point.description && (
                          <p className="text-sm text-gray-600 mb-2">{point.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500 flex-1">
                            📍 {point.address}
                            {point.lat && point.lng && (
                              <span className="text-green-600 ml-2">✓ 有坐标</span>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              MapService.openNavigation(point.address, point.lat, point.lng);
                            }}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
                          >
                            智能导航
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 分享提醒 */}
            {isAllCompleted && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="font-medium text-purple-800 mb-2">太棒了！所有草点都打卡完成</div>
                  <div className="text-sm text-purple-600 mb-3">分享你的精彩旅程给朋友们吧</div>
                  <button
                    onClick={() => setShowShareCard(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    📱 生成分享卡片
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}