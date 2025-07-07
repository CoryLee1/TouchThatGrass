import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";

const FADE_DURATION = 2000; // ms
const MAX_STROKES = 3;
const BRUSH_IMAGE_URL = "/img/brush-texture.png"; // 需准备毛笔/水彩纹理图片

export default function DoodleCanvasFabric() {
  const canvasRef = useRef();
  const fabricRef = useRef();
  const strokesRef = useRef([]);

  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      backgroundColor: "transparent",
      selection: false,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    fabricRef.current = fabricCanvas;

    // 加载毛笔/水彩纹理
    fabric.Image.fromURL(BRUSH_IMAGE_URL, (img) => {
      const textureBrush = new fabric.PatternBrush(fabricCanvas);
      textureBrush.source = img.getElement();
      textureBrush.width = 16; // 粗细
      fabricCanvas.freeDrawingBrush = textureBrush;
    });

    // 监听绘制结束
    fabricCanvas.on("path:created", (e) => {
      const now = Date.now();
      const path = e.path;
      path.timestamp = now;
      path.alpha = 1;
      strokesRef.current.push(path);

      // 只保留最近3笔
      while (strokesRef.current.length > MAX_STROKES) {
        const old = strokesRef.current.shift();
        fabricCanvas.remove(old);
      }
    });

    // 透明度衰减
    const timer = setInterval(() => {
      const now = Date.now();
      strokesRef.current.forEach((path) => {
        const age = now - path.timestamp;
        const alpha = Math.max(1 - age / FADE_DURATION, 0);
        path.set({ opacity: alpha });
        if (alpha === 0) {
          fabricCanvas.remove(path);
        }
      });
      strokesRef.current = strokesRef.current.filter((p) => p.opacity > 0);
      fabricCanvas.requestRenderAll();
    }, 50);

    return () => {
      clearInterval(timer);
      fabricCanvas.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 20,
        touchAction: "none",
      }}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
} 