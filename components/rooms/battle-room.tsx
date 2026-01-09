"use client";

import { useEffect, useState } from "react";
import { 
  useStreamVideoClient, 
  StreamCall, 
  Call,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import Loader from "./loader";
import { VideoParticipant } from "./video-participant";
import type { Participant } from "@stream-io/video-client/dist/src/gen/video/sfu/models/models";
import { 
  Mic, MicOff, Video, VideoOff, Phone, 
  Users, X, Clock, Shield, Copy, Check,
  Maximize2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// --- Styles chung cho hiệu ứng Glassmorphism ---
const glassPanel = "bg-black/40 backdrop-blur-md border border-white/10 shadow-xl";
const glassButton = "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200 border border-white/5";

const StudyControls = ({ onLeave, onTogglePeople }: { onLeave: () => void; onTogglePeople: () => void }) => {
  const { useMicrophoneState, useCameraState, useParticipants } = useCallStateHooks();
  
  const { microphone, optimisticIsMute: isMicMuted } = useMicrophoneState();
  const { camera, optimisticIsMute: isCamMuted } = useCameraState();
  const participants = useParticipants();

  return (
    <div className={cn("flex items-center gap-3 px-6 py-3 rounded-full", glassPanel)}>
      {/* Time Display */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full text-white/80 text-xs font-medium border border-white/5">
        <Clock className="w-3.5 h-3.5" />
        <span>{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="w-px h-6 bg-white/20 mx-1" />

      {/* MIC */}
      <button
        onClick={() => microphone.toggle()}
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-full shadow-lg",
          isMicMuted 
            ? "bg-red-500/80 hover:bg-red-600 text-white ring-2 ring-red-500/30" 
            : glassButton
        )}
        title={isMicMuted ? "Bật mic" : "Tắt mic"}
      >
        {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* CAM */}
      <button
        onClick={() => camera.toggle()}
        className={cn(
          "flex items-center justify-center w-11 h-11 rounded-full shadow-lg",
          isCamMuted
            ? "bg-red-500/80 hover:bg-red-600 text-white ring-2 ring-red-500/30"
            : glassButton
        )}
        title={isCamMuted ? "Bật camera" : "Tắt camera"}
      >
        {isCamMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </button>

      <div className="w-px h-6 bg-white/20 mx-1" />

      {/* People Button */}
      <button 
        onClick={onTogglePeople}
        className={cn("flex items-center gap-2 px-4 py-2.5 rounded-full", glassButton)}
        title="Xem danh sách người tham gia"
      >
        <Users className="w-5 h-5" />
        <span className="hidden sm:inline font-medium text-sm">{participants.length}</span>
      </button>

      {/* LEAVE BUTTON */}
      <button 
        onClick={onLeave} 
        className="flex items-center gap-2 bg-red-600/90 hover:bg-red-700 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg active:scale-95 ml-2"
        title="Rời phòng"
      >
        <Phone className="w-5 h-5 rotate-[135deg]" />
      </button>
    </div>
  );
};

const PeopleSidebar = ({ isOpen, onClose, roomId }: { isOpen: boolean; onClose: () => void; roomId: string }) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [copied, setCopied] = useState(false);
  
  const uniqueParticipants = Array.from(new Map(participants.map(p => [p.userId, p])).values());

  const copyRoomLink = () => {
    const link = `${window.location.origin}/rooms/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] lg:hidden"
        onClick={onClose}
      />
      
      <div className={cn(
        "fixed right-4 top-24 bottom-24 w-80 rounded-2xl z-[70] flex flex-col overflow-hidden",
        "animate-in slide-in-from-right duration-300",
        glassPanel
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <div>
            <h2 className="text-base font-bold text-white">Thành viên</h2>
            <p className="text-xs text-white/60">{uniqueParticipants.length} đang online</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Copy Room Link */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={copyRoomLink}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-indigo-500/80 hover:bg-indigo-600 rounded-xl transition-colors backdrop-blur-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Copy Link Phòng</span>
              </>
            )}
          </button>
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {uniqueParticipants.map((participant) => {
            const published = participant.publishedTracks.map(String);
            const isMicMuted = !published.includes('audio');
            const isCamMuted = !published.includes('video');
            
            return (
              <div
                key={participant.userId}
                className="flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                    {participant.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {participant.name || 'Ẩn danh'}
                  </p>
                  {participant.isLocalParticipant && (
                    <span className="text-[10px] text-indigo-300 font-medium bg-indigo-500/20 px-1.5 py-0.5 rounded">Bạn</span>
                  )}
                </div>

                {/* Status Icons */}
                <div className="flex items-center gap-1.5">
                  {isMicMuted ? (
                     <MicOff className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  )}
                  {isCamMuted && (
                     <VideoOff className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const StudyGrid = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const uniqueParticipants = Array.from(new Map(participants.map((p: Participant) => [p.userId, p])).values());

  if (uniqueParticipants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/60">
        <div className="p-8 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm mb-4 animate-pulse">
          <Users className="w-16 h-16 opacity-50" />
        </div>
        <p className="text-lg font-medium text-white">Đang đợi mọi người...</p>
        <p className="text-sm text-white/50">Phòng chưa có ai tham gia</p>
      </div>
    );
  }

  const getGridCols = () => {
    const count = uniqueParticipants.length;
    if (count === 1) return "grid-cols-1 max-w-5xl"; // Video to hơn khi có 1 người
    if (count === 2) return "grid-cols-1 md:grid-cols-2 max-w-6xl";
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2 max-w-6xl";
    return "grid-cols-2 lg:grid-cols-3 max-w-[1920px]";
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4 overflow-y-auto scrollbar-thin">
        <div className={cn("grid gap-4 w-full transition-all duration-300", getGridCols())}>
        {uniqueParticipants.map((p: Participant) => (
            <div key={p.userId} className="aspect-video w-full h-fit rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/20">
            <VideoParticipant participant={p} showScore={false} />
            </div>
        ))}
        </div>
    </div>
  );
};

export default function StudyRoom({ roomId }: { roomId: string }) {
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);
  const [isPeopleSidebarOpen, setIsPeopleSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!client) return;
    const myCall = client.call("default", roomId);
    myCall.join({ create: true }).then(() => {
      setCall(myCall);
    }).catch(console.error);
    
    return () => {
      myCall.leave().catch(console.error);
    };
  }, [client, roomId]);

  const handleLeave = async () => {
    await call?.leave();
    router.push('/rooms');
  };

  if (!call) return <Loader />;

  return (
    <StreamCall call={call}>
      {/* MAIN CONTAINER 
      */}
      <div className="w-full h-full pt-20 pb-6 pl-24 pr-24 flex flex-col relative font-sans text-gray-100 bg-transparent">
        
        {/* ROOM CONTAINER (Khung kính chính giữa) */}
        <div className={cn(
            "flex-1 w-full rounded-3xl overflow-hidden flex flex-col relative transition-all duration-300",
            "bg-black/20 backdrop-blur-sm border border-white/10 shadow-2xl"
        )}>
            
            {/* Room Header (Tên phòng nhỏ góc trái) */}
            <div className="absolute top-4 left-6 z-20 flex items-center gap-3 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <h1 className="text-sm font-semibold text-white/90">Phòng Học Tập</h1>
                </div>
            </div>

            {/* Main Grid Content */}
            <StudyGrid />
            
            {/* Bottom Controls (Nổi lên trên) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center pointer-events-none">
                 <div className="pointer-events-auto hover:scale-105 transition-transform duration-200">
                    <StudyControls 
                        onLeave={handleLeave} 
                        onTogglePeople={() => setIsPeopleSidebarOpen(!isPeopleSidebarOpen)}
                    />
                 </div>
            </div>
        </div>

        {/* Sidebar hiển thị danh sách người dùng (Nổi bên phải khung) */}
        <PeopleSidebar 
          isOpen={isPeopleSidebarOpen}
          onClose={() => setIsPeopleSidebarOpen(false)}
          roomId={roomId}
        />
      </div>
    </StreamCall>
  );
}
