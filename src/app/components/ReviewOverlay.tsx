import React from 'react';
import type { GrassPoint } from '@/types';
import Image from 'next/image';
import googleLogo from '@/../public/img/google.png';
import yelpLogo from '@/../public/img/yelp.png';

interface ReviewData {
  organic_results?: Array<{
    reviews?: Array<ReviewItem>;
    link?: string;
    data_id?: string;
    thumbnail?: string;
    photos?: Array<{ thumbnail?: string }>;
  }>;
  reviews?: Array<ReviewItem>;
  search_metadata?: {
    google_maps_url?: string;
  };
}

type ReviewItem = {
  author?: { name?: string };
  name?: string;
  rating?: number;
  date?: string;
  snippet?: string;
  text?: string;
};

interface ReviewOverlayProps {
  visible: boolean;
  onClose: () => void;
  point: GrassPoint | null;
  reviewData: ReviewData | null;
  reviewUrl?: string | null;
  source: 'yelp' | 'google';
}

const getSourceInfo = (source: 'yelp' | 'google') => {
  if (source === 'yelp') return { logo: yelpLogo, name: 'Yelp 评论' };
  return { logo: googleLogo, name: 'Google Maps 评论' };
};

const getShopImage = (reviewData: ReviewData | null, source: 'yelp' | 'google') => {
  if (!reviewData) return '';
  if (source === 'yelp') {
    return reviewData.organic_results?.[0]?.thumbnail || '';
  } else {
    return reviewData.organic_results?.[0]?.photos?.[0]?.thumbnail || '';
  }
};

const getAIMockReviews = (point: GrassPoint): ReviewItem[] => [
  { name: 'AI点评', rating: 5, date: '2024-06-10', text: `"${point.name}"是本地热门打卡地，环境优美，体验极佳，值得一试！` },
  { name: 'AI点评', rating: 4, date: '2024-06-09', text: `许多游客对"${point.name}"赞不绝口，服务和氛围都很棒。` }
];

const ReviewOverlay: React.FC<ReviewOverlayProps> = ({ visible, onClose, point, reviewData, reviewUrl, source }) => {
  if (!visible || !point) return null;
  const { logo, name: sourceName } = getSourceInfo(source);
  const reviews: ReviewItem[] = reviewData?.organic_results?.[0]?.reviews || reviewData?.reviews || [];
  const shopImg = getShopImage(reviewData, source);
  const displayReviews: ReviewItem[] = reviews.length ? reviews : getAIMockReviews(point);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2 md:px-0">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 relative max-h-[90vh] flex flex-col">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose} aria-label="关闭">✕</button>
        <div className="flex items-center justify-center mb-2">
          <Image src={logo} alt={sourceName} className="w-8 h-8 mr-2" width={32} height={32} />
          <span className="font-bold text-base">{sourceName}</span>
        </div>
        {shopImg && <Image src={shopImg} alt="商家图片" className="w-full h-32 object-cover rounded mb-2" width={320} height={128} />}
        <h2 className="text-lg font-bold mb-1 text-center">{point.name}</h2>
        <div className="text-xs text-gray-500 mb-3 text-center">{point.address}</div>
        <div className="flex-1 overflow-y-auto pr-1">
          {displayReviews.map((r, i) => (
            <div key={i} className="mb-2 border-b pb-2">
              <div className="font-bold">{r.author?.name || r.name || '游客'} <span className="text-yellow-500">{'★'.repeat(r.rating || 0)}</span></div>
              <div className="text-xs text-gray-500">{r.date || ''}</div>
              <div>{r.snippet || r.text || ''}</div>
            </div>
          ))}
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