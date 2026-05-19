"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface ExtensionSyncState {
  installed: boolean;
  blockedSites: string[];
  isEnabled: boolean;
}

export function useExtensionSync() {
  const [state, setState] = useState<ExtensionSyncState>({
    installed: false,
    blockedSites: [],
    isEnabled: true,
  });

  // Track if we've received a response from the extension
  const respondedRef = useRef(false);

  useEffect(() => {
    const handleState = (e: Event) => {
      const detail = (e as CustomEvent<Partial<ExtensionSyncState>>).detail;
      respondedRef.current = true;
      setState((prev) => ({ ...prev, ...detail }));
    };

    window.addEventListener("optimind:extensionState", handleState);

    // Ask extension for current state
    window.dispatchEvent(new CustomEvent("optimind:getState"));

    // If no response after 800ms → extension not installed
    const timer = setTimeout(() => {
      if (!respondedRef.current) {
        setState((prev) => ({ ...prev, installed: false }));
      }
    }, 800);

    return () => {
      window.removeEventListener("optimind:extensionState", handleState);
      clearTimeout(timer);
    };
  }, []);

  const setBlockedSites = useCallback((sites: string[]) => {
    window.dispatchEvent(
      new CustomEvent("optimind:setBlockedSites", { detail: { sites } })
    );
    setState((prev) => ({ ...prev, blockedSites: sites }));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    window.dispatchEvent(
      new CustomEvent("optimind:setEnabled", { detail: { enabled } })
    );
    setState((prev) => ({ ...prev, isEnabled: enabled }));
  }, []);

  return { ...state, setBlockedSites, setEnabled };
}
