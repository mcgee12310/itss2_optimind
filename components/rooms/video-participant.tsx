

"use client";

import { ParticipantView } from "@stream-io/video-react-sdk";
import { cn } from "@/lib/utils";
import { Mic, MicOff, VideoOff, User } from "lucide-react";

interface VideoParticipantProps {
  participant: any;
  score?: number;
  showScore?: boolean;
  className?: string;
}

const CustomVideoPlaceholder = ({ participant }: { participant: any }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#18181b] z-10 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 opacity-80">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
            <User className="w-10 h-10 text-white/50" />
          </div>
          <div className="absolute bottom-0 right-0 p-2 bg-red-600 rounded-full border-4 border-[#18181b]">
            <VideoOff className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-white/90 tracking-wide">
            {participant.name || participant.userId}
          </p>
          <p className="text-xs text-white/40 mt-1 font-medium uppercase tracking-wider">Camera Off</p>
        </div>
      </div>
    </div>
  );
};

export const VideoParticipant = ({
  participant,
  score = 0,
  showScore = false,
  className
}: VideoParticipantProps) => {
  const { isSpeaking, isLocalParticipant } = participant;
  // Logic hiển thị Mic: Tắt là Tắt, không nói nhiều
  const isMicOff = participant.isPublishingAudio === false;

  return (
    <div className={cn(
      "relative w-full h-full bg-[#1e1e1e] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group border border-white/5 ring-1 ring-black/20",
      className
    )}>

      <ParticipantView
        participant={participant}
        VideoPlaceholder={CustomVideoPlaceholder}
        className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_video]:scale-105"
      />

      {/* Gradient tối ở dưới để làm nổi tên */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-20" />

      {/* --- TRẠNG THÁI MIC --- */}
      {isMicOff ? (
        <div className="absolute top-4 left-4 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 bg-red-600/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-red-500/50 backdrop-blur-md">
            <MicOff className="w-3.5 h-3.5" />
            <span>MUTED</span>
          </div>
        </div>
      ) : isSpeaking && (
        <div className="absolute top-4 left-4 z-30 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 bg-emerald-600/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-emerald-500/50 backdrop-blur-md">
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span>SPEAKING</span>
          </div>
        </div>
      )}

      {/* --- TÊN NGƯỜI DÙNG --- */}
      <div className="absolute bottom-4 left-4 z-30 max-w-[85%]">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-xl border transition-all duration-300 shadow-sm",
          isSpeaking
            ? "bg-blue-600/80 border-blue-400/50 shadow-blue-500/20"
            : "bg-black/40 border-white/10"
        )}>
          <span className="text-white text-xs font-semibold truncate tracking-wide drop-shadow-md">
            {participant.name || participant.userId}
            {isLocalParticipant && " (Bạn)"}
          </span>
        </div>
      </div>

      {/* --- ĐIỂM SỐ (Battle) --- */}
      {showScore && (
        <div className="absolute top-4 right-4 z-30">
          <div className={cn(
            "px-3 py-1.5 rounded-full font-bold text-xs backdrop-blur-xl border shadow-lg transition-colors tracking-wider",
            score >= 80 ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
              score >= 50 ? "bg-amber-500/20 border-amber-500 text-amber-400" :
                "bg-rose-500/20 border-rose-500 text-rose-400"
          )}>
            {Math.round(score)} PTS
          </div>
        </div>
      )}

      {/* Viền sáng khi đang nói */}
      <div className={cn(
        "absolute inset-0 border-[3px] rounded-3xl pointer-events-none z-40 transition-opacity duration-200",
        isSpeaking ? "border-blue-500 opacity-100" : "border-transparent opacity-0"
      )} />
    </div>
  );
};