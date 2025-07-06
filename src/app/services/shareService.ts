// src/app/services/shareService.ts
import type { TravelPlan, GrassPoint } from '@/types';

export interface ShareData {
  text: string;
  image: string;
  plan: TravelPlan;
}

export class ShareService {
  
  // 生成旅程总结（不超过20个词）
  static generateTripSummary(plan: TravelPlan): string {
    const completedPoints = plan.grassPoints.filter(p => p.completed);
    const pointTypes = [...new Set(completedPoints.map(p => p.type))];
    
    // 根据草点类型生成个性化总结
    const templates = {
      '咖啡馆': ['品味了当地咖啡文化', '沉浸在咖啡香氛中', '发现了隐藏的咖啡宝藏'],
      '餐厅': ['尝遍了地道美食', '味蕾的完美邀约', '美食探索之旅完成'],
      '景点': ['打卡了经典地标', '收获了满满回忆', '见证了城市之美'],
      '购物': ['发现了心仪好物', '购物清单完美达成', '淘到了独特宝贝'],
      '博物馆': ['沉浸在历史文化中', '知识与美感的双重享受', '文化探索圆满结束']
    };

    // 选择主要类型
    const mainType = pointTypes.length > 0 ? pointTypes[0] : '其他';
    const summaryOptions = templates[mainType as keyof typeof templates] || ['完成了精彩的城市探索'];
    
    // 随机选择一个模板并添加个性化元素
    const baseSummary = summaryOptions[Math.floor(Math.random() * summaryOptions.length)];
    const cityName = plan.city;
    const pointCount = completedPoints.length;
    
    return `在${cityName}${baseSummary}，${pointCount}个草点全部打卡完成！`;
  }

  // 计算旅程时长
  static calculateTripDuration(plan: TravelPlan): string {
    // 这里可以根据实际的开始和结束时间计算
    // 目前使用草点数量估算
    const pointCount = plan.grassPoints.length;
    
    if (pointCount <= 3) return '半日游';
    if (pointCount <= 6) return '一日游';
    if (pointCount <= 10) return '深度游';
    return '多日游';
  }

  // 根据平台生成分享文案
  static generateShareText(plan: TravelPlan, platform: 'wechat' | 'instagram' | 'xiaohongshu' | 'twitter'): string {
    const completedPoints = plan.grassPoints.filter(p => p.completed);
    const summary = this.generateTripSummary(plan);
    
    const platformTemplates = {
      wechat: {
        template: `🌍 ${summary}\n\n📍 ${plan.city}\n✅ ${completedPoints.length}/${plan.grassPoints.length} 打卡完成\n\n#旅行 #${plan.city} #种草官`,
        hashtags: ['旅行', plan.city, '种草官', '打卡']
      },
      xiaohongshu: {
        template: `${summary} ✨\n\n📍 地点：${plan.city}\n🎯 完成度：${completedPoints.length}/${plan.grassPoints.length}\n💝 推荐指数：⭐⭐⭐⭐⭐\n\n`,
        hashtags: ['旅行攻略', plan.city, '打卡', '种草', '一日游', '城市探索']
      },
      instagram: {
        template: `${summary} ✨\n\n📍 ${plan.city}\n🎯 ${completedPoints.length}/${plan.grassPoints.length} spots completed\n\n`,
        hashtags: ['travel', 'cityguide', plan.city.toLowerCase(), 'exploration', 'travelgram', 'wanderlust']
      },
      twitter: {
        template: `${summary} 🌟\n\n📍 ${plan.city}\n✅ ${completedPoints.length}/${plan.grassPoints.length}\n\n`,
        hashtags: ['travel', plan.city, 'cityguide']
      }
    };

    const config = platformTemplates[platform];
    const hashtags = config.hashtags.map(tag => `#${tag}`).join(' ');
    
    return `${config.template}${hashtags}`;
  }

  // 生成分享图片
  static async generateShareImage(element: HTMLElement, plan: TravelPlan): Promise<HTMLCanvasElement> {
    // 动态导入html2canvas
    const html2canvas = await import('html2canvas');
    
    const canvas = await html2canvas.default(element, {
      backgroundColor: null,
      scale: 2, // 高分辨率
      useCORS: true,
      allowTaint: true,
      width: element.offsetWidth,
      height: element.offsetHeight,
      onclone: (clonedDoc) => {
        // 确保克隆的文档样式正确
        const clonedElement = clonedDoc.querySelector('[data-html2canvas-ignore]');
        if (clonedElement) {
          clonedElement.remove();
        }
      }
    });

    return canvas;
  }

  // 分享到不同平台
  static async shareToplatform(platform: 'wechat' | 'instagram' | 'xiaohongshu' | 'twitter', data: ShareData): Promise<void> {
    const { text, image, plan } = data;

    switch (platform) {
      case 'wechat':
        await this.shareToWechat(text, image);
        break;
      case 'xiaohongshu':
        await this.shareToXiaohongshu(text, image);
        break;
      case 'instagram':
        await this.shareToInstagram(text, image);
        break;
      case 'twitter':
        await this.shareToTwitter(text, image);
        break;
      default:
        throw new Error(`不支持的分享平台: ${platform}`);
    }
  }

