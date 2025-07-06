// src/app/api/geocoding/route.ts (更新版本，支持高德地图)
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { addresses, provider } = await req.json();
    
    if (!Array.isArray(addresses)) {
      return NextResponse.json({ error: 'addresses must be an array' }, { status: 400 });
    }

    console.log(`🔍 地理编码请求: ${addresses.length}个地址, 服务商: ${provider || 'auto'}`);

    // 智能选择地理编码服务
    const selectedProvider = provider || await selectOptimalProvider(addresses);
    console.log(`📍 选择服务商: ${selectedProvider}`);

    let results;
    
    if (selectedProvider === 'amap') {
      results = await geocodeWithAmap(addresses);
    } else {
      results = await geocodeWithMapbox(addresses);
    }

    console.log('📊 地理编码结果:', {
      provider: selectedProvider,
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

    return NextResponse.json({
      ok: true,
      provider: selectedProvider,
      results
    });
    
  } catch (error) {
    console.error('💥 地理编码API错误:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// 智能选择地理编码服务
async function selectOptimalProvider(addresses: string[]): Promise<'amap' | 'mapbox'> {
  const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY;
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  // 检查中国地址
  const hasChineseAddresses = addresses.some(isChineseAddress);
  
  // 决策逻辑
  if (hasChineseAddresses && AMAP_KEY) {
    console.log('🇨🇳 检测到中国地址，选择高德地图');
    return 'amap';
  } else if (MAPBOX_TOKEN) {
    console.log('🌍 选择Mapbox地图');
    return 'mapbox';
  } else if (AMAP_KEY) {
    console.log('🔄 Mapbox不可用，降级到高德地图');
    return 'amap';
  } else {
    throw new Error('没有可用的地理编码服务');
  }
}

// 判断是否为中国地址
function isChineseAddress(address: string): boolean {
  const chinesePatterns = [
    /[\u4e00-\u9fff]/, // 中文字符
    /china|中国|beijing|shanghai|guangzhou|shenzhen|hangzhou/i,
    /beijing|shanghai|guangzhou|shenzhen|hangzhou|nanjing|wuhan|chengdu/i,
    /hong kong|macau|taiwan|hongkong|香港|澳门|台湾/i,
    /市$|省$|区$|县$|路$|街$|号$/
  ];
  
  return chinesePatterns.some(pattern => pattern.test(address));
}

// 高德地图地理编码
async function geocodeWithAmap(addresses: string[]) {
  const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY;
  
  if (!AMAP_KEY) {
    throw new Error('高德地图API Key未配置');
  }

  console.log('🇨🇳 使用高德地图批量地理编码');

  const results = await Promise.all(
    addresses.map(async (address, index) => {
      try {
        console.log(`🔍 高德编码 ${index + 1}/${addresses.length}: ${address}`);
        
        const encodedAddress = encodeURIComponent(address);
        const url = `https://restapi.amap.com/v3/geocode/geo?key=${AMAP_KEY}&address=${encodedAddress}&output=json`;
        
        const response = await fetch(url, {
          signal: AbortSignal.timeout(10000) // 10秒超时
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
          const geocode = data.geocodes[0];
          const [lng, lat] = geocode.location.split(',').map(Number);
          
          console.log(`✅ 高德找到坐标: ${address} -> ${lat}, ${lng}`);
          return {
            address,
            lat,
            lng,
            success: true,
            provider: 'amap'
          };
        } else {
          console.warn(`⚠️ 高德未找到: ${address} - ${data.info || '无结果'}`);
          return {
            address,
            lat: null,
            lng: null,
            success: false,
            error: data.info || '未找到坐标',
            provider: 'amap'
          };
        }
      } catch (error) {
        console.error(`❌ 高德编码失败: ${address}`, error);
        return {
          address,
          lat: null,
          lng: null,
          success: false,
          error: error instanceof Error ? error.message : '网络错误',
          provider: 'amap'
        };
      }
    })
  );

  return results;
}

// Mapbox地理编码
async function geocodeWithMapbox(addresses: string[]) {
  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox Token未配置');
  }

  console.log('🌍 使用Mapbox批量地理编码');

  const results = await Promise.all(
    addresses.map(async (address, index) => {
      try {
        console.log(`📍 Mapbox编码 ${index + 1}/${addresses.length}: ${address}`);
        
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`,
          {
            signal: AbortSignal.timeout(10000) // 10秒超时
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          console.log(`✅ Mapbox找到坐标: ${address} -> ${lat}, ${lng}`);
          return {
            address,
            lat,
            lng,
            success: true,
            provider: 'mapbox'
          };
        } else {
          console.warn(`⚠️ Mapbox未找到: ${address}`);
          return {
            address,
            lat: null,
            lng: null,
            success: false,
            error: 'No coordinates found',
            provider: 'mapbox'
          };
        }
      } catch (error) {
        console.error(`❌ Mapbox编码失败: ${address}`, error);
        return {
          address,
          lat: null,
          lng: null,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          provider: 'mapbox'
        };
      }
    })
  );

  return results;
}