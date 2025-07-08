import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * 记录埋点事件
 * @param event 事件名，如 visit_home、generate_plan、check_in、fetch_review、chat、weather_popup、feedback、error
 * @param data  事件相关数据对象
 */
export async function logEvent(event: string, data: Record<string, unknown>) {
  try {
    await addDoc(collection(db, 'events'), {
      event,
      ...data,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // 仅开发环境打印，生产环境静默
    if (process.env.NODE_ENV !== 'production') {
      console.warn('埋点失败', e);
    }
  }
} 