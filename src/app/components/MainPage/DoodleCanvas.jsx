import React, { useRef, useState, useEffect } from "react";

const FADE_DURATION = 5000; // ms, 5秒内透明度从1降到0
const MAX_STROKES = 3;
const STROKE_COLOR = "green";
const STROKE_WIDTH = 8;

export default function DoodleCanvas() {
  const [drawing, setDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [strokes, setStrokes] = useState([]);
  const svgRef = useRef();

  // 监听鼠标/触摸事件
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const getPoint = (e) => {
      if (e.touches) {
        const touch = e.touches[0];
        const rect = svg.getBoundingClientRect();
        return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      } else {
        const rect = svg.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }
    };

    const handleStart = (e) => {
      e.preventDefault();
      setDrawing(true);
      setCurrentStroke([getPoint(e)]);
    };

    const handleMove = (e) => {
      if (!drawing) return;
      setCurrentStroke((prev) => [...prev, getPoint(e)]);
    };

    const handleEnd = () => {
      if (currentStroke.length > 1) {
        setStrokes((prev) => [
          ...prev.slice(-MAX_STROKES + 1),
          { points: currentStroke, timestamp: Date.now() },
        ]);
      }
      setCurrentStroke([]);
      setDrawing(false);
    };

    svg.addEventListener("mousedown", handleStart);
    svg.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    svg.addEventListener("touchstart", handleStart, { passive: false });
    svg.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      svg.removeEventListener("mousedown", handleStart);
      svg.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);

      svg.removeEventListener("touchstart", handleStart);
      svg.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawing, currentStroke]);

  // 透明度衰减
  useEffect(() => {
    const timer = setInterval(() => {
      setStrokes((prev) =>
        prev
          .map((stroke) => {
            const age = Date.now() - stroke.timestamp;
            const alpha = Math.max(1 - age / FADE_DURATION, 0);
            return { ...stroke, alpha };
          })
          .filter((stroke) => stroke.alpha > 0)
      );
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <svg
      ref={svgRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 20,
        pointerEvents: "auto",
        touchAction: "none",
      }}
    >
      {strokes.map((stroke, idx) => (
        <polyline
          key={idx}
          points={stroke.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
          fill="none"
          stroke={STROKE_COLOR}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={stroke.alpha ?? 1}
        />
      ))}
      {currentStroke.length > 1 && (
        <polyline
          points={currentStroke.map((pt) => `${pt.x},${pt.y}`).join(" ")}
          fill="none"
          stroke={STROKE_COLOR}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={1}
        />
      )}
    </svg>
  );
} 