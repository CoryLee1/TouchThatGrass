import { logEvent } from './analytics';
import { getIpInfo } from './ipinfo';

let ipInfoCache: Record<string, unknown> | null = null;

async function handleClick(e: MouseEvent) {
  if (!(e.target instanceof Element)) return;
  const element = e.target as Element;
  const x = e.clientX;
  const y = e.clientY;
  const page = window.location.pathname;
  const tag = element.tagName;
  const id = element.id;
  const className = element.className?.toString?.() || '';

  if (!ipInfoCache) ipInfoCache = await getIpInfo();

  logEvent('click', {
    page,
    x,
    y,
    tag,
    id,
    className,
    ...(ipInfoCache || {}),
  });
}

export function enableHeatmapTracking() {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClick, true);
  }
} 