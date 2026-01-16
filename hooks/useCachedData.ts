"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for caching API data in localStorage with stale-while-revalidate pattern
 * Shows cached data immediately while fetching fresh data in background
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface UseCachedDataOptions {
    /** Cache key for localStorage */
    key: string;
    /** Function to fetch fresh data */
    fetcher: () => Promise<any>;
    /** Cache duration in milliseconds (default: 5 minutes) */
    maxAge?: number;
    /** If true, always fetch fresh data but show cached first */
    revalidate?: boolean;
}

interface UseCachedDataResult<T> {
    data: T | null;
    isLoading: boolean;
    isStale: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    clearCache: () => void;
}

export function useCachedData<T>({
    key,
    fetcher,
    maxAge = 5 * 60 * 1000, // 5 minutes default
    revalidate = true,
}: UseCachedDataOptions): UseCachedDataResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isStale, setIsStale] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const cacheKey = `optimind_cache_${key}`;

    // Get cached data from localStorage
    const getCachedData = useCallback((): CacheEntry<T> | null => {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {
            console.warn("Failed to read cache:", e);
        }
        return null;
    }, [cacheKey]);

    // Save data to localStorage
    const setCachedData = useCallback((newData: T) => {
        try {
            const entry: CacheEntry<T> = {
                data: newData,
                timestamp: Date.now(),
            };
            localStorage.setItem(cacheKey, JSON.stringify(entry));
        } catch (e) {
            console.warn("Failed to write cache:", e);
        }
    }, [cacheKey]);

    // Clear cache
    const clearCache = useCallback(() => {
        try {
            localStorage.removeItem(cacheKey);
            setData(null);
        } catch (e) {
            console.warn("Failed to clear cache:", e);
        }
    }, [cacheKey]);

    // Fetch fresh data
    const fetchData = useCallback(async () => {
        try {
            const freshData = await fetcher();
            setData(freshData);
            setCachedData(freshData);
            setIsStale(false);
            setError(null);
        } catch (e) {
            setError(e as Error);
            console.error("Failed to fetch data:", e);
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, setCachedData]);

    // Refetch function
    const refetch = useCallback(async () => {
        setIsLoading(true);
        await fetchData();
    }, [fetchData]);

    // Initial load with stale-while-revalidate
    useEffect(() => {
        const cached = getCachedData();

        if (cached) {
            const age = Date.now() - cached.timestamp;
            const isExpired = age > maxAge;

            // Show cached data immediately
            setData(cached.data);
            setIsStale(isExpired);
            setIsLoading(false);

            // Revalidate in background if expired or revalidate is true
            if (isExpired || revalidate) {
                fetchData();
            }
        } else {
            // No cache, fetch fresh
            fetchData();
        }
    }, [getCachedData, fetchData, maxAge, revalidate]);

    return {
        data,
        isLoading,
        isStale,
        error,
        refetch,
        clearCache,
    };
}

/**
 * Simple cache utilities for direct localStorage operations
 */
export const cacheUtils = {
    /** Get cached value */
    get: <T>(key: string): T | null => {
        try {
            const cached = localStorage.getItem(`optimind_cache_${key}`);
            if (cached) {
                const entry: CacheEntry<T> = JSON.parse(cached);
                return entry.data;
            }
        } catch (e) {
            console.warn("Cache read error:", e);
        }
        return null;
    },

    /** Set cached value */
    set: <T>(key: string, data: T): void => {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
            };
            localStorage.setItem(`optimind_cache_${key}`, JSON.stringify(entry));
        } catch (e) {
            console.warn("Cache write error:", e);
        }
    },

    /** Remove cached value */
    remove: (key: string): void => {
        try {
            localStorage.removeItem(`optimind_cache_${key}`);
        } catch (e) {
            console.warn("Cache remove error:", e);
        }
    },

    /** Clear all Optimind caches */
    clearAll: (): void => {
        try {
            Object.keys(localStorage)
                .filter((key) => key.startsWith("optimind_cache_"))
                .forEach((key) => localStorage.removeItem(key));
        } catch (e) {
            console.warn("Cache clear error:", e);
        }
    },

    /** Check if cache is expired */
    isExpired: (key: string, maxAge: number = 5 * 60 * 1000): boolean => {
        try {
            const cached = localStorage.getItem(`optimind_cache_${key}`);
            if (cached) {
                const entry = JSON.parse(cached);
                return Date.now() - entry.timestamp > maxAge;
            }
        } catch (e) {
            console.warn("Cache check error:", e);
        }
        return true;
    },
};

/**
 * Hook to cache user preferences (background, theme, etc.)
 */
export function useUserPreferences() {
    const PREFS_KEY = "user_preferences";

    const [preferences, setPreferencesState] = useState<{
        backgroundUrl?: string;
        musicVolume?: number;
        currentTrackId?: string;
        sidebarCollapsed?: boolean;
    }>({});

    // Load preferences on mount
    useEffect(() => {
        const cached = cacheUtils.get<typeof preferences>(PREFS_KEY);
        if (cached) {
            setPreferencesState(cached);
        }
    }, []);

    // Save preferences
    const setPreferences = useCallback((newPrefs: Partial<typeof preferences>) => {
        setPreferencesState((prev) => {
            const updated = { ...prev, ...newPrefs };
            cacheUtils.set(PREFS_KEY, updated);
            return updated;
        });
    }, []);

    return { preferences, setPreferences };
}
