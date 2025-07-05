// api/geocoding/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { addresses } = await req.json();
    
    if (!Array.isArray(addresses)) {
      return NextResponse.json({ error: 'addresses must be an array' }, { status: 400 });
    }

    // 修复：使用正确的环境变量名
    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!MAPBOX_TOKEN) {
      console.error('❌ Mapbox token not found. Expected: NEXT_PUBLIC_MAPBOX_TOKEN');
      return NextResponse.json({ error: 'Mapbox token not configured' }, { status: 500 });
    }

    console.log('🔍 Processing geocoding for:', addresses.length, 'addresses');

    // 批量地理编码
    const results = await Promise.all(
      addresses.map(async (address: string, index: number) => {
        try {
          console.log(`📍 Geocoding ${index + 1}/${addresses.length}: ${address}`);
          
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            console.log(`✅ Found coordinates for ${address}: ${lat}, ${lng}`);
            return {
              address,
              lat,
              lng,
              success: true
            };
          } else {
            console.warn(`⚠️ No coordinates found for: ${address}`);
            return {
              address,
              lat: null,
              lng: null,
              success: false,
              error: 'No coordinates found'
            };
          }
        } catch (error) {
          console.error(`❌ Geocoding failed for ${address}:`, error);
          return {
            address,
            lat: null,
            lng: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    console.log('📊 Geocoding results:', {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

    return NextResponse.json({
      ok: true,
      results
    });
    
  } catch (error) {
    console.error('💥 Geocoding API error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}