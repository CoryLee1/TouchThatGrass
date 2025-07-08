import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { name, address, source } = await req.json();
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'SerpApi key missing' }, { status: 500 });
  }

  let url = '';
  if (source === 'yelp') {
    url = `https://serpapi.com/search.json?engine=yelp&find_desc=${encodeURIComponent(name)}&find_loc=${encodeURIComponent(address)}&api_key=${apiKey}`;
  } else {
    url = `https://serpapi.com/search.json?engine=google_maps_reviews&q=${encodeURIComponent(name + ' ' + address)}&api_key=${apiKey}`;
  }

  try {
    console.log('[SerpApi Review] Fetching:', url);
    const res = await fetch(url);
    const data = await res.json();
    console.log('[SerpApi Review] Response:', JSON.stringify(data).slice(0, 500));

    // 提取 reviewUrl
    let reviewUrl = '';
    if (source === 'yelp') {
      reviewUrl = data.organic_results?.[0]?.link || '';
    } else {
      // Google Maps
      reviewUrl = data.search_metadata?.google_maps_url || '';
      // 兼容 fallback
      if (!reviewUrl && data.organic_results?.[0]?.data_id) {
        reviewUrl = `https://www.google.com/maps/place/?q=place_id:${data.organic_results[0].data_id}`;
      }
    }

    return NextResponse.json({ ok: true, data, reviewUrl });
  } catch (err) {
    console.error('[SerpApi Review] Error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
} 