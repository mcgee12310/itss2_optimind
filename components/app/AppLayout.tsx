"use client";

import ScoreWidget from "@/components/app/score-widget";
import ExtensionGuideModal from "@/components/app/ExtensionGuideModal";
import { ScoreProvider } from "@/hooks/useScore";
import { cn } from "@/lib/utils";
import { Puzzle } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_BACKGROUND =
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop";

const AppLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const [isUiVisible, setIsUiVisible] = useState<boolean>(true);
  const [showExtModal, setShowExtModal] = useState<boolean>(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetUiTimer = useCallback(() => {
    setIsUiVisible(true);
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => setIsUiVisible(false), 10000);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resetUiTimer);
    resetUiTimer();
    return () => {
      window.removeEventListener("mousemove", resetUiTimer);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetUiTimer]);

  return (
    <div
      className="h-screen w-screen text-white overflow-hidden"
      style={{
        backgroundImage: `url(${DEFAULT_BACKGROUND})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* === Score Widget (góc trái — thay logo) === */}
      {/* <ScoreWidget isUiVisible={isUiVisible} /> */}

      {/* === Extension Guide Button === */}
      <button
        onClick={() => setShowExtModal(true)}
        className={cn(
          "absolute left-2 z-30 mt-2",
          "bg-black/40 backdrop-blur-md border border-white/20 rounded-xl shadow-lg",
          "flex items-center gap-2 px-3 py-2",
          "text-xs font-medium text-white/70 hover:text-white hover:bg-black/60",
          "transition-all duration-300 ease-in-out",
          isUiVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none",
        )}
        title="Hướng dẫn cài extension chặn web"
      >
        <Puzzle className="w-4 h-4 text-indigo-400" />
        <span>Cài Extension</span>
      </button>

      {children}

      <ExtensionGuideModal open={showExtModal} onOpenChange={setShowExtModal} />
    </div>
  );
};

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ScoreProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ScoreProvider>
  );
}
