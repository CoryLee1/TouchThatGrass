'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useTravelPlanContext } from '@/app/page';
import { ShareService } from '@/app/services/shareService';

interface ShareCardProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ShareCard({ isVisible, onClose }: ShareCardProps) {
  const { state } = useTravelPlanContext();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareData, setShareData] = useState<{
    summary: string;
    completedTime: string;
    stats: {
      totalPoints: number;
      completedPoints: number;
      duration: string;
    };
  } | null>(null);

  // 生成分享数据
  useEffect(() => {
    if (isVisible && state.currentPlan) {
      const plan = state.currentPlan;
      const completedPoints = plan.grassPoints.filter(p => p.completed);
      
      // 生成旅程总结
      const summary = ShareService.generateTripSummary(plan);
      
      // 计算统计数据
      const stats = {
        totalPoints: plan.grassPoints.length,
        completedPoints: completedPoints.length,
        duration: ShareService.calculateTripDuration(plan)
      };

      setShareData({
        summary,
        completedTime: new Date().toLocaleDateString('zh-CN'),
        stats
      });
    }
  }, [isVisible, state.currentPlan]);

  // 生成分享图片
  const generateShareImage = async () => {
    if (!cardRef.current || !state.currentPlan) return null;

    setIsGenerating(true);
    try {
      const canvas = await ShareService.generateShareImage(cardRef.current, state.currentPlan);
      return canvas.toDataURL('image/png', 0.9);
    } catch (error) {
      console.error('生成分享图片失败:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // 分享到不同平台
  const shareToplatform = async (platform: 'wechat' | 'instagram' | 'xiaohongshu' | 'twitter') => {
    if (!state.currentPlan || !shareData) return;

    const shareImage = await generateShareImage();
    if (!shareImage) {
      alert('生成分享图片失败，请重试');
      return;
    }

    const shareText = ShareService.generateShareText(state.currentPlan, platform);
    
    try {
      await ShareService.shareToplatform(platform, {
        text: shareText,
        image: shareImage,
        plan: state.currentPlan
      });
    } catch (error) {
      console.error(`分享到${platform}失败:`, error);
    }
  };

  if (!isVisible || !state.currentPlan || !shareData) {
    return null;
  }

  const plan = state.currentPlan;
  const { stats } = shareData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        {/* 分享卡片内容 */}
        <div ref={cardRef} className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 text-white">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-2xl"></div>
          <div className="absolute top-4 right-4 text-4xl opacity-30">🌍</div>
          <div className="absolute bottom-4 left-4 text-2xl opacity-20">✨</div>
          
          <div className="relative z-10">
            {/* 标题区域 */}
            <div className="text-center mb-6">
              <div className="text-2xl font-bold mb-2">{plan.title}</div>
              <div className="text-sm opacity-90">{plan.city} · {shareData.completedTime}</div>
            </div>

            {/* 统计数据 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.completedPoints}</div>
                <div className="text-xs opacity-80">打卡完成</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalPoints}</div>
                <div className="text-xs opacity-80">草点总数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.duration}</div>
                <div className="text-xs opacity-80">游玩时长</div>
              </div>
            </div>

            {/* 旅程总结 */}
            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-6">
              <div className="text-sm opacity-90 mb-2">旅程回忆</div>
              <div className="text-lg font-medium leading-relaxed">
                {shareData.summary}
              </div>
            </div>

            {/* 完成的草点展示 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {plan.grassPoints.filter(p => p.completed).slice(0, 6).map((point, index) => (
                <div key={point.id} className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                  <span className="text-xs">✓ {point.name}</span>
                </div>
              ))}
              {plan.grassPoints.filter(p => p.completed).length > 6 && (
                <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                  <span className="text-xs">+{plan.grassPoints.filter(p => p.completed).length - 6}</span>
                </div>
              )}
            </div>

            {/* 水印 */}
            <div className="text-center">
              <div className="text-xs opacity-60">全球种草官 · AI旅行助手</div>
            </div>
          </div>
        </div>

        {/* 分享按钮区域 */}
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="text-lg font-bold text-gray-800 mb-2">🎉 恭喜完成所有打卡！</div>
            <div className="text-sm text-gray-600">分享你的精彩旅程</div>
          </div>

          {/* 分享平台按钮 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => shareToplatform('wechat')}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm font-medium">微信朋友圈</span>
            </button>

            <button
              onClick={() => shareToplatform('xiaohongshu')}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <span className="text-lg">📔</span>
              <span className="text-sm font-medium">小红书</span>
            </button>

            <button
              onClick={() => shareToplatform('instagram')}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
            >
              <span className="text-lg">📸</span>
              <span className="text-sm font-medium">Instagram</span>
            </button>

            <button
              onClick={() => shareToplatform('twitter')}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <span className="text-lg">🐦</span>
              <span className="text-sm font-medium">Twitter</span>
            </button>
          </div>

          {/* 生成状态 */}
          {isGenerating && (
            <div className="text-center text-sm text-gray-500 mb-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                正在生成分享图片...
              </div>
            </div>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            稍后分享
          </button>
        </div>
      </div>
    </div>
  );
}