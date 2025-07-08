import React, { useState } from 'react';
import type { GrassPoint } from '@/types';
import { GRASS_POINT_TYPES } from '@/constants/prompts';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import styles from './GrassMap.module.css';

interface RouteListPanelProps {
  grassPoints: GrassPoint[];
  onToggleComplete?: (pointId: string) => void;
  onReorder?: (newOrder: GrassPoint[]) => void;
  onTimeChange?: (pointId: string, newTime: string) => void;
  onStatusChange?: (pointId: string, status: 'liked' | 'disliked' | 'none') => void;
  onPhoto?: (pointId: string, photoUrl: string) => void;
  onCommentChange?: (pointId: string, comment: { text: string; time: string }) => void;
}

function SortableItem({ point, index, onToggleComplete, onTimeChange, editingId, setEditingId, editTime, setEditTime, onStatusChange, onPhoto, onCommentChange }: {
  point: GrassPoint;
  index: number;
  onToggleComplete?: (pointId: string) => void;
  onTimeChange?: (pointId: string, newTime: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editTime: string;
  setEditTime: (time: string) => void;
  onStatusChange?: (pointId: string, status: 'liked' | 'disliked' | 'none') => void;
  onPhoto?: (pointId: string, photoUrl: string) => void;
  onCommentChange?: (pointId: string, comment: { text: string; time: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: point.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  const typeInfo = GRASS_POINT_TYPES[point.type] || GRASS_POINT_TYPES['其他'];
  const [showComment, setShowComment] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(point.photoUrl || '');
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // 摄像头相关
  const handleStartCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      }, 100);
    } catch {
      alert('无法访问摄像头');
    }
  };
  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 160, 120);
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setPhotoPreview(dataUrl);
        onPhoto?.(point.id, dataUrl);
        setShowCamera(false);
        if (stream) stream.getTracks().forEach(track => track.stop());
      }
    }
  };
  const handleCloseCamera = () => {
    setShowCamera(false);
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`p-4 rounded-xl border cursor-pointer transition-all mb-2 bg-white border-gray-200 hover:border-gray-300 hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all bg-gray-100 cursor-grab"
          {...listeners}
        >
          {index + 1} {point.status === 'liked' && <span className="ml-1">🌱</span>}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium ${point.completed ? 'line-through text-gray-500' : ''}`}>{point.name}</h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}>{point.type}</span>
            {point.completed && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">已完成</span>
            )}
          </div>
          {point.description && (
            <p className="text-sm text-gray-600 mb-2">{point.description}</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            {/* 种草/拔草按钮 */}
            <button
              className={`px-2 py-1 rounded text-xs font-medium border ${point.status === 'liked' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'}`}
              onClick={e => { e.stopPropagation(); onStatusChange?.(point.id, point.status === 'liked' ? 'none' : 'liked'); if (point.status !== 'liked') handleStartCamera(); }}
            >🌱 种草</button>
            <button
              className={`px-2 py-1 rounded text-xs font-medium border ${point.status === 'disliked' ? 'bg-orange-100 text-orange-700 border-orange-400' : 'bg-white text-gray-600 border-gray-300 hover:bg-orange-50'}`}
              onClick={e => { e.stopPropagation(); onStatusChange?.(point.id, point.status === 'disliked' ? 'none' : 'disliked'); }}
            >🥀 拔草</button>
            {/* 拍照预览 */}
            {photoPreview && (
              <Image src={photoPreview} alt="拍照" width={40} height={32} className="w-10 h-8 object-cover rounded ml-2 border" />
            )}
          </div>
          {/* 摄像头弹窗 */}
          {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
                <video ref={videoRef} width={160} height={120} autoPlay className="rounded border mb-2" />
                <canvas ref={canvasRef} width={160} height={120} style={{ display: 'none' }} />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleTakePhoto} className="px-3 py-1 bg-blue-500 text-white rounded">拍照</button>
                  <button onClick={handleCloseCamera} className="px-3 py-1 bg-gray-300 rounded">取消</button>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 flex-1">
              📍 {point.address}
              {point.lat && point.lng && (
                <span className="text-green-600 ml-2">✓ 有坐标</span>
              )}
              {/* 时间显示/编辑 */}
              {editingId === point.id ? (
                <input
                  value={editTime}
                  onChange={e => setEditTime(e.target.value)}
                  onBlur={() => { onTimeChange?.(point.id, editTime); setEditingId(null); }}
                  onKeyDown={e => { if (e.key === 'Enter') { onTimeChange?.(point.id, editTime); setEditingId(null); } }}
                  className="ml-2 border px-1 w-24 text-blue-500"
                  autoFocus
                />
              ) : (
                <span
                  onClick={e => { e.stopPropagation(); setEditingId(point.id); setEditTime(point.time || ''); }}
                  className="ml-2 text-blue-500 cursor-pointer"
                  title="点击编辑时间"
                >
                  🕒 {point.time || '设置时间'}
                </span>
              )}
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleComplete?.(point.id);
              }}
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 ml-2"
            >
              {point.completed ? '撤销' : '完成'}
            </button>
            {/* 评论按钮 */}
            <button
              className="ml-2 text-xs text-gray-500 underline"
              onClick={e => { e.stopPropagation(); setShowComment(v => !v); }}
            >{showComment ? '收起评论' : '评论'}</button>
          </div>
          {/* 评论输入框 */}
          {showComment && (
            <div className="mt-2">
              <textarea
                className="w-full border rounded p-1 text-xs"
                rows={2}
                placeholder="写下你的评论..."
                value={commentDraft}
                onChange={e => setCommentDraft(e.target.value)}
              />
              <div className="text-right">
                <button
                  className="text-xs text-blue-500 mt-1"
                  onClick={() => { onCommentChange?.(point.id, { text: commentDraft, time: new Date().toISOString() }); setCommentDraft(''); setShowComment(false); }}
                >发送</button>
              </div>
            </div>
          )}
          {/* 评论内容气泡显示 */}
          {Array.isArray(point.comments) && point.comments.length > 0 && (
            <div className="mt-2 space-y-1">
              {point.comments.map((c, i) => (
                <div key={i} className="p-2 bg-gray-50 rounded text-xs text-gray-700 border flex items-start gap-2">
                  <span style={{ fontSize: '1.1em' }}>💬</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const RouteListPanel: React.FC<RouteListPanelProps> = ({
  grassPoints,
  onToggleComplete,
  onReorder,
  onTimeChange,
  onStatusChange,
  onPhoto,
  onCommentChange
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = grassPoints.findIndex(i => i.id === active.id);
      const newIndex = grassPoints.findIndex(i => i.id === over?.id);
      const newOrder = arrayMove(grassPoints, oldIndex, newIndex);
      onReorder?.(newOrder);
    }
  }

  return (
    <div className={`bg-[url('/img/paper-texture-4.png')] bg-cover shadow-lg transition-all duration-300 h-full overflow-y-auto`}> 
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className={styles.bananaFont + ' text-2xl'}>路线列表</h2>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={grassPoints.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="px-4 pb-4">
            {grassPoints.map((point, index) => (
              <SortableItem
                key={point.id}
                point={point}
                index={index}
                onToggleComplete={onToggleComplete}
                onTimeChange={onTimeChange}
                editingId={editingId}
                setEditingId={setEditingId}
                editTime={editTime}
                setEditTime={setEditTime}
                onStatusChange={onStatusChange}
                onPhoto={onPhoto}
                onCommentChange={onCommentChange}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default RouteListPanel; 