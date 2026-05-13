"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FocusEstimator } from "@/lib/focus-estimator";

/**
 * useEngagementAnalyzer
 *
 * Self-contained hook:
 *  - Opens the camera internally (attaches to a videoRef it owns)
 *  - Loads MediaPipe FaceLandmarker once
 *  - Runs detection loop (~10 fps) via requestAnimationFrame + throttle
 *  - Calls onScoreUpdate every ~1 second (real-time, via ref)
 *  - Stops everything when isActive=false
 */
export function useEngagementAnalyzer(
  isActive: boolean,
  onScoreUpdate?: (score: number) => void
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [focusScore, setFocusScore] = useState<number>(0);
  const [status, setStatus] = useState<string>("Đang khởi tạo...");
  const [engaged, setEngaged] = useState<boolean>(false);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  // Refs — avoid stale-closure bugs
  const focusEstimatorRef = useRef<FocusEstimator>(new FocusEstimator());
  const faceMeshRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const isActiveRef = useRef<boolean>(isActive);
  const onScoreUpdateRef = useRef<((score: number) => void) | undefined>(onScoreUpdate);
  const lastDetectionRef = useRef<number>(0);
  const lastUIUpdateRef = useRef<number>(0);
  const noFaceCountRef = useRef<number>(0);
  const focusScoreRef = useRef<number>(0);
  const meshReadyRef = useRef<boolean>(false);

  // Keep refs in sync
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { onScoreUpdateRef.current = onScoreUpdate; }, [onScoreUpdate]);

  const DETECTION_INTERVAL_MS = 100;  // ~10 fps — enough for accuracy, not heavy
  const UI_UPDATE_INTERVAL_MS = 1000; // push to chart/UI once per second (real wall-clock second)
  const NO_FACE_DECAY = 0.90;

  function evaluateEngagement(score: number) {
    return score >= 60;
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
      return true;
    } catch (e) {
      console.error("[Analyzer] Camera error:", e);
      setStatus("❌ Không truy cập được camera");
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  }, []);

  // ── MediaPipe ─────────────────────────────────────────────────────────────
  const loadFaceMesh = useCallback(async () => {
    try {
      setStatus("⏳ Đang tải MediaPipe...");
      const vision = await import("@mediapipe/tasks-vision" as const);
      const { FilesetResolver, FaceLandmarker } = vision as any;

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
      meshReadyRef.current = true;

      // Faster EMA for more responsive display
      try { focusEstimatorRef.current.setSmoothing(0.5); } catch { }

      setStatus("📷 Đã sẵn sàng - Quay vào camera");
    } catch (err) {
      console.error("[Analyzer] Load error:", err);
      setStatus("❌ Lỗi khởi tạo MediaPipe");
    }
  }, []);

  // ── Detection Loop ────────────────────────────────────────────────────────
  const startLoop = useCallback(() => {
    const loop = async () => {
      if (!isActiveRef.current) return;

      const video = videoRef.current;
      const faceMesh = faceMeshRef.current;

      if (video && faceMesh && video.readyState >= 2) {
        const now = Date.now();

        if (now - lastDetectionRef.current >= DETECTION_INTERVAL_MS) {
          lastDetectionRef.current = now;

          try {
            const result = await faceMesh.detectForVideo(video, performance.now());
            const faces = result?.faceLandmarks || [];

            if (!faces.length) {
              noFaceCountRef.current++;
              // Decay score when no face
              if (now - lastUIUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
                lastUIUpdateRef.current = now;
                const next = Math.round(focusScoreRef.current * NO_FACE_DECAY);
                focusScoreRef.current = next;
                setFocusScore(next);
                setEngaged(false);
                setStatus("📭 Không phát hiện khuôn mặt");
                onScoreUpdateRef.current?.(next);
              }
            } else {
              noFaceCountRef.current = 0;
              const landmarks = faces[0];

              if (Array.isArray(landmarks) && landmarks.length >= 468) {
                const score = focusEstimatorRef.current.estimate(landmarks);
                focusScoreRef.current = score;

                // Update UI exactly once per real second
                if (now - lastUIUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
                  lastUIUpdateRef.current = now;
                  const isEng = evaluateEngagement(score);
                  setFocusScore(score);
                  setEngaged(isEng);
                  setStatus(isEng ? `✓ Tập trung (${score}/100)` : `✗ Không tập trung (${score}/100)`);
                  onScoreUpdateRef.current?.(score);
                }
              }
            }
          } catch (err) {
            console.error("[Analyzer] Detection error:", err);
          }
        }
      }

      if (isActiveRef.current) {
        animationIdRef.current = requestAnimationFrame(loop);
      }
    };

    animationIdRef.current = requestAnimationFrame(loop);
  }, []);

  const stopLoop = useCallback(() => {
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
  }, []);

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  // Load MediaPipe once on mount
  useEffect(() => {
    loadFaceMesh();
    return () => {
      stopLoop();
      stopCamera();
    };
  }, []);

  // Start / stop camera + loop when isActive changes
  useEffect(() => {
    if (isActive) {
      // Camera might not be open yet
      if (!streamRef.current) {
        startCamera().then((ok) => {
          if (ok && meshReadyRef.current) startLoop();
        });
      } else if (meshReadyRef.current) {
        startLoop();
      }
    } else {
      stopLoop();
      stopCamera();
      focusEstimatorRef.current.reset();
      focusScoreRef.current = 0;
      setFocusScore(0);
      setEngaged(false);
      setStatus("📷 Camera đã tắt");
    }
  }, [isActive]);

  // Once mesh is ready AND camera is ready AND isActive, start loop
  useEffect(() => {
    if (cameraReady && meshReadyRef.current && isActive) {
      startLoop();
    }
  }, [cameraReady]);

  return {
    videoRef,   // attach to <video> element in the component
    focusScore,
    status,
    engaged,
    cameraReady,
  };
}
