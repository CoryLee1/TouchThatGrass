import type mapboxgl from 'mapbox-gl';
import type { GrassPoint } from '@/types';
import type { Feature, FeatureCollection, Point, LineString } from 'geojson';

// 渲染草点（圆点/Marker）
export function visualizeGrassPoints(map: mapboxgl.Map, points: GrassPoint[]) {
  // 先移除旧的图层和数据源（如果有）
  if (map.getLayer('grass-points')) map.removeLayer('grass-points');
  if (map.getSource('grass-points')) map.removeSource('grass-points');

  // 只渲染有坐标的点
  const validPoints = points.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');

  const features: Feature<Point>[] = validPoints.map(p => ({
    type: 'Feature',
    properties: {
      id: p.id,
      name: p.name,
      completed: p.completed,
      color: ('color' in p && typeof p.color === 'string')
        ? p.color
        : (p.completed ? '#10B981' : '#3B82F6')
    },
    geometry: {
      type: 'Point',
      coordinates: [p.lng as number, p.lat as number]
    }
  }));

  const featureCollection: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features
  };

  map.addSource('grass-points', {
    type: 'geojson',
    data: featureCollection
  });

  map.addLayer({
    id: 'grass-points',
    type: 'circle',
    source: 'grass-points',
    paint: {
      'circle-radius': 12,
      'circle-color': ['get', 'color'],
      'circle-stroke-width': 3,
      'circle-stroke-color': '#fff',
      'circle-opacity': 0.95
    }
  });
}

// 渲染路径线（支持动画蚂蚁线）
export function visualizeRouteLine(
  map: mapboxgl.Map,
  points: GrassPoint[],
  options?: { color?: string, width?: number, animated?: boolean }
) {
  // 先移除旧的图层和数据源（如果有）
  if (map.getLayer('route-ant-background')) map.removeLayer('route-ant-background');
  if (map.getLayer('route-ant-anim')) map.removeLayer('route-ant-anim');
  if (map.getSource('route-ant')) map.removeSource('route-ant');

  // 只用有坐标的点
  const validPoints = points.filter(p => typeof p.lat === 'number' && typeof p.lng === 'number');
  if (validPoints.length < 2) return;

  const coordinates = validPoints.map(p => [p.lng as number, p.lat as number]);
  const lineFeature: Feature<LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates
    }
  };
  const lineFeatureCollection: FeatureCollection<LineString> = {
    type: 'FeatureCollection',
    features: [lineFeature]
  };

  map.addSource('route-ant', {
    type: 'geojson',
    data: lineFeatureCollection
  });

  // 背景线
  map.addLayer({
    id: 'route-ant-background',
    type: 'line',
    source: 'route-ant',
    paint: {
      'line-color': options?.color || '#fff',
      'line-width': options?.width || 10,
      'line-opacity': 0.4
    }
  });

  // 动画虚线
  map.addLayer({
    id: 'route-ant-anim',
    type: 'line',
    source: 'route-ant',
    paint: {
      'line-color': options?.color || '#fff',
      'line-width': options?.width || 8,
      'line-dasharray': [0, 4, 3],
      'line-emissive-strength': 1
    }
  });

  if (options?.animated !== false) {
    const dashArraySequence = [
      [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1],
      [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3],
      [0, 1.5, 3, 2.5], [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5]
    ];
    let step = 0;
    function animateDashArray(timestamp: number) {
      try {
        if (!map || !map.getLayer('route-ant-anim')) return;
        const newStep = Math.floor((timestamp / 50) % dashArraySequence.length);
        if (newStep !== step) {
          map.setPaintProperty('route-ant-anim', 'line-dasharray', dashArraySequence[newStep]);
          step = newStep;
        }
        requestAnimationFrame(animateDashArray);
      } catch {
        // map 已销毁，停止动画
        return;
      }
    }
    animateDashArray(0);
  }
} 