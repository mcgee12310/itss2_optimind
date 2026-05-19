"use client";

import { useState, FC, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  X,
  ShieldOff,
  ShieldCheck,
  Trash2,
  Globe,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExtensionSync } from "@/hooks/useExtensionSync";

const glassEffect =
  "bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg";

const PRESET_SITES = [
  { id: "facebook", label: "Facebook", url: "facebook.com" },
  { id: "youtube", label: "YouTube", url: "youtube.com" },
  { id: "tiktok", label: "TikTok", url: "tiktok.com" },
  { id: "instagram", label: "Instagram", url: "instagram.com" },
  { id: "zalo", label: "Zalo", url: "zalo.me" },
  { id: "messenger", label: "Messenger", url: "messenger.com" },
  { id: "telegram", label: "Telegram", url: "web.telegram.org" },
  { id: "twitter", label: "X (Twitter)", url: "x.com" },
  { id: "reddit", label: "Reddit", url: "reddit.com" },
  { id: "shopee", label: "Shopee", url: "shopee.vn" },
];

const getFavicon = (url: string) =>
  `https://www.google.com/s2/favicons?domain=${url}&sz=32`;

interface BlockedSite {
  id: string;
  url: string;
  label?: string;
}

interface SiteBlockerWidgetProps {
  show: boolean;
  onClose: () => void;
}

const SiteBlockerWidget: FC<SiteBlockerWidgetProps> = ({ show, onClose }) => {
  const ext = useExtensionSync();
  const [blockedSites, setBlockedSitesLocal] = useState<BlockedSite[]>([]);
  const [inputUrl, setInputUrl] = useState("");
  const [isBlocking, setIsBlockingLocal] = useState(false);

  // Load initial state from extension once it responds
  useEffect(() => {
    if (!ext.installed) return;
    setBlockedSitesLocal(
      ext.blockedSites.map((url) => {
        const preset = PRESET_SITES.find((p) => p.url === url);
        return preset
          ? { id: preset.id, url: preset.url, label: preset.label }
          : { id: url, url };
      }),
    );
    setIsBlockingLocal(ext.isEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ext.installed]);

  const syncToExtension = (sites: BlockedSite[], enabled: boolean) => {
    if (ext.installed) {
      ext.setBlockedSites(sites.map((s) => s.url));
      ext.setEnabled(enabled);
    }
  };

  const isPresetBlocked = (presetId: string) =>
    blockedSites.some((s) => s.id === presetId);

  const togglePreset = (preset: (typeof PRESET_SITES)[0]) => {
    const next = isPresetBlocked(preset.id)
      ? blockedSites.filter((s) => s.id !== preset.id)
      : [
          ...blockedSites,
          { id: preset.id, url: preset.url, label: preset.label },
        ];
    setBlockedSitesLocal(next);
    syncToExtension(next, isBlocking);
  };

  const handleAddCustomUrl = () => {
    const raw = inputUrl
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    if (!raw) return;
    if (blockedSites.some((s) => s.url === raw)) {
      setInputUrl("");
      return;
    }
    const next = [...blockedSites, { id: crypto.randomUUID(), url: raw }];
    setBlockedSitesLocal(next);
    syncToExtension(next, isBlocking);
    setInputUrl("");
  };

  const handleRemove = (id: string) => {
    const next = blockedSites.filter((s) => s.id !== id);
    setBlockedSitesLocal(next);
    syncToExtension(next, isBlocking);
  };

  const handleToggleBlock = () => {
    const next = !isBlocking;
    setIsBlockingLocal(next);
    syncToExtension(blockedSites, next);
  };

  if (!show) return null;

  const customSites = blockedSites.filter(
    (s) => !PRESET_SITES.some((p) => p.id === s.id),
  );

  return (
    <div
      className={cn(
        "w-150 h-full max-h-90 flex flex-col",
        glassEffect,
        "animate-in fade-in zoom-in-95",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <p className="text-lg font-semibold">Chặn trang web</p>
          {ext.installed ? (
            <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              <Puzzle className="h-3 w-3" /> Đã kết nối
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs bg-white/10 text-white/40 border border-white/10 px-2 py-0.5 rounded-full">
              <Puzzle className="h-3 w-3" /> Chưa cài extension
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!ext.installed ? null : (
            <button
              onClick={handleToggleBlock}
              className={cn(
                "text-xs font-semibold px-3 py-1 rounded-full transition-all duration-200",
                isBlocking
                  ? "bg-red-500/80 hover:bg-red-600/80 text-white"
                  : "bg-emerald-500/80 hover:bg-emerald-600/80 text-white",
              )}
            >
              {isBlocking ? "Đang chặn" : "Bắt đầu chặn"}
            </button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-red-500/30"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-hidden">
        {/* Nhập URL thủ công */}
        <div className="flex gap-2 p-3 border-b border-white/10">
          <div className="relative flex-1">
            <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <Input
              placeholder="Nhập domain... (vd: discord.com)"
              className="bg-white/10 border-white/30 h-9 text-sm pl-8 placeholder:text-white/40"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomUrl()}
            />
          </div>
          <Button
            size="icon"
            className="h-9 w-9 shrink-0 bg-white/20 hover:bg-white/30"
            onClick={handleAddCustomUrl}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Trang phổ biến */}
        <div className="p-3 border-b border-white/10">
          <p className="text-xs text-white/50 mb-2 font-medium uppercase tracking-wider">
            Chọn nhanh
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_SITES.map((site) => {
              const blocked = isPresetBlocked(site.id);
              return (
                <button
                  key={site.id}
                  onClick={() => togglePreset(site)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                    blocked
                      ? "bg-red-500/30 border border-red-400/40 text-red-200"
                      : "bg-white/10 border border-white/10 text-white/80 hover:bg-white/20",
                  )}
                >
                  <img
                    src={getFavicon(site.url)}
                    alt={site.label}
                    className="w-4 h-4 rounded-sm shrink-0"
                  />
                  <span className="truncate">{site.label}</span>
                  {blocked && (
                    <ShieldOff className="h-3 w-3 ml-auto text-red-300 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Danh sách trang tùy chỉnh */}
        {customSites.length > 0 && (
          <div className="p-3">
            <p className="text-xs text-white/50 mb-2 font-medium uppercase tracking-wider">
              Tùy chỉnh
            </p>
            <div className="flex flex-col gap-1.5">
              {customSites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/20 border border-red-400/30"
                >
                  <Globe className="h-3.5 w-3.5 text-red-300 shrink-0" />
                  <span className="text-sm text-red-100 flex-1 truncate">
                    {site.url}
                  </span>
                  <button
                    onClick={() => handleRemove(site.id)}
                    className="text-white/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {blockedSites.length === 0 && (
          <div className="p-6 text-center text-white/30 text-sm">
            <ShieldOff className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Chưa chặn trang nào
          </div>
        )}
      </ScrollArea>

      {/* Footer: tóm tắt */}
      {blockedSites.length > 0 && (
        <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-white/40">
            {blockedSites.length} trang bị chặn
          </span>
          <span
            className={cn(
              "text-xs font-semibold",
              isBlocking ? "text-red-400" : "text-white/40",
            )}
          >
            {isBlocking ? "🔴 Đang hoạt động" : "⚪ Chưa bật"}
          </span>
        </div>
      )}
    </div>
  );
};

export default SiteBlockerWidget;
