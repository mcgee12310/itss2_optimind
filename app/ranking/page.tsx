"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Glass effect styles
const glassCard = "bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl";

interface LeaderboardUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  level: number;
  exp: number;
  coins: number;
  rank: number;
}

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardUser[]>([]);
  const [friendsLeaderboard, setFriendsLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch current user
      const userRes = await fetch("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        setCurrentUser(userData.user);
      }

      // Fetch global leaderboard
      const globalRes = await fetch("/api/leaderboards?type=global&limit=50");
      if (globalRes.ok) {
        const globalData = await globalRes.json();
        setGlobalLeaderboard(globalData.leaderboard);
      }

      // Fetch friends leaderboard
      const friendsRes = await fetch("/api/leaderboards?type=friends&limit=50");
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriendsLeaderboard(friendsData.leaderboard);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-amber-600";
    return "bg-muted";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <div className="text-xl">Đang tải dữ liệu...</div>
      </div>
    );
  }

  const leaderboard = activeTab === "global" ? globalLeaderboard : friendsLeaderboard;

  return (
    <main className="h-screen w-screen text-white p-6 transition-all duration-500">
      <div className="relative w-full h-full">
        <div className="absolute top-20 bottom-6 left-24 right-24 flex gap-4">
          {/* LEFT PANEL - User Stats & Tabs */}
          <div className={cn(glassCard, "w-80 p-5 flex flex-col")}>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-400" />
                Bảng Xếp Hạng
              </h2>
              <p className="text-white/60 text-sm mt-1">Thứ hạng và thành tích</p>
            </div>

            {/* Current User Stats */}
            {currentUser && (
              <div className={cn(glassCard, "p-4 mb-6 bg-gradient-to-br from-yellow-500/20 to-purple-500/20")}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-14 h-14 border-2 border-yellow-400/50">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                      {currentUser.name?.[0] || currentUser.email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{currentUser.name || "User"}</h3>
                    <p className="text-xs text-white/60">{currentUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                    <div className="text-xs text-white/70">Level</div>
                    <div className="text-lg font-bold text-yellow-400">{currentUser.level}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                    <div className="text-xs text-white/70">EXP</div>
                    <div className="text-lg font-bold text-blue-400">{currentUser.exp}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm">
                    <div className="text-xs text-white/70">Coins</div>
                    <div className="text-lg font-bold text-green-400">{currentUser.coins}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("global")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200",
                  activeTab === "global"
                    ? "bg-white/20 text-white shadow-lg"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                🌍 Toàn cầu
              </button>
              <button
                onClick={() => setActiveTab("friends")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200",
                  activeTab === "friends"
                    ? "bg-white/20 text-white shadow-lg"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                )}
              >
                👥 Bạn bè
              </button>
            </div>

            {/* Tab Info */}
            <div className="text-xs text-white/50 text-center">
              {activeTab === "global" 
                ? "Xem xếp hạng toàn cầu của tất cả người dùng"
                : "So sánh thành tích với bạn bè của bạn"}
            </div>
          </div>

          {/* RIGHT PANEL - Leaderboard */}
          <div className={cn(glassCard, "flex-1 p-5 flex flex-col overflow-hidden")}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              {activeTab === "global" ? "Bảng Xếp Hạng Toàn Cầu" : "Bảng Xếp Hạng Bạn Bè"}
            </h2>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 pl-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              {leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/40">
                  <Star className="w-16 h-16 mb-4" />
                  <p className="text-center">
                    {activeTab === "friends"
                      ? "Chưa có bạn bè. Kết bạn để so sánh thứ hạng!"
                      : "Chưa có dữ liệu"}
                  </p>
                </div>
              ) : (
                leaderboard.map((user, index) => (
                  <div
                    key={user.id}
                    className={cn(
                      "bg-white/5 backdrop-blur-sm rounded-xl p-4 transition-all duration-200 ml-1",
                      "hover:bg-white/10 hover:scale-[1.02] hover:-translate-x-1",
                      currentUser?.id === user.id && "bg-gradient-to-r from-purple-500/20 to-pink-500/20 ring-2 ring-purple-400/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {user.rank === 1 && (
                          <div className="flex flex-col items-center">
                            <Trophy className="w-8 h-8 text-yellow-400 animate-pulse" />
                          </div>
                        )}
                        {user.rank === 2 && (
                          <div className="flex flex-col items-center">
                            <Medal className="w-7 h-7 text-gray-300" />
                          </div>
                        )}
                        {user.rank === 3 && (
                          <div className="flex flex-col items-center">
                            <Award className="w-7 h-7 text-amber-600" />
                          </div>
                        )}
                        {user.rank > 3 && (
                          <span className="text-2xl font-bold text-white/40">
                            #{user.rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <Avatar className={cn(
                        "w-12 h-12",
                        user.rank <= 3 && "ring-2",
                        user.rank === 1 && "ring-yellow-400",
                        user.rank === 2 && "ring-gray-300",
                        user.rank === 3 && "ring-amber-600"
                      )}>
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className={cn(
                          user.rank === 1 && "bg-gradient-to-br from-yellow-400 to-orange-500",
                          user.rank === 2 && "bg-gradient-to-br from-gray-300 to-gray-500",
                          user.rank === 3 && "bg-gradient-to-br from-amber-500 to-orange-600",
                          user.rank > 3 && "bg-gradient-to-br from-blue-400 to-purple-500"
                        )}>
                          {user.name?.[0] || user.email[0]}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white truncate">
                            {user.name || user.email}
                          </h3>
                          {currentUser?.id === user.id && (
                            <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/50 text-xs">
                              Bạn
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/50 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-xs text-white/50">Level</div>
                          <div className="font-bold text-yellow-400">{user.level}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-white/50">EXP</div>
                          <div className="font-bold text-blue-400">{user.exp}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-white/50">Coins</div>
                          <div className="font-bold text-green-400">{user.coins}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
