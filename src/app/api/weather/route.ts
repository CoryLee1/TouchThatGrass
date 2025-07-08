import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || 'auto:ip';
  const apiKey = process.env.WEATHERAPI_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Weather API key not configured' }, { status: 500 });
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }
    
    return NextResponse.json({
      location: data.location,
      current: data.current
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({ error: 'Weather fetch failed' }, { status: 500 });
  }
} 