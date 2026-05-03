"use client";

import { useEffect, useRef, useState, useCallback, FC } from "react";
import { cn } from "@/lib/utils";
import { Video, VideoOff } from "lucide-react";

const MIN_W = 160;
const MIN_H = 120;
const DEFAULT_W = 240;
const DEFAULT_H = 180;

const CameraWidget: FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isOn, setIsOn] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });

  // Gán srcObject sau khi video element đã render
  useEffect(() => {
    if (isOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isOn]);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setHasPermission(true);
      setIsOn(true);
    } catch {
      setHasPermission(false);
      setIsOn(true); // vẫn mở để hiện thông báo lỗi
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // === Resize (góc phải dưới) ===
  const resizeRef = useRef<{ mx: number; my: number; w: number; h: number } | null>(null);

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = { mx: e.clientX, my: e.clientY, w: size.w, h: size.h };

      const onMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        setSize({
          w: Math.max(MIN_W, resizeRef.current.w + ev.clientX - resizeRef.current.mx),
          h: Math.max(MIN_H, resizeRef.current.h + ev.clientY - resizeRef.current.my),
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
    [size]
  );

  return (
    // Luôn giữ nguyên kích thước dù bật hay tắt
    <div
      style={{ width: size.w, height: size.h, flexShrink: 0, position: "relative" }}
      className={cn(
        "rounded-2xl border border-white/20 shadow-xl overflow-hidden",
        "bg-black/50 backdrop-blur-md"
      )}
    >
      {isOn && hasPermission !== false ? (
        /* === Video feed === */
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
      ) : (
        /* === Placeholder khi tắt hoặc không có quyền === */
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/30">
          {hasPermission === false ? (
            <>
              <VideoOff className="w-8 h-8" />
              <span className="text-xs text-center px-3">Không có quyền camera</span>
            </>
          ) : (
            <VideoOff className="w-10 h-10 opacity-20" />
          )}
        </div>
      )}

      {/* Nút Bật/Tắt — góc trên phải, luôn hiển thị */}
      <button
        onClick={isOn ? stopCamera : startCamera}
        className={cn(
          "absolute top-2 right-2 z-10",
          "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all",
          "backdrop-blur-sm",
          isOn
            ? "bg-red-500/70 hover:bg-red-600/80 text-white"
            : "bg-white/20 hover:bg-white/30 text-white/80"
        )}
      >
        {isOn
          ? <><VideoOff className="w-3 h-3" /> Tắt</>
          : <><Video className="w-3 h-3" /> Bật</>
        }
      </button>

      {/* Resize handle góc phải dưới */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-10"
        style={{
          background: "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.25) 50%)",
        }}
      />
    </div>
  );
};

export default CameraWidget;
