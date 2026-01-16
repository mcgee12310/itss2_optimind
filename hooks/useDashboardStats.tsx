"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { cacheUtils } from "./useCachedData";

interface DashboardStats {
  streak: number;
  studyHoursToday: number;
}

interface DashboardStatsContextType {
  stats: DashboardStats;
  loading: boolean;
  refreshStats: () => Promise<void>;
}

const DashboardStatsContext = createContext<DashboardStatsContextType | undefined>(undefined);

const CACHE_KEY = "dashboard_stats";

export function DashboardStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<DashboardStats>(() => {
    // Initialize with cached data if available
    const cached = cacheUtils.get<DashboardStats>(CACHE_KEY);
    return cached || { streak: 0, studyHoursToday: 0 };
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (res.ok) {
        const data = await res.json();
        const newStats = {
          streak: data.streak || 0,
          studyHoursToday: data.studyHoursToday || 0,
        };
        setStats(newStats);
        // Cache the stats
        cacheUtils.set(CACHE_KEY, newStats);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if we have cached data
    const cached = cacheUtils.get<DashboardStats>(CACHE_KEY);
    if (cached) {
      // We already have cached data, mark as not loading
      setLoading(false);
      // Fetch fresh data in background
      fetchStats();
    } else {
      // No cache, fetch immediately
      fetchStats();
    }
  }, [fetchStats]);

  const refreshStats = async () => {
    await fetchStats();
  };

  return (
    <DashboardStatsContext.Provider value={{ stats, loading, refreshStats }}>
      {children}
    </DashboardStatsContext.Provider>
  );
}

export function useDashboardStats() {
  const context = useContext(DashboardStatsContext);
  if (context === undefined) {
    throw new Error("useDashboardStats must be used within DashboardStatsProvider");
  }
  return context;
}
