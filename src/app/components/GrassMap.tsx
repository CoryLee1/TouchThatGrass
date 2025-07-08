'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTravelPlanContext } from '@/hooks/useTravelPlanContext';
import { GRASS_POINT_TYPES } from '@/constants/prompts';
import { MapService } from '@/app/services/mapService';
import ShareCard from './ShareCard';
import { visualizeGrassPoints, visualizeRouteLine } from '@/app/services/visualizeRoute';
import styles from './FinishCelebration.module.css';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

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
  mapService_selectPoint?: (pointId: string) => void;
}

export default function GrassMap() {
  const { state, toggleGrassPoint, updatePlan, updateGrassPointGrassStatus } = useTravelPlanContext();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoadingCoords, setIsLoadingCoords] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapService, setMapService] = useState<'amap' | 'mapbox'>('mapbox');
  const [showShareCard, setShowShareCard] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // hooks 必须在顶层
  const currentPlan = state.currentPlan;
  const grassPoints = useMemo(() => currentPlan ? currentPlan.grassPoints : [], [currentPlan]);
  const completedCount = grassPoints.filter(p => p.completed).length;
  const progress = grassPoints.length > 0 ? (completedCount / grassPoints.length) * 100 : 0;
  const isAllCompleted = completedCount === grassPoints.length && grassPoints.length > 0;

  // 获取选中的草点
  const selectedPoint = useMemo(() => 
    selectedPointId ? grassPoints.find(p => p.id === selectedPointId) : null, 
    [selectedPointId, grassPoints]
  );

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

  // 种草/拔草处理函数
  const handlePlantGrass = () => {
    if (selectedPointId) {
      updateGrassPointGrassStatus(selectedPointId, 'planted');
      setSelectedPointId(null); // 关闭底部按钮
    }
  };

  const handleRemoveGrass = () => {
    if (selectedPointId) {
      updateGrassPointGrassStatus(selectedPointId, 'removed');
      setSelectedPointId(null); // 关闭底部按钮
    }
  };

  // 关闭底部按钮
  const handleCloseBottomButtons = () => {
    setSelectedPointId(null);
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

    if (!mapContainer.current || mapRef.current) return;
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
            
            // 根据种草状态选择不同的图标
            let markerContent = '';
            let markerStyle = '';
            
            if (point.grassStatus === 'planted') {
              // 种草状态：显示grass.png图标
              markerContent = `<img src="/img/grass.png" alt="种草" style="width: 25px; height: 25px; object-fit: contain;" />`;
              markerStyle = `
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #10B981, #059669);
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                transition: transform 0.2s ease;
              `;
            } else if (point.grassStatus === 'removed') {
              // 拔草状态：显示拔草图标
              markerContent = `<img src="/img/拔草badgrass.png" alt="拔草" style="width: 25px; height: 25px; object-fit: contain;" />`;
              markerStyle = `
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #EF4444, #DC2626);
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                transition: transform 0.2s ease;
              `;
            } else {
              // 默认状态：显示数字和完成状态
              markerContent = point.completed
                ? '✓'
                : `${index + 1}${point.status === 'liked' ? ' <span style="margin-left:2px;font-size:16px;">🌱</span>' : ''}`;
              markerStyle = `
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
            }
            
            const el = document.createElement('div');
            el.style.cssText = markerStyle;
            el.innerHTML = markerContent;
            
            // 添加点击事件
            el.addEventListener('click', (e) => {
              e.stopPropagation();
              setSelectedPointId(point.id);
              const popupInstance = marker.getPopup();
              if (popupInstance && map) {
                popupInstance.addTo(map);
              }
            });
            
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
  }, [grassPoints, toggleGrassPoint]);

  useEffect(() => {
    (window as unknown as WindowWithMapService).mapService_openNavigation = (address: string, lat: number, lng: number) => {
      MapService.openNavigation(address, lat, lng);
    };
    (window as unknown as WindowWithMapService).mapService_togglePoint = (pointId: string) => {
      toggleGrassPoint(pointId);
    };
    (window as unknown as WindowWithMapService).mapService_selectPoint = (pointId: string) => {
      setSelectedPointId(pointId);
    };
  }, [toggleGrassPoint]);

  // 添加地图容器点击事件，关闭底部按钮
  useEffect(() => {
    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // 如果点击的不是marker，则关闭底部按钮
      const target = e.originalEvent.target as HTMLElement;
      if (!target.closest('.mapboxgl-marker')) {
        setSelectedPointId(null);
      }
    };

    if (mapRef.current) {
      mapRef.current.on('click', handleMapClick);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
      }
    };
  }, []);

  const hasCoordinates = grassPoints.some(p => p.lat && p.lng);
  const isMapSupported = MapService.isMapSupported();

  return (
    <div className="h-full bg-gray-50 flex flex-col relative">
      {/* 完成庆祝动画 */}
      {showCompletionCelebration && (
        <div className={`absolute inset-0 flex items-center justify-center z-40 ${styles.finishCelebrationBg}`}>
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
            <h2 className={styles.bananaFont + ' text-lg'}>
              <ReactMarkdown
                components={{
                  h1: 'span', h2: 'span', h3: 'span', h4: 'span', h5: 'span', h6: 'span',
                  strong: (props) => <span style={{fontWeight: 700}} {...props} />,
                }}
              >
                {state.currentPlan?.title ?? ''}
              </ReactMarkdown>
            </h2>
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

        {/* 获取坐标按钮 */}
        {!hasCoordinates && (
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
        {/* 只保留地图本身 */}
        {!isMapSupported ? (
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
          <div ref={mapContainer} className="w-full h-full" />
        )}
      </div>

      {/* 底部种草/拔草按钮 */}
      {selectedPoint && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{selectedPoint.name}</h3>
              <p className="text-sm text-gray-600">{selectedPoint.address}</p>
            </div>
            <button
              onClick={handleCloseBottomButtons}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePlantGrass}
              className="flex-1 flex items-center justify-center p-1 border-1 border-green-500 bg-transparent hover:bg-green-50 transition-colors transform hover:scale-105 active:scale-95 rounded-lg"
            >
              <Image 
                src="/img/种草goodgrass.png" 
                alt="种草" 
                width={72} 
                height={72} 
                className="object-contain"
              />
            </button>
            <button
              onClick={handleRemoveGrass}
              className="flex-1 flex items-center justify-center p-1 border-1 border-red-500 bg-transparent hover:bg-red-50 transition-colors transform hover:scale-105 active:scale-95 rounded-lg"
            >
              <Image 
                src="/img/拔草badgrass.png" 
                alt="拔草" 
                width={72} 
                height={72} 
                className="object-contain"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}