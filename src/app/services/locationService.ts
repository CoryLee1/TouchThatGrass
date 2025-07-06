// services/locationService.ts
import { GrassPoint } from '@/types';

export interface UserLocation {
    country: string;
    countryCode: string;
    city?: string;
    coords?: {
      latitude: number;
      longitude: number;
    };
    isChina: boolean;
    detectionMethod: 'ip' | 'gps' | 'unknown';
  }
  
  export class LocationService {
    private static cachedLocation: UserLocation | null = null;
  
    // 获取用户位置（优先从缓存）
    static async getUserLocation(): Promise<UserLocation> {
      if (this.cachedLocation) {
        return this.cachedLocation;
      }
  
      try {
        // 先尝试IP检测（快速）
        const ipLocation = await this.getLocationByIP();
        this.cachedLocation = ipLocation;
        
        // 异步请求GPS（可选）
        this.requestGPSLocation().then(gpsCoords => {
          if (gpsCoords && this.cachedLocation) {
            this.cachedLocation.coords = gpsCoords;
            this.cachedLocation.detectionMethod = 'gps';
          }
        }).catch(() => {
          // GPS请求失败不影响主流程
        });
  
        return ipLocation;
      } catch {
        console.warn('位置检测失败，使用默认位置');
        return this.getDefaultLocation();
      }
    }
  
    // IP地址检测
    private static async getLocationByIP(): Promise<UserLocation> {
      try {
        console.log('🌍 开始IP位置检测...');
        
        // 使用免费的IP地理位置API
        const response = await fetch('https://ipapi.co/json/');
        
        if (!response.ok) {
          throw new Error('IP location API failed');
        }
        
        const data = await response.json();
        console.log('📍 IP检测结果:', data);
        
        const countryCode = data.country_code || 'US';
        const country = data.country_name || 'Unknown';
        const city = data.city;
        const isChina = countryCode === 'CN';
        
        return {
          country,
          countryCode,
          city,
          isChina,
          detectionMethod: 'ip'
        };
      } catch (error) {
        console.error('IP位置检测失败:', error);
        throw error;
      }
    }
  
    // GPS精确定位（需要用户授权）
    private static async requestGPSLocation(): Promise<{ latitude: number; longitude: number } | null> {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.warn('浏览器不支持GPS定位');
          resolve(null);
          return;
        }
  
        console.log('🛰️ 请求GPS定位...');
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ GPS定位成功:', position.coords);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.warn('GPS定位失败:', error.message);
            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5分钟缓存
          }
        );
      });
    }
  
    // 默认位置（降级方案）
    private static getDefaultLocation(): UserLocation {
      return {
        country: 'Unknown',
        countryCode: 'US',
        isChina: false,
        detectionMethod: 'unknown'
      };
    }
  
    // 检测地址是否在中国
    static isChineseAddress(address: string): boolean {
      const chineseKeywords = [
        // 国家
        '中国', 'China', '中华人民共和国',
        // 主要城市
        '北京', 'Beijing', '上海', 'Shanghai', '广州', 'Guangzhou',
        '深圳', 'Shenzhen', '杭州', 'Hangzhou', '南京', 'Nanjing',
        '武汉', 'Wuhan', '成都', 'Chengdu', '西安', "Xi'an",
        '重庆', 'Chongqing', '天津', 'Tianjin', '苏州', 'Suzhou',
        // 省份
        '广东', 'Guangdong', '江苏', 'Jiangsu', '浙江', 'Zhejiang',
        '山东', 'Shandong', '河南', 'Henan', '四川', 'Sichuan',
        '湖北', 'Hubei', '湖南', 'Hunan', '福建', 'Fujian',
        // 特别行政区
        '香港', 'Hong Kong', '澳门', 'Macau', '台湾', 'Taiwan',
        // 常见后缀
        '市', '省', '区', '县', '路', '街', '号'
      ];
  
      return chineseKeywords.some(keyword => 
        address.toLowerCase().includes(keyword.toLowerCase())
      );
    }
  
    // 根据用户位置和草点位置选择最佳地图服务
    static async getOptimalMapService(grassPoints: GrassPoint[]): Promise<'amap' | 'mapbox'> {
      const userLocation = await this.getUserLocation();
      
      // 检查草点是否有中国地址
      const hasChinesePoints = grassPoints.some(point => 
        this.isChineseAddress(point.address)
      );
  
      // 决策逻辑
      if (userLocation.isChina || hasChinesePoints) {
        console.log('🇨🇳 选择高德地图服务');
        return 'amap';
      } else {
        console.log('🌍 选择Mapbox服务');
        return 'mapbox';
      }
    }
  
    // 清除缓存（用于测试或用户手动刷新位置）
    static clearLocationCache(): void {
      this.cachedLocation = null;
    }
  
    // 获取用户时区
    static getUserTimezone(): string {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  
    // 获取用户语言偏好
    static getUserLanguage(): string {
      return navigator.language || 'en-US';
    }
  }