  // 微信分享
  private static async shareToWechat(text: string, image: string): Promise<void> {
    if (this.isMobile() && this.isWechatBrowser()) {
      // 在微信浏览器中，使用微信JS-SDK
      try {
        // 这里需要配置微信JS-SDK
        // wx.ready(() => {
        //   wx.onMenuShareTimeline({
        //     title: text,
        //     link: window.location.href,
        //     imgUrl: image
        //   });
        // });
        
        // 降级方案：复制文案并提示用户
        await this.copyToClipboard(text);
        this.downloadImage(image, '旅程分享卡片.png');
        alert('文案已复制，图片已下载！\n请在微信中粘贴文案并上传图片分享');
      } catch (error) {
        console.error('微信分享失败:', error);
        await this.fallbackShare(text, image, '微信');
      }
    } else {
      // 非微信环境的降级处理
      await this.fallbackShare(text, image, '微信');
    }
  }

  // 小红书分享
  private static async shareToXiaohongshu(text: string, image: string): Promise<void> {
    try {
      if (this.isMobile()) {
        // 尝试打开小红书App
        const appUrl = `xhsdiscover://item/create?text=${encodeURIComponent(text)}`;
        window.location.href = appUrl;
        
        // 降级方案
        setTimeout(async () => {
          await this.fallbackShare(text, image, '小红书');
        }, 2000);
      } else {
        await this.fallbackShare(text, image, '小红书');
      }
    } catch (error) {
      await this.fallbackShare(text, image, '小红书');
    }
  }

  // Instagram分享
  private static async shareToInstagram(text: string, image: string): Promise<void> {
    try {
      if (this.isMobile()) {
        // 尝试打开Instagram App
        const appUrl = `instagram://camera`;
        window.location.href = appUrl;
        
        setTimeout(async () => {
          await this.fallbackShare(text, image, 'Instagram');
        }, 2000);
      } else {
        // 桌面端直接降级
        await this.fallbackShare(text, image, 'Instagram');
      }
    } catch (error) {
      await this.fallbackShare(text, image, 'Instagram');
    }
  }

  // Twitter分享
  private static async shareToTwitter(text: string, image: string): Promise<void> {
    try {
      // Twitter网页版分享
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      
      if (this.isMobile()) {
        // 移动端尝试打开App
        const appUrl = `twitter://post?message=${encodeURIComponent(text)}`;
        window.location.href = appUrl;
        
        setTimeout(() => {
          window.open(twitterUrl, '_blank');
        }, 2000);
      } else {
        // 桌面端直接打开网页
        window.open(twitterUrl, '_blank');
      }
      
      // 同时下载图片
      this.downloadImage(image, '旅程分享卡片.png');
      
    } catch (error) {
      await this.fallbackShare(text, image, 'Twitter');
    }
  }

  // 降级分享方案
  private static async fallbackShare(text: string, image: string, platform: string): Promise<void> {
    try {
      // 复制文案到剪贴板
      await this.copyToClipboard(text);
      
      // 下载图片
      this.downloadImage(image, '旅程分享卡片.png');
      
      // 提示用户
      alert(`📋 文案已复制到剪贴板\n🖼️ 图片已开始下载\n\n请在${platform}中粘贴文案并上传图片分享！`);
      
    } catch (error) {
      console.error('降级分享失败:', error);
      
      // 最终降级：手动提示
      const fallbackModal = this.createFallbackModal(text, image, platform);
      document.body.appendChild(fallbackModal);
    }
  }

  // 复制到剪贴板
  private static async copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // 降级方案
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('复制失败:', err);
      }
      
      document.body.removeChild(textArea);
    }
  }

  // 下载图片
  private static downloadImage(dataUrl: string, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 创建降级分享模态框
  private static createFallbackModal(text: string, image: string, platform: string): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full">
        <h3 class="text-lg font-bold mb-4">分享到${platform}</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">文案内容：</label>
            <textarea readonly class="w-full p-3 border rounded-lg text-sm h-32 resize-none">${text}</textarea>
            <button class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm w-full" onclick="navigator.clipboard?.writeText('${text.replace(/'/g, "\\'")}')">复制文案</button>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">分享图片：</label>
            <img src="${image}" alt="分享卡片" class="w-full rounded-lg border">
            <button class="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm w-full" onclick="
              const link = document.createElement('a');
              link.download = '旅程分享卡片.png';
              link.href = '${image}';
              link.click();
            ">下载图片</button>
          </div>
          <button class="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg" onclick="this.closest('.fixed').remove()">关闭</button>
        </div>
      </div>
    `;
    
    return modal;
  }

  // 工具函数
  private static isMobile(): boolean {
    return /iPhone|iPad|Android/i.test(navigator.userAgent);
  }

  private static isWechatBrowser(): boolean {
    return /MicroMessenger/i.test(navigator.userAgent);
  }

  // Web Share API 支持检测
  static isWebShareSupported(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  // 使用Web Share API（如果支持）
  static async shareWithWebAPI(data: ShareData): Promise<void> {
    if (!this.isWebShareSupported()) {
      throw new Error('Web Share API not supported');
    }

    // 转换图片为File对象
    const response = await fetch(data.image);
    const blob = await response.blob();
    const file = new File([blob], '旅程分享.png', { type: 'image/png' });

    await navigator.share({
      title: '我的旅程分享',
      text: data.text,
      files: [file]
    });
  }
}