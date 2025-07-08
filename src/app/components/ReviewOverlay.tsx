import React from 'react';
import type { GrassPoint } from '@/types';

interface ReviewOverlayProps {
  visible: boolean;
  onClose: () => void;
  point: GrassPoint | null;
  reviewData: any;
  reviewUrl?: string | null;
}

const ReviewOverlay: React.FC<ReviewOverlayProps> = ({ visible, onClose, point, reviewData, reviewUrl }) => {
  if (!visible || !point) return null;
  // 解析评论内容
  const reviews = reviewData?.organic_results?.[0]?.reviews || reviewData?.reviews || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2 md:px-0">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 relative max-h-[90vh] flex flex-col">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose} aria-label="关闭">✕</button>
        <h2 className="text-lg font-bold mb-1 text-center">{point.name}</h2>
        <div className="text-xs text-gray-500 mb-3 text-center">{point.address}</div>
        <div className="flex-1 overflow-y-auto pr-1">
          {reviews.length ? reviews.map((r: any, i: number) => (
            <div key={i} className="mb-2 border-b pb-2">
              <div className="font-bold">{r.author?.name || '游客'} <span className="text-yellow-500">{'★'.repeat(r.rating || 0)}</span></div>
              <div className="text-xs text-gray-500">{r.date || ''}</div>
              <div>{r.snippet || r.text || ''}</div>
            </div>
          )) : <div className="text-center text-gray-400">暂无评论</div>}
        </div>
        {reviewUrl && (
          <div className="mt-3 text-center">
            <a href={reviewUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors">查看原评论</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewOverlay; 