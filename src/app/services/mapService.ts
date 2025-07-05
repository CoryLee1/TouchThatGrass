// services/mapService.ts
import type { GrassPoint } from '@/types';
import { LocationService } from './locationService';

export interface GeocodeResult {
  address: string;
  lat: number | null;
  lng: number | null;
  success: boolean;
  error?: string;
}

export class MapService {
  // 智能地理编码（根据地址选择最佳API）
  static async geocodeAddresses(addresses: string[]): Promise<GeocodeResult[]> {
    try {
      console.log('🔍 开始智能地理编码，地址:', addresses);
      
      // 检查是否有中国地址
      const hasChineseAddresses = addresses.some(addr => 
        LocationService.isChineseAddress(addr)
      );
      
      if (hasChineseAddresses) {
        console.log('🇨🇳 检测到中国地址，尝试使用高德地理编码');
        // 这里可以调用高德API，目前先用Mapbox
        return await this.geocodeWithMapbox(addresses);
      } else {
        console.log('🌍 使用Mapbox地理编码');
        return await this.geocodeWithMapbox(addresses);
      }
    } catch (error) {
      console.error('💥 地理编码错误:', error);
      throw error;
    }
  }

  // Mapbox地理编码
  private static async geocodeWithMapbox(addresses: string[]): Promise<GeocodeResult[]> {
    const response = await fetch('/api/geocoding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses, provider: 'mapbox' })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mapbox API错误: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.error || 'Mapbox geocoding failed');
    }

    return data.results;
  }

  // 高德地理编码（预留）
  private static async geocodeWithAmap(addresses: string[]): Promise<GeocodeResult[]> {
    // TODO: 实现高德地理编码API调用
    console.log('🚧 高德地理编码API待实现');
    return await this.geocodeWithMapbox(addresses); // 暂时降级到Mapbox
  }

  // 为草点添加坐标（智能选择）
  static async addCoordinatesToGrassPoints(grassPoints: GrassPoint[]): Promise<GrassPoint[]> {
    console.log('📍 开始为草点添加坐标');
    
    // 检查是否有地图服务可用
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      console.warn('⚠️ 没有地图服务配置');
      alert('需要配置地图服务才能获取坐标');
      return grassPoints;
    }
    
    const addresses = grassPoints.map(point => point.address);
    
    try {
      const geocodeResults = await this.geocodeAddresses(addresses);
      
      const updatedPoints = grassPoints.map((point, index) => {
        const result = geocodeResults[index];
        if (result.success && result.lat && result.lng) {
          console.log(`✅ 找到坐标: ${point.name} -> ${result.lat}, ${result.lng}`);
          return {
            ...point,
            lat: result.lat,
            lng: result.lng
          };
        } else {
          console.warn(`❌ 未找到坐标: ${point.name} - ${result.error}`);
          return point;
        }
      });
      
      console.log('✅ 坐标添加完成');
      return updatedPoints;
    } catch (error) {
      console.error('❌ 地理编码失败:', error);
      alert('地理编码失败，请检查网络连接');
      return grassPoints;
    }
  }

  // 智能导航（根据用户位置和目标位置选择最佳导航方式）
  static async openNavigation(address: string, lat?: number, lng?: number) {
    try {
      const userLocation = await LocationService.getUserLocation();
      const isChineseAddress = LocationService.isChineseAddress(address);
      
      // 构建坐标参数
      const coords = lat && lng ? `${lat},${lng}` : encodeURIComponent(address);
      
      if (userLocation.isChina || isChineseAddress) {
        // 中国用户或中国地址，优先使用高德
        console.log('🇨🇳 打开高德地图导航');
        
        // 尝试打开高德App，失败则用网页版
        const amapAppUrl = `iosamap://navi?sourceApplication=种草官&lat=${lat}&lon=${lng}&dev=0&style=2`;
        const amapWebUrl = `https://uri.amap.com/navigation?to=${coords}&coordinate=gaode&callnative=1`;
        
        // 移动端尝试App，否则用网页
        if (/iPhone|iPad|Android/i.test(navigator.userAgent)) {
          window.location.href = amapAppUrl;
          // 2秒后降级到网页版
          setTimeout(() => {
            window.open(amapWebUrl, '_blank');
          }, 2000);
        } else {
          window.open(amapWebUrl, '_blank');
        }
        
      } else {
        // 海外用户，使用Google Maps
        console.log('🌍 打开Google Maps导航');
        const googleMapsUrl = `https://maps.google.com/?q=${coords}`;
        window.open(googleMapsUrl, '_blank');
      }
      
    } catch (error) {
      console.error('导航打开失败:', error);
      // 降级方案：直接用Google Maps
      const fallbackUrl = lat && lng 
        ? `https://maps.google.com/?q=${lat},${lng}`
        : `https://maps.google.com/?q=${encodeURIComponent(address)}`;
      window.open(fallbackUrl, '_blank');
    }
  }

  // 检查地图支持情况
  static isMapSupported(): boolean {
    return typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  }

  // 获取地图中心点
  static getMapCenter(grassPoints: GrassPoint[]): [number, number] | null {
    const pointsWithCoords = grassPoints.filter(p => p.lat && p.lng);
    
    if (pointsWithCoords.length === 0) return null;

    const avgLat = pointsWithCoords.reduce((sum, p) => sum + p.lat!, 0) / pointsWithCoords.length;
    const avgLng = pointsWithCoords.reduce((sum, p) => sum + p.lng!, 0) / pointsWithCoords.length;
    
    return [avgLng, avgLat];
  }

  // 计算两点间距离
  static calculateDistance(point1: GrassPoint, point2: GrassPoint): number | null {
    if (!point1.lat || !point1.lng || !point2.lat || !point2.lng) return null;
    
    const R = 6371; // 地球半径(km)
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // 获取用户位置信息（供组件使用）
  static async getUserLocationInfo() {
    return await LocationService.getUserLocation();
  }

  // 获取推荐的地图服务
  static async getRecommendedMapService(grassPoints: GrassPoint[]) {
    return await LocationService.getOptimalMapService(grassPoints);
  }
}