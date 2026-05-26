"use client";

import { useRef, useState, useCallback, useEffect, FC } from "react";
import { cn } from "@/lib/utils";
import { Video, VideoOff } from "lucide-react";
import { useEngagementAnalyzer } from "@/hooks/useEngagementAnalyzer";

const MIN_W = 160;
const MIN_H = 120;
const DEFAULT_W = 320;
const DEFAULT_H = 240;

interface CameraWidgetProps {
  onScoreUpdate?: (score: number) => void;
}

const CameraWidget: FC<CameraWidgetProps> = ({ onScoreUpdate }) => {
  const [isOn, setIsOn] = useState(false);
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });

  // The hook owns the camera stream and video element ref
  const { videoRef, focusScore, status, engaged, cameraReady } =
    useEngagementAnalyzer(isOn, onScoreUpdate);

  const toggleCamera = useCallback(() => {
    setIsOn((prev) => !prev);
  }, []);

  // === Resize (góc phải dưới) ===
  const resizeRef = useRef<{
    mx: number;
    my: number;
    w: number;
    h: number;
  } | null>(null);

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        mx: e.clientX,
        my: e.clientY,
        w: size.w,
        h: size.h,
      };

      const onMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        setSize({
          w: Math.max(
            MIN_W,
            resizeRef.current.w + ev.clientX - resizeRef.current.mx,
          ),
          h: Math.max(
            MIN_H,
            resizeRef.current.h + ev.clientY - resizeRef.current.my,
          ),
        });
      };
      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [size],
  );

  return (
    <div
      style={{
        width: size.w,
        height: size.h,
        flexShrink: 0,
        position: "relative",
      }}
      className={cn(
        "rounded-2xl border border-white/20 shadow-lg overflow-hidden",
        "bg-black/50",
      )}
    >
      {/* Video element — always mounted so the hook's ref can attach */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isOn && cameraReady ? "opacity-100" : "opacity-0"
        )}
        style={{ transform: "scaleX(-1)" }}
      />

      {/* Placeholder when camera is off or loading */}
      {(!isOn || !cameraReady) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/30">
          <VideoOff className="w-10 h-10 opacity-30" />
          {isOn && !cameraReady && (
            <span className="text-xs text-center px-3 text-white/50 animate-pulse">
              Đang khởi tạo...
            </span>
          )}
        </div>
      )}

      {/* Toggle button — top-right */}
      <button
        onClick={toggleCamera}
        className={cn(
          "absolute top-2 right-2 z-10",
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all",
          "backdrop-blur-sm",
          isOn
            ? "bg-red-500/70 hover:bg-red-600/80 text-white"
            : "bg-white/20 hover:bg-white/30 text-white/80",
        )}
      >
        {isOn ? (
          <>
            <VideoOff className="w-3 h-3" /> Tắt
          </>
        ) : (
          <>
            <Video className="w-3 h-3" /> Bật
          </>
        )}
      </button>

      {/* Focus Score — top-left, only when running */}
      {isOn && cameraReady && (
        <div
          className={cn(
            "absolute top-2 left-2 z-10 px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-sm",
            "transition-all duration-300",
            engaged
              ? "bg-green-500/70 text-white"
              : "bg-yellow-500/70 text-white"
          )}
        >
          {focusScore}/100
        </div>
      )}

      {/* Status text — bottom-left */}
      {isOn && cameraReady && (
        <div className="absolute bottom-2 left-2 z-10 text-xs text-white/60 backdrop-blur-sm px-2 py-1 bg-black/30 rounded">
          {status}
        </div>
      )}

      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-10"
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.25) 50%)",
        }}
      />
    </div>
  );
};

export default CameraWidget;
