"use client";

import { MusicProvider } from "@/hooks/useMusic";
import React from "react";

// Client wrapper for MusicProvider to persist state across page navigations
// This component should be placed at a higher level than individual page layouts
export default function MusicWrapper({ children }: { children: React.ReactNode }) {
    return <MusicProvider>{children}</MusicProvider>;
}
