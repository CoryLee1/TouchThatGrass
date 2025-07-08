'use client';
import { useEffect } from 'react';
import { enableHeatmapTracking } from '../services/heatmap';

export default function HeatmapClient() {
  useEffect(() => {
    enableHeatmapTracking();
  }, []);
  return null;
} 