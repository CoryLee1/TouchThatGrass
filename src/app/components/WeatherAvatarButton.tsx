'use client';

import React, { useState } from 'react';
import { XhsGrassAvatar } from './Chatbox/XhsGrassAvatar';
import Image from 'next/image';

interface WeatherData {
  location: {
    name: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  };
}

export const WeatherAvatarButton = () => {
  const [showBubble, setShowBubble] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error('天气数据获取失败');
      }
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!showBubble) {
      fetchWeather();
    }
    setShowBubble(!showBubble);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <XhsGrassAvatar
        onClick={handleClick}
        onMouseEnter={undefined}
        onMouseLeave={undefined}
        aria-label="显示天气和时间"
      />
      
      {showBubble && (
        <div style={{
          position: 'absolute',
          right: 0,
          bottom: 110,
          background: 'rgba(255,255,255,0.98)',
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          padding: '20px',
          minWidth: 220,
          zIndex: 100,
          color: '#222',
          fontSize: 14,
          textAlign: 'left',
          pointerEvents: 'auto',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>🌤️</div>
              <div>正在获取天气...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>⚠️</div>
              <div style={{ color: '#e74c3c' }}>{error}</div>
            </div>
          ) : weatherData ? (
            <>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 12,
                borderBottom: '1px solid #eee',
                paddingBottom: 8
              }}>
                <Image
                  src={weatherData.current.condition.icon.startsWith('//') ? `https:${weatherData.current.condition.icon}` : weatherData.current.condition.icon}
                  alt={weatherData.current.condition.text}
                  width={32}
                  height={32}
                  style={{ marginRight: 8 }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>
                    {weatherData.location.name}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    {weatherData.location.country}
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#2c3e50' }}>
                  {weatherData.current.temp_c}°C
                </div>
                <div style={{ color: '#7f8c8d', fontSize: 13 }}>
                  体感温度 {weatherData.current.feelslike_c}°C
                </div>
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#34495e', marginBottom: 4 }}>
                  {weatherData.current.condition.text}
                </div>
                <div style={{ color: '#7f8c8d', fontSize: 12 }}>
                  湿度 {weatherData.current.humidity}% | 风速 {weatherData.current.wind_kph} km/h
                </div>
              </div>
              
              <div style={{ 
                color: '#95a5a6', 
                fontSize: 11, 
                borderTop: '1px solid #eee',
                paddingTop: 8
              }}>
                {formatTime(weatherData.location.localtime)}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 16, marginBottom: 8 }}>🌤️</div>
              <div>点击获取天气</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 