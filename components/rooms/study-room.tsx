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
import { 
  Mic, MicOff, Video, VideoOff, Phone, 
  Users, X, Clock, Shield, Copy, Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const StudyControls = ({ onLeave, onTogglePeople }: { onLeave: () => void; onTogglePeople: () => void }) => {
  const { useMicrophoneState, useCameraState, useParticipants } = useCallStateHooks();
  
  const { microphone, optimisticIsMute: isMicMuted } = useMicrophoneState();
  const { camera, optimisticIsMute: isCamMuted } = useCameraState();
  const participants = useParticipants();

  return (
    <div className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 bg-[#202124] rounded-full shadow-2xl border border-white/10">
      {/* Time Display */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full text-white/70 text-sm">
        <Clock className="w-4 h-4" />
        <span>{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="w-px h-8 bg-white/20" />

      {/* MIC */}
      <button
        onClick={() => microphone.toggle()}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-lg",
          isMicMuted 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "bg-white/10 hover:bg-white/20 text-white"
        )}
        title={isMicMuted ? "Bật mic" : "Tắt mic"}
      >
        {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* CAM */}
      <button
        onClick={() => camera.toggle()}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-lg",
          isCamMuted
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-white/10 hover:bg-white/20 text-white"
        )}
        title={isCamMuted ? "Bật camera" : "Tắt camera"}
      >
        {isCamMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </button>

      <div className="w-px h-8 bg-white/20" />

      {/* People Button */}
      <button 
        onClick={onTogglePeople}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all shadow-lg"
        title="Xem danh sách người tham gia"
      >
        <Users className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">{participants.length}</span>
      </button>

      <div className="w-px h-8 bg-white/20" />

      {/* LEAVE BUTTON */}
      <button 
        onClick={onLeave} 
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg active:scale-95"
        title="Rời phòng"
      >
        <Phone className="w-5 h-5 rotate-[135deg]" />
        <span className="hidden md:inline">Rời</span>
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
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full w-full sm:w-96 bg-[#202124] border-l border-white/10 shadow-2xl z-50 flex flex-col",
        "animate-in slide-in-from-right duration-300"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Người tham gia</h2>
            <p className="text-sm text-white/60">{uniqueParticipants.length} người</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Copy Room Link */}
        <div className="p-4 border-b border-white/10">
          <button
            onClick={copyRoomLink}
            className="w-full flex items-center gap-3 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Sao chép link phòng</span>
              </>
            )}
          </button>
        </div>

        {/* Participants List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {uniqueParticipants.map((participant) => {
            const isMicMuted = !participant.publishedTracks.includes('audio');
            const isCamMuted = !participant.publishedTracks.includes('video');
            
            return (
              <div
                key={participant.userId}
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {participant.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#202124]" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {participant.name || 'Ẩn danh'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {participant.isLocalParticipant && (
                      <span className="text-xs text-indigo-400 font-medium">(Bạn)</span>
                    )}
                  </div>
                </div>

                {/* Status Icons */}
                <div className="flex items-center gap-1">
                  {isMicMuted && (
                    <div className="p-1.5 bg-red-500/20 rounded-full" title="Mic tắt">
                      <MicOff className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  )}
                  {isCamMuted && (
                    <div className="p-1.5 bg-red-500/20 rounded-full" title="Camera tắt">
                      <VideoOff className="w-3.5 h-3.5 text-red-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-start gap-2 text-white/60 text-xs">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
            <p>Mọi thành viên trong phòng đều có thể nhìn thấy nhau</p>
          </div>
        </div>
      </div>
    </>
  );
};

const StudyGrid = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const uniqueParticipants = Array.from(new Map(participants.map(p => [p.userId, p])).values());

  if (uniqueParticipants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/40">
        <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md mb-6">
          <Users className="w-20 h-20 opacity-40" />
        </div>
        <p className="text-xl font-semibold text-white mb-2">Đang chờ người tham gia</p>
        <p className="text-sm text-white/50">Chia sẻ link phòng để mời bạn bè</p>
      </div>
    );
  }

  const getGridCols = () => {
    const count = uniqueParticipants.length;
    if (count === 1) return "grid-cols-1 max-w-4xl";
    if (count === 2) return "grid-cols-1 lg:grid-cols-2 max-w-6xl";
    if (count <= 4) return "grid-cols-1 sm:grid-cols-2 max-w-6xl";
    if (count <= 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-[1920px]";
  };

  return (
    <div className={cn("grid gap-3 md:gap-4 w-full h-full mx-auto p-3 md:p-4 overflow-y-auto", getGridCols())}>
      {uniqueParticipants.map((p) => (
        <div key={p.userId} className="aspect-video w-full h-fit transition-all duration-200 hover:scale-[1.02]">
          <VideoParticipant participant={p} showScore={false} />
        </div>
      ))}
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
      <div className="flex flex-col h-screen w-full bg-[#1a1a1a] overflow-hidden relative font-sans text-gray-100">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-[#202124] border-b border-white/10 z-30">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h1 className="text-base font-semibold text-white">Phòng học</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-sm text-white/60">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative overflow-hidden bg-[#1a1a1a]">
          <StudyGrid />
          
          {/* Floating Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
            <StudyControls 
              onLeave={handleLeave} 
              onTogglePeople={() => setIsPeopleSidebarOpen(!isPeopleSidebarOpen)}
            />
          </div>
        </div>

        {/* People Sidebar */}
        <PeopleSidebar 
          isOpen={isPeopleSidebarOpen}
          onClose={() => setIsPeopleSidebarOpen(false)}
          roomId={roomId}
        />
      </div>
    </StreamCall>
  );
}