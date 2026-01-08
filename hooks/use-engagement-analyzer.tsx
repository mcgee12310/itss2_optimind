"use client";

import React, { useRef, useEffect, useState } from "react";
import { FocusEstimator } from "@/lib/focus-estimator";

interface VideoEngagementAnalyzerProps {
  onScoreUpdate?: (score: number) => void;
  isActive?: boolean;
}

export default function VideoEngagementAnalyzer({ onScoreUpdate, isActive = true }: VideoEngagementAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>("Đang khởi tạo...");
  const [engaged, setEngaged] = useState<boolean | null>(null);
  const [focusScore, setFocusScore] = useState<number>(100);
  const [isCalibrated, setIsCalibrated] = useState<boolean>(false);
  const focusEstimatorRef = useRef<FocusEstimator>(new FocusEstimator());
  
  // Refs để điều khiển processing
  const isProcessingRef = useRef<boolean>(false);
  const animationIdRef = useRef<number | null>(null);
  const faceMeshRef = useRef<any>(null);
  const lastScoreUpdateTimeRef = useRef<number>(0);
  const lastDetectionTimeRef = useRef<number>(0);
  const SCORE_UPDATE_INTERVAL = 1000;
  const DETECTION_INTERVAL = 100; // Throttle: chỉ detect mỗi 100ms (~10fps) thay vì 60fps
  const NO_FACE_PENALTY = 100; // Trừ mạnh khi không thấy khuôn mặt

  // Rule: Nếu mắt nhìn vào camera và không chớp mắt quá nhiều => Engaged
  function evaluateEngagement(score: number): boolean {
    return score >= 65; // Giảm từ 70 -> 65 (phù hợp với penalty mới nghiêm ngặt hơn)
  }

  // Callback xử lý kết quả phân tích
  const onResults = (results: any) => {
    const faces = results?.faceLandmarks || [];
    // Nếu không phát hiện khuôn mặt: trừ điểm mạnh và cập nhật chart mỗi tick
    if (!faces.length) {
      const now = Date.now();
      if (now - lastScoreUpdateTimeRef.current >= SCORE_UPDATE_INTERVAL) {
        lastScoreUpdateTimeRef.current = now;
        const next = Math.max(0, focusScore - NO_FACE_PENALTY);
        setFocusScore(next);
        setEngaged(false);
        if (onScoreUpdate) onScoreUpdate(next);
      }
      return;
    }
    const faceLandmarks = faces[0];
    
    // Tính điểm tập trung bằng FocusEstimator (mỗi frame để tích lũy data)
    const score = focusEstimatorRef.current.estimate(faceLandmarks);
    
    // Chỉ cập nhật UI mỗi 1 giây
    const now = Date.now();
    if (now - lastScoreUpdateTimeRef.current >= SCORE_UPDATE_INTERVAL) {
      lastScoreUpdateTimeRef.current = now;
      
      setFocusScore(score);
      
      // Đánh giá trạng thái tập trung
      const isEngaged = evaluateEngagement(score);
      setEngaged(isEngaged);
      setStatus(isEngaged ? `Đang tập trung (${score}/100)` : `Không tập trung (${score}/100)`);
      if (onScoreUpdate) onScoreUpdate(score);
    }

    // ❌ LOẠI BỎ: Vẽ landmarks lên canvas vì component bị ẩn và gây lag
    // if (canvasRef.current && videoRef.current) {
    //   const ctx = canvasRef.current.getContext("2d");
    //   if (ctx) {
    //     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    //     ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    //     const isEngaged = evaluateEngagement(score);
    //     ctx.fillStyle = isEngaged ? "#00ff00" : "#ff0000";
    //     faceLandmarks.forEach((lm: any) => {
    //       ctx.beginPath();
    //       if (canvasRef.current) {
    //         ctx.arc(lm.x * canvasRef.current.width, lm.y * canvasRef.current.height, 2, 0, 2 * Math.PI);
    //       }
    //       ctx.fill();
    //     });
    //   }
    // }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60 },
            facingMode: "user",
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus("Đã bật camera, đang tải Mediapipe...");
        await loadFaceMesh();
      } catch (e) {
        console.error("[Engagement] Lỗi truy cập camera:", e);
        setStatus("LỖI: Không truy cập được camera. Vui lòng cấp quyền.");
      }
    };

    // Tải Mediapipe Tasks Vision FaceLandmarker (tránh lỗi Module.arguments)
    const loadFaceMesh = async () => {
      try {
        const vision = await import("@mediapipe/tasks-vision" as const);
        const { FilesetResolver, FaceLandmarker } = vision as any;
        if (!FilesetResolver || !FaceLandmarker) {
          console.error("[Engagement] Không tìm thấy FaceLandmarker trong tasks-vision", vision);
          setStatus("LỖI: FaceLandmarker không khả dụng");
          return;
        }

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const faceMesh = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        faceMeshRef.current = faceMesh;
        setupFaceMesh();
      } catch (err) {
        console.error("[Engagement] Lỗi load FaceLandmarker:", err);
        setStatus("LỖI: Không khởi tạo được FaceLandmarker");
      }
    };

    const setupFaceMesh = () => {
      setStatus("Sẵn sàng nhận diện khuôn mặt");
      // Nếu isActive đã true, bắt đầu ngay
      if (isActive) {
        isProcessingRef.current = true;
      }
    };

    // Tăng độ nhạy của điểm số (phản ứng nhanh hơn)
    try {
      focusEstimatorRef.current.setSmoothing(0.7);
    } catch (e) {
      // ignore runtime override errors
    }

    startCamera();

    return () => {
      isProcessingRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Effect riêng để điều khiển start/stop khi isActive thay đổi
  useEffect(() => {
    const processFrame = async () => {
      if (!isActive || !isProcessingRef.current) {
        return;
      }

      if (videoRef.current && faceMeshRef.current) {
        const now = Date.now();
        // Throttle: chỉ chạy detectForVideo mỗi 100ms (~10fps)
        if (now - lastDetectionTimeRef.current >= DETECTION_INTERVAL) {
          lastDetectionTimeRef.current = now;
          const video = videoRef.current;
          const perfNow = performance.now();
          try {
            const result = await faceMeshRef.current.detectForVideo(video, perfNow);
            onResults(result);
          } catch (err) {
            console.error("[Engagement] Lỗi phân tích frame:", err);
          }
        }
      }
      
      if (isActive && isProcessingRef.current) {
        animationIdRef.current = requestAnimationFrame(processFrame);
      }
    };

    if (isActive && faceMeshRef.current) {
      if (!isProcessingRef.current) {
        isProcessingRef.current = true;
      }
      animationIdRef.current = requestAnimationFrame(processFrame);
    } else if (!isActive && isProcessingRef.current) {
      isProcessingRef.current = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    }

    return () => {
      if (!isActive && animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [isActive, onResults]);

  return (
    <div
      style={{
        position: "relative",
        width: 320,
        height: 240,
        minWidth: 320,
        minHeight: 240,
        backgroundColor: "#000",
        overflow: "hidden",
        borderRadius: 12,
      }}
    >
      <video
        ref={videoRef}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
}
