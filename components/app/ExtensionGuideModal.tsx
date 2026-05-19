"use client";

import React, { useState } from "react";
import JSZip from "jszip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  icon: string;
  title: string;
  desc: React.ReactNode;
}

const STEPS: Step[] = [
  {
    number: 1,
    icon: "⬇️",
    title: "Tải & giải nén ZIP",
    desc: (
      <>
        Nhấn <strong>Tải về ZIP</strong> bên dưới, sau đó{" "}
        <strong>giải nén</strong> file ZIP ra một thư mục
        (vd:{" "}
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 text-sm">
          Desktop/optimind-blocker
        </code>
        ).
        <br /><br />
        Ở bước 4, chọn đúng thư mục vừa giải nén đó.
      </>
    ),
  },
  {
    number: 2,
    icon: "🌐",
    title: "Mở trang Tiện ích mở rộng",
    desc: (
      <>
        Mở <strong>Chrome</strong> (hoặc Edge), nhập vào thanh địa chỉ:{" "}
        <code className="bg-white/10 px-2 py-0.5 rounded text-indigo-300 text-sm">
          chrome://extensions
        </code>{" "}
        rồi nhấn Enter.
      </>
    ),
  },
  {
    number: 3,
    icon: "🔧",
    title: 'Bật "Chế độ nhà phát triển"',
    desc: (
      <>
        Ở góc <strong>trên bên phải</strong> trang Extensions, bật công tắc{" "}
        <strong>Developer mode</strong> (Chế độ nhà phát triển) sang{" "}
        <span className="text-green-400 font-semibold">ON</span>.
      </>
    ),
  },
  {
    number: 4,
    icon: "📂",
    title: 'Nhấn "Load unpacked"',
    desc: (
      <>
        Nhấn nút{" "}
        <strong className="text-indigo-300">Load unpacked</strong> ở góc trên bên trái.
        Một cửa sổ chọn thư mục sẽ mở ra — chọn{" "}
        <strong>thư mục đã giải nén</strong> từ bước 1
        (vd:{" "}
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 text-sm">
          optimind-blocker
        </code>
        ).
        <br /><br />
        <span className="text-yellow-300 font-medium">
          ⚠️ Chọn thư mục, không phải file ZIP.
        </span>
      </>
    ),
  },
  {
    number: 5,
    icon: "✅",
    title: "Hoàn tất!",
    desc: (
      <>
        Extension <strong>OptiMind Blocker ⚡</strong> sẽ xuất hiện trong danh sách.
        Nhấn vào biểu tượng puzzle 🧩 trên thanh công cụ Chrome để ghim và sử dụng.
      </>
    ),
  },
];

const EXT_FILES = [
  { name: "manifest.json", label: "manifest.json" },
  { name: "background.js", label: "background.js" },
  { name: "content.js", label: "content.js" },
  { name: "popup.html", label: "popup.html" },
  { name: "popup.js", label: "popup.js" },
  { name: "blocked.html", label: "blocked.html" },
  { name: "blocked.js", label: "blocked.js" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExtensionGuideModal({ open, onOpenChange }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const [downloading, setDownloading] = useState(false);

  async function handleDownloadZip() {
    setDownloading(true);
    try {
      const zip = new JSZip();
      await Promise.all(
        EXT_FILES.map(async (f) => {
          const res = await fetch(`/extension/${f.name}`);
          zip.file(f.name, await res.blob());
        })
      );
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimind-blocker.zip";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl w-full p-0 overflow-hidden border-0",
          "bg-[#0f0f1a] text-white",
          "[&>button]:text-white/50 [&>button]:hover:text-white"
        )}
      >
        {/* ── Top gradient bar ── */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />

        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Cài đặt OptiMind Blocker
              </span>
            </DialogTitle>
            <p className="text-sm text-white/50 mt-1">
              Extension chặn web gây xao nhãng — giúp bạn tập trung tuyệt đối khi học.
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-5">
          {/* ── Step sidebar ── */}
          <div className="flex flex-col gap-2">
            {STEPS.map((step, i) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(i)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                  activeStep === i
                    ? "bg-indigo-600/30 border border-indigo-500/40"
                    : "hover:bg-white/5 border border-transparent"
                )}
              >
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    activeStep === i
                      ? "bg-indigo-500 text-white"
                      : "bg-white/10 text-white/50"
                  )}
                >
                  {step.number}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium leading-tight",
                    activeStep === i ? "text-white" : "text-white/50"
                  )}
                >
                  {step.title}
                </span>
              </button>
            ))}
          </div>

          {/* ── Step detail ── */}
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 flex flex-col min-h-[200px]">
            <div className="text-4xl mb-4">{STEPS[activeStep].icon}</div>
            <h3 className="text-lg font-bold mb-2">
              Bước {STEPS[activeStep].number}: {STEPS[activeStep].title}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed flex-1">
              {STEPS[activeStep].desc}
            </p>

            {/* Navigation */}
            <div className="flex gap-3 mt-5">
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep((s) => s - 1)}
                  className="px-4 py-2 rounded-lg bg-white/7 border border-white/10 text-sm text-white/70 hover:bg-white/12 transition-colors"
                >
                  ← Trước
                </button>
              )}
              {activeStep < STEPS.length - 1 && (
                <button
                  onClick={() => setActiveStep((s) => s + 1)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors ml-auto"
                >
                  Tiếp theo →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Download section ── */}
        <div className="px-6 pb-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">
                optimind-blocker.zip
              </p>
              <p className="text-xs text-white/40">
                5 file · manifest, background, popup, blocked page
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shrink-0",
                downloading
                  ? "bg-indigo-600/40 text-white/50 cursor-wait"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/25"
              )}
            >
              {downloading
                ? <><span className="animate-spin inline-block">⟳</span> Đang nén...</>
                : <>⬇ Tải về ZIP</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
