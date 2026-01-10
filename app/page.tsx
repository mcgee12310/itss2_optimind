// Tên file: app/page.tsx
"use client";

import { useState, useEffect, useRef, FC } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VideoEngagementAnalyzer from "@/hooks/use-engagement-analyzer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Brain,
  LogIn,
  UserPlus,
  Facebook,
  Twitter,
  Instagram,
  Timer,
  Star,
  CheckSquare,
  ChevronRight,
  Play,
  Pause,
  Camera,
  BarChart3,
  PieChart,
  RefreshCcw,
  History,
  LogOut,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { User } from "@/utils/types";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { clientGetCurrentUser, clientLogout } from "@/utils/auth-client";

// --- Hàm tiện ích ---
const whiteBox = "bg-white rounded-2xl shadow-xl";
const lightBox = "bg-gray-50 rounded-2xl shadow-lg";

// Hàm định dạng thời gian
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

// --- Class cho hiệu ứng linear Mask ---
const maskClass =
  "[mask-image:linear-linear(to_bottom,transparent_0%,black_5%,black_95%,transparent_100%)]";

// --- Component Chính: Landing Page ---
export default function LandingPage() {
  // --- State Ảnh Nền ---
  const [backgroundHeroUrl] = useState<string>(
    "https://i.pinimg.com/1200x/9e/23/f0/9e23f0e8bacb5f03ad6418a3bdd1727b.jpg"
  );
  const [backgroundDemoUrl] = useState<string>(
    "https://i.pinimg.com/1200x/02/12/9c/02129c9f9ee35d9ddae567afd49d27b8.jpg"
  );
  const [backgroundPricingUrl] = useState<string>(
    "https://i.pinimg.com/736x/a6/00/2c/a6002c180d0f925d224aa72d7a1ff8cd.jpg"
  );
  const [backgroundGuideUrl] = useState<string>(
    "https://i.pinimg.com/736x/4f/bf/bd/4fbfbdabd294d91e676770037bd70322.jpg"
  );
  const [backgroundFooterUrl] = useState<string>(
    "https://i.pinimg.com/736x/30/e7/cb/30e7cb6ab85a69c8e57e9e591e73b776.jpg"
  );

  // --- State cho Demo ---
  const [timeLeft, setTimeLeft] = useState<number>(5 * 60); // 5 phút
  const [isDemoRunning, setDemoRunning] = useState<boolean>(false);
  const [demoFocus, setDemoFocus] = useState<number>(0);

  // --- State cho hiệu ứng Header & Auth ---
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

  // --- Effect cho Header (Scroll) ---
  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Auth: Lấy user hiện tại từ API
  useEffect(() => {
    const run = async () => {
      const u = await clientGetCurrentUser();
      setUser(u);
      setLoading(false);
    };
    run();
  }, []);

  // --- Effect cho Demo Timer ---
  useEffect(() => {
    if (!isDemoRunning || timeLeft === 0) {
      if (timeLeft === 0) setDemoRunning(false);
      return;
    }
    let timerInterval: NodeJS.Timeout | null = null;
    if (isDemoRunning && timeLeft > 0) {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isDemoRunning, timeLeft]);

  // --- Callback nhận điểm tập trung thật từ AI ---
  const handleFocusScoreUpdate = (score: number) => {
    setDemoFocus(score);
  };

  const handleDemoToggle = (): void => {
    if (timeLeft === 0) setTimeLeft(5 * 60);
    setDemoRunning(!isDemoRunning);
  };

  const handleDemoReset = (): void => {
    setDemoRunning(false);
    setTimeLeft(5 * 60);
    setDemoFocus(0);
  };

  // Hàm Đăng xuất
  const handleLogout = async () => {
    await clientLogout();
    setUser(null);
    router.refresh();
  };

  return (
    // === Main container ===
    <main className="w-screen text-gray-700 bg-white">
      {/* === HEADER CỐ ĐỊNH === */}
      <header
        className={cn(
          "fixed top-0 z-50 flex w-full items-center justify-between p-4",
          "transition-colors duration-300 ease-in-out",
          isScrolled
            ? "bg-white shadow-md text-blue-800"
            : "bg-linear-to-b from-black/50 to-transparent text-white"
        )}
      >
        <div className="flex items-center gap-6 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Brain
              className={cn(
                "h-8 w-8 transition-colors",
                isScrolled ? "text-blue-500" : "text-white"
              )}
            />
            <span
              className={cn(
                "text-2xl font-bold transition-colors",
                isScrolled ? "text-blue-800" : "text-white"
              )}
            >
              Optimind
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex gap-6">
            <Link
              href="#features"
              className={cn(
                "font-medium transition-colors",
                isScrolled
                  ? "text-blue-800 hover:text-blue-600"
                  : "text-white hover:text-white/80"
              )}
            >
              Có gì hay?
            </Link>
            <Link
              href="#reviews"
              className={cn(
                "font-medium transition-colors",
                isScrolled
                  ? "text-blue-800 hover:text-blue-600"
                  : "text-white hover:text-white/80"
              )}
            >
              Cộng đồng
            </Link>
            <Link
              href="#faq"
              className={cn(
                "font-medium transition-colors",
                isScrolled
                  ? "text-blue-800 hover:text-blue-600"
                  : "text-white hover:text-white/80"
              )}
            >
              Hỏi đáp
            </Link>
          </nav>

          {/* === Nút Đăng nhập / Đăng ký === */}
          <div className="flex gap-2 ml-auto">
            {loading && (
              <div className="flex gap-2">
                <div className="h-10 w-24 rounded-full bg-gray-500/30 animate-pulse" />
                <div className="h-10 w-36 rounded-full bg-gray-500/30 animate-pulse" />
              </div>
            )}

            {!loading && !user && (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "transition-colors text-base rounded-full",
                    isScrolled
                      ? "text-blue-800 hover:bg-gray-100"
                      : "text-white hover:bg-white/20"
                  )}
                >
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Đăng nhập
                  </Link>
                </Button>
                <Button
                  asChild
                  className={cn(
                    "text-base rounded-full",
                    isScrolled
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-white hover:bg-gray-200 text-blue-600"
                  )}
                >
                  <Link href="/register">Tham gia ngay</Link>
                </Button>
              </>
            )}

            {!loading && user && (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className={cn(
                    "transition-colors text-base rounded-full",
                    isScrolled
                      ? "text-blue-800 hover:bg-gray-100"
                      : "text-white hover:bg-white/20"
                  )}
                >
                  <Link href="/history">
                    <History className="mr-2 h-4 w-4" />
                    Lịch sử
                  </Link>
                </Button>
                <Button
                  asChild
                  className={cn(
                    "text-base rounded-full text-white",
                    "bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                  )}
                >
                  <Link href="/study">
                    <Play className="mr-2 h-4 w-4" />
                    Vào bàn học
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={cn(
                    "transition-colors text-base rounded-full",
                    isScrolled
                      ? "text-blue-800 hover:bg-gray-100"
                      : "text-white hover:bg-white/20"
                  )}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* === PHẦN 1: HERO === */}
      <section
        className={cn(
          "w-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden",
          "h-[550px] max-h-[600px]"
        )}
      >
        <img
          src={backgroundHeroUrl}
          alt="Optimind Hero Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 w-full max-w-3xl animate-fade-in-up p-8">
          <h1
            className="text-6xl font-extrabold leading-tight text-white"
            style={{ textShadow: "0 4px 15px rgba(0,0,0,0.5)" }}
          >
            Học tập trung <br /> Chơi hết mình
          </h1>
          <p
            className="mt-6 text-xl text-gray-100 max-w-2xl mx-auto"
            style={{ textShadow: "0 2px 5px rgba(0,0,0,0.3)" }}
          >
            Đừng để sự xao nhãng đánh cắp tương lai của bạn. Optimind biến mỗi
            giờ học thành trạng thái "Deep Work" thực thụ.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-lg h-14 px-8 rounded-full text-white"
            >
              <Link href="/register">Bắt đầu hành trình ngay</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* === PHẦN 2: HỖ TRỢ === */}
      <section
        id="features"
        className="h-auto w-screen flex flex-col items-center justify-center p-8 py-24 bg-white"
      >
        <h2 className="text-5xl font-bold mb-4 text-center text-blue-800">
          Tại sao bạn cần Optimind?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto mt-16">
          {/* Cột 1: Tập trung */}
          <div className="flex flex-col items-center text-center animate-fade-in-up">
            <Brain className="w-12 h-12 text-blue-500" />
            <h3 className="text-3xl font-semibold my-4 text-blue-800">
              "Tập trung hơn"
            </h3>
            <p className="text-lg text-gray-700">
              AI nhẹ nhàng nhắc nhở mỗi khi bạn có các cử động vi mô bất thường, báo hiệu mất 	tập trung hoặc mệt mỏi.
            </p>
            <Button
              variant="link"
              className="text-lg text-blue-700 p-0 mt-2"
            >
              Tìm hiểu thêm <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {/* Cột 2: Hiệu quả */}
          <div
            className="flex flex-col items-center text-center animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Timer className="w-12 h-12 text-green-500" />
            <h3 className="text-3xl font-semibold my-4 text-blue-800">
              Xử gọn Deadline
            </h3>
            <p className="text-lg text-gray-700">
              Kết hợp Pomodoro và quản lý Task thông minh. Làm xong sớm, nghỉ
              ngơi sớm, không dây dưa.
            </p>
            <Button
              variant="link"
              className="text-lg text-blue-700 p-0 mt-2"
            >
              Tìm hiểu thêm <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {/* Cột 3: Động lực */}
          <div
            className="flex flex-col items-center text-center animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <Star className="w-12 h-12 text-yellow-500" />
            <h3 className="text-3xl font-semibold my-4 text-blue-800">
              Học chán? Có Pet lo
            </h3>
            <p className="text-lg text-gray-700">
              Biến việc học thành game. Bạn tập trung càng lâu, Pet của bạn càng
              lớn và "xịn" hơn.
            </p>
            <Button
              variant="link"
              className="text-lg text-blue-700 p-0 mt-2"
            >
              Tìm hiểu thêm <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* === PHẦN 3: DEMO === */}
      <section
        className={cn(
          "relative w-screen flex flex-col items-center justify-center p-8 overflow-hidden",
          "py-10"
        )}
      >
        {/* Ảnh nền */}
        <img
          src={backgroundDemoUrl}
          alt="Demo background"
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 opacity-80",
            maskClass
          )}
        />

        {/* Tiêu đề */}
        <div className="relative z-10 w-full max-w-4xl text-center mb-8">
          <h2
            className="text-5xl font-bold mb-4 text-white"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          >
            Thử thách 5 phút!
          </h2>
          <p
            className="text-lg text-gray-100"
            style={{ textShadow: "0 1px 5px rgba(0,0,0,0.5)" }}
          >
            Bật camera lên và xem AI chấm điểm độ tập trung của bạn như thế nào
            nhé.
          </p>
        </div>

        {/* Container cho nội dung Demo */}
        <div
          className={cn(
            "w-full max-w-4xl rounded-2xl shadow-2xl",
            "relative z-10",
            "bg-white/80 backdrop-blur-sm overflow-hidden"
          )}
        >
          <div className={cn("w-full p-8")}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Cột 1: Timer + Chart */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                {/* Timer & Buttons */}
                <div className="w-full flex-1 flex flex-col items-center justify-center p-6 bg-gray-100/80 rounded-lg shadow-inner">
                  <h3 className="text-2xl font-semibold mb-4 text-blue-800">
                    Đồng hồ Pomodoro
                  </h3>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-6xl font-bold text-blue-800">
                      {" "}
                      {formatTime(timeLeft)}
                    </div>
                    <div className="flex flex-col gap-2">
                      {" "}
                      <Button
                        onClick={handleDemoToggle}
                        size="icon"
                        className="rounded-full"
                      >
                        {isDemoRunning ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        onClick={handleDemoReset}
                        size="icon"
                        variant="outline"
                        className="rounded-full"
                      >
                        <RefreshCcw className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Chart (BÊN DƯỚI) */}
                <div className="h-32 w-full bg-gray-100/80 rounded-lg p-4 shadow-inner">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-800">
                    <BarChart3 className="w-5 h-5" /> Chỉ số tập trung
                  </h4>
                  <div className="flex items-end h-20 gap-1">
                    <span className="text-3xl font-bold text-green-600">
                      {isDemoRunning
                        ? `${demoFocus}%`
                        : "--%"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cột 2: Camera với AI thật (BÊN PHẢI) */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                  <VideoEngagementAnalyzer
                    onScoreUpdate={handleFocusScoreUpdate}
                    isActive={isDemoRunning}
                  />
                  <div
                    className={cn(
                      "absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium z-10 shadow-lg",
                      isDemoRunning
                        ? demoFocus >= 65
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-600 text-white"
                    )}
                  >
                    {isDemoRunning
                      ? demoFocus >= 65
                        ? "🎯 Đang tập trung"
                        : "⚠️ Mất tập trung"
                      : "📷 Camera tắt"}
                  </div>
                </div>
                {/* Thông tin AI */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      AI Real-time Score
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {Math.round(demoFocus)}/100
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 ease-out",
                        demoFocus >= 65 ? "bg-green-500" : "bg-red-500"
                      )}
                      style={{ width: `${demoFocus}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {isDemoRunning
                      ? "✨ AI đang quan sát bạn..."
                      : "▶️ Nhấn Play để AI bắt đầu phân tích"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === PHẦN 4: TÍNH NĂNG === */}
      <section className="h-auto w-screen flex flex-col items-center justify-center p-8 py-24 bg-white">
        <h2 className="text-5xl font-bold mb-16 text-center text-blue-800">
          Công cụ "hack" não bộ
        </h2>
        <div className="flex flex-col gap-16 max-w-7xl">
          {/* Tính năng 1: Đo lường */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <img
                src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format=fit=crop"
                alt="Đo lường tập trung"
                className={cn(
                  "rounded-2xl shadow-xl w-full object-cover",
                  "h-[450px]"
                )}
              />
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Brain className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-4xl font-semibold mb-4 text-blue-800">
                AI Giám Sát (Nhưng không mách lẻo)
              </h3>
              <p className="text-lg text-gray-700">
                Chỉ cần bạn ngáp, nhìn đi chỗ khác hay rời bàn, AI sẽ biết ngay.
                Cuối ngày, bạn sẽ nhận được biểu đồ năng suất để biết giờ nào
                mình học "vào" nhất, giờ nào thì nên đi ngủ.
              </p>
            </div>
          </div>

          {/* Tính năng 2: Gamification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="md:order-last animate-fade-in-up">
              <img
                src="https://images.unsplash.com/photo-1599481238640-4c1278592A6a?q=80&w=800&auto=format=fit=crop"
                alt="Gamification"
                className={cn(
                  "rounded-2xl shadow-xl w-full object-cover",
                  "h-[450px]"
                )}
              />
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Star className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-4xl font-semibold mb-4 text-blue-800">
                Nuôi Pet bằng sự tập trung
              </h3>
              <p className="text-lg text-gray-700">
                Mỗi phút bạn học nghiêm túc là thức ăn cho Pet. Bạn lười, Pet
                đói. Bạn chăm, Pet lớn và tiến hóa. Đua top bảng xếp hạng với
                bạn bè xem Pet nhà ai "ngầu" hơn.
              </p>
            </div>
          </div>

          {/* Tính năng 3: Phòng học */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format=fit=crop"
                alt="Phòng học nhóm"
                className={cn(
                  "rounded-2xl shadow-xl w-full object-cover",
                  "h-[450px]"
                )}
              />
            </div>
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <Users className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-4xl font-semibold mb-4 text-blue-800">
                Solo 1vs1: Ai lì hơn?
              </h3>
              <p className="text-lg text-gray-700">
                Học một mình buồn ngủ? Rủ thằng bạn thân vào phòng thách đấu. Ai
                mất tập trung trước người đó thua. Áp lực đồng trang lứa đôi khi
                lại là liều thuốc tốt nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === PHẦN 5: NHẬN XÉT === */}
      <section
        id="reviews"
        className="h-auto w-screen flex flex-col items-center justify-center p-8 py-24 bg-blue-600 text-white overflow-hidden"
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <h2 className="text-5xl font-bold mb-12">Hội những người đã "thoát kiếp" lười</h2>
        <div className="w-full max-w-7xl flex overflow-x-auto gap-8 scroll-snap-type-x-mandatory no-scrollbar pb-4">
          <div
            className={cn(
              "p-8 bg-white/10 rounded-2xl border border-white/20",
              "w-[90%] md:w-[400px] shrink-0 scroll-snap-align-start"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src="/avatars/01.png" />
                <AvatarFallback>MA</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">Minh Anh</h4>
                <p className="text-sm text-gray-300">Sinh viên Bách Khoa</p>
              </div>
            </div>
            <p className="text-lg text-gray-100 italic">
              "Đợt đồ án vừa rồi mình stress kinh khủng, cứ ngồi vào bàn là cầm
              điện thoại. Nhờ con Optimind này mà mình cai được TikTok. Nuôi con
              Rồng cấp 3 nhìn oai phết!"
            </p>
          </div>
          <div
            className={cn(
              "p-8 bg-white/10 rounded-2xl border border-white/20",
              "w-[90%] md:w-[400px] shrink-0 scroll-snap-align-start"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src="/avatars/02.png" />
                <AvatarFallback>TT</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">Thanh Tùng</h4>
                <p className="text-sm text-gray-300">Học sinh lớp 12</p>
              </div>
            </div>
            <p className="text-lg text-gray-100 italic">
              "Tính năng solo 1v1 cực cuốn. Mình với thằng bạn cày đêm ôn thi,
              đứa nào điểm focus thấp hơn phải bao ăn sáng. Thế là cả hai đứa
              tự nhiên học như điên."
            </p>
          </div>
          <div
            className={cn(
              "p-8 bg-white/10 rounded-2xl border border-white/20",
              "w-[90%] md:w-[400px] shrink-0 scroll-snap-align-start"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src="/avatars/03.png" />
                <AvatarFallback>NL</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">Ngọc Lan</h4>
                <p className="text-sm text-gray-300">Freelance Writer</p>
              </div>
            </div>
            <p className="text-lg text-gray-100 italic">
              "Làm ở nhà rất dễ xao nhãng. Cái biểu đồ phân tích giúp mình nhận
              ra mình chỉ tập trung tốt vào buổi sáng. Giờ mình sắp xếp việc
              hợp lý hơn hẳn."
            </p>
          </div>
          <div
            className={cn(
              "p-8 bg-white/10 rounded-2xl border border-white/20",
              "w-[90%] md:w-[400px] shrink-0 scroll-snap-align-start"
            )}
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src="/avatars/04.png" />
                <AvatarFallback>HP</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold">Hoàng Phúc</h4>
                <p className="text-sm text-gray-300">Sinh viên Y khoa</p>
              </div>
            </div>
            <p className="text-lg text-gray-100 italic">
              "Kiến thức ngành Y nhiều khủng khiếp. Chia nhỏ task ra rồi chạy
              Pomodoro là cách duy nhất mình sống sót qua mùa thi. App mượt,
              không quảng cáo, 10 điểm."
            </p>
          </div>
        </div>
      </section>

      {/* === PHẦN 6: VỀ CHÚNG TÔI === */}
      <section className="h-auto w-screen flex flex-col items-center justify-center p-8 py-24 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-7xl">
          <div className="animate-fade-in-up">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format=fit=crop"
              alt="Đội ngũ Optimind"
              className={cn(
                "rounded-2xl shadow-xl w-full object-cover",
                "h-[450px]"
              )}
            />
          </div>
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-4xl font-semibold mb-4 text-blue-800">
              Từ những "kẻ mộng mơ" lười biếng
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Tụi mình cũng từng là sinh viên, cũng từng vật vã vì lướt TikTok
              quên lối về mỗi mùa thi. Optimind ra đời không phải từ những
              chuyên gia xa lạ, mà từ chính nhu cầu "cứu vớt" tấm bằng của
              nhóm sáng lập.
            </p>
            <h3 className="text-3xl font-semibold mb-4 text-blue-800">
              Mục tiêu đơn giản
            </h3>
            <p className="text-lg text-gray-700">
              Làm cho việc học bớt khổ sở và vui như chơi game. Chúng tôi tin
              rằng công nghệ không nên là kẻ thù của sự tập trung, mà nên là
              đồng minh (miễn là bạn dùng đúng cách).
            </p>
          </div>
        </div>
      </section>

      {/* === PHẦN 7: FAQ === */}
      <section
        id="faq"
        className="h-auto w-screen flex flex-col items-center justify-center p-8 py-24 bg-gray-100"
      >
        <h2 className="text-5xl font-bold mb-12 text-blue-800">
          Thắc mắc thường gặp
        </h2>
        <div className={cn("w-full max-w-3xl p-6", whiteBox)}>
          <h4 className="text-xl font-semibold mb-4 text-blue-600">
            Về công nghệ & Riêng tư
          </h4>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg text-blue-800 text-left">
                Optimind biết mình mất tập trung kiểu gì?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-700">
                AI sẽ phân tích cử chỉ khuôn mặt và mắt của bạn. Nếu bạn ngáp
                ngắn ngáp dài, nhìn ngó nghiêng hoặc "biến mất" khỏi khung hình
                quá lâu, hệ thống sẽ trừ điểm ngay.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg text-blue-800 text-left">
                Bật camera có sợ lộ hình ảnh nhạy cảm không?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-700">
                Yên tâm tuyệt đối nhé! Toàn bộ quá trình xử lý diễn ra ngay trên
                trình duyệt của bạn (Local). Hình ảnh KHÔNG BAO GIỜ được gửi về
                máy chủ của tụi mình. Bí mật của bạn vẫn là của bạn.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <h4 className="text-xl font-semibold mb-4 mt-8 text-blue-600">
            Tính năng & Game
          </h4>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg text-blue-800 text-left">
                Điểm thưởng (Points) dùng để làm gì?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-700">
                Như tiền trong game vậy! Bạn dùng điểm để mua thức ăn, quần áo,
                phụ kiện cho Pet. Sau này tụi mình còn update thêm tính năng đổi
                quà thật nữa (Coming soon).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg text-blue-800 text-left">
                Có tốn tiền không?
              </AccordionTrigger>
              <AccordionContent className="text-base text-gray-700">
                Gói Free là đủ dùng cho nhu cầu cơ bản (Pomodoro + Task). Nhưng
                nếu muốn AI phân tích sâu, mở khóa Pet hiếm và phòng đấu Rank,
                bạn có thể ủng hộ tụi mình gói Pro (rẻ hơn 1 ly trà sữa/tháng).
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* === PHẦN 8: HƯỚNG DẪN SỬ DỤNG === */}
      <section
        className={cn(
          "h-auto w-screen flex flex-col items-center justify-center p-8 py-24 relative overflow-hidden"
        )}
      >
        {/* Ảnh nền họa tiết */}
        <img
          src={backgroundGuideUrl}
          alt="Waves background"
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-0 opacity-40 blur-sm"
          )}
        />
        <div className="relative z-10 text-center mb-12 p-6">
          <h2
            className="text-5xl font-bold mb-8 text-blue-800"
            style={{
              textShadow: "0 2px 10px rgba(255,255,255,0.3)",
            }}
          >
            4 Bước để "hack" sự tập trung
          </h2>
          <p
            className="text-xl text-gray-700 max-w-3xl mx-auto"
            style={{
              textShadow: "0 1px 5px rgba(255,255,255,0.2)",
            }}
          >
            Đơn giản, dễ làm, hiệu quả ngay từ lần đầu tiên.
          </p>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          {/* Đường timeline */}
          <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-1 bg-gray-200 -translate-x-1/2" />

          <div className="relative flex flex-col items-center gap-4">
            {/* Bước 1 */}
            <div className="w-full md:w-1/2 md:pr-12 flex gap-6 items-center">
              <div
                className={cn(
                  "p-6 text-left",
                  whiteBox,
                  "flex-1"
                )}
              >
                <h4 className="text-2xl font-semibold mt-2 mb-2 text-blue-800">
                  1. Lên nòng (Plan)
                </h4>
                <p className="text-gray-700">
                  Vào mục 'Kế hoạch', liệt kê những thứ cần làm. Đừng tham, chọn
                  3 việc quan trọng nhất thôi.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-20 h-20 bg-blue-500 text-white rounded-full shrink-0 shadow-lg">
                <CheckSquare className="w-10 h-10" />
              </div>
            </div>

            {/* Bước 2 */}
            <div className="w-full md:w-1/2 md:pl-12 md:self-end flex gap-6 items-center">
              <div className="hidden md:flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full shrink-0 shadow-lg">
                <Camera className="w-10 h-10" />
              </div>
              <div
                className={cn(
                  "p-6 text-left",
                  whiteBox,
                  "flex-1"
                )}
              >
                <h4 className="text-2xl font-semibold mt-2 mb-2 text-blue-800">
                  2. Chiến (Focus)
                </h4>
                <p className="text-gray-700">
                  Bật cam, chọn task, nhấn Play. Lúc này là lúc "Deep Work". AI
                  sẽ canh chừng cho bạn.
                </p>
              </div>
            </div>

            {/* Bước 3 */}
            <div className="w-full md:w-1/2 md:pr-12 flex gap-6 items-center">
              <div
                className={cn(
                  "p-6 text-left",
                  whiteBox,
                  "flex-1"
                )}
              >
                <h4 className="text-2xl font-semibold mt-2 mb-2 text-blue-800">
                  3. Soi (Analyze)
                </h4>
                <p className="text-gray-700">
                  Học xong xem lại biểu đồ (<PieChart className="inline w-4 h-4" />).
                  Xem mình lơ đễnh lúc nào để lần sau rút kinh nghiệm.
                </p>
              </div>
              <div className="hidden md:flex items-center justify-center w-20 h-20 bg-purple-500 text-white rounded-full shrink-0 shadow-lg">
                <PieChart className="w-10 h-10" />
              </div>
            </div>

            {/* Bước 4 */}
            <div className="w-full md:w-1/2 md:pl-12 md:self-end flex gap-6 items-center">
              <div className="hidden md:flex items-center justify-center w-20 h-20 bg-yellow-500 text-white rounded-full shrink-0 shadow-lg">
                <Star className="w-10 h-10" />
              </div>
              <div
                className={cn(
                  "p-6 text-left",
                  whiteBox,
                  "flex-1"
                )}
              >
                <h4 className="text-2xl font-semibold mt-2 mb-2 text-blue-800">
                  4. Nhận quà (Reward)
                </h4>
                <p className="text-gray-700">
                  Nhận điểm kinh nghiệm, cho Pet ăn, leo rank. Cảm giác hoàn
                  thành mục tiêu nó "phê" lắm (<Star className="inline w-4 h-4" />).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === PHẦN 9: CTA & FOOTER === */}
      <footer
        className={cn(
          "h-auto w-screen p-8 py-24 bg-gray-900 text-white relative overflow-hidden"
        )}
      >
        {/* Ảnh nền cho footer */}
        <img
          src={backgroundFooterUrl}
          alt="Footer Background"
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-20"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto">
          {/* Nút CTA ở trên */}
          <div className="text-center mb-16 p-8">
            <h2
              className="text-5xl font-bold mb-8 text-white"
              style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
            >
              Còn chờ gì nữa?
            </h2>
            <Button
              asChild
              size="lg"
              className="bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-lg h-16 px-10 rounded-full text-white"
            >
              <Link href="/register">Tham gia Optimind ngay (Miễn phí)</Link>
            </Button>
          </div>

          {/* === FOOTER MỞ RỘNG === */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Cột 1: Logo */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-7 w-7 text-blue-300" />
                <span className="text-2xl font-bold text-white">
                  Optimind
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Đồng hành cùng bạn chinh phục mọi deadline. <br />© 2025 Optimind.
              </p>
            </div>

            {/* Các cột link giữ nguyên nhưng dịch text cho tự nhiên hơn nếu cần */}
            <div>
              <h5 className="font-semibold text-white mb-4">Về tụi mình</h5>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white">Câu chuyện</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white">Tuyển dụng</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog học tập</Link></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-4">Ưu đãi</h5>
              <ul className="space-y-3">
                <li><Link href="/gift" className="text-gray-400 hover:text-white">Tặng bạn bè</Link></li>
                <li><Link href="/redeem" className="text-gray-400 hover:text-white">Nhập Code</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Hợp tác</h5>
              <ul className="space-y-3">
                <li><Link href="/schools" className="text-gray-400 hover:text-white">Cho Trường học</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Cần giúp đỡ?</h5>
              <ul className="space-y-3">
                <li><Link href="#faq" className="text-gray-400 hover:text-white">Câu hỏi thường gặp</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white">Liên hệ Support</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white">Chính sách bảo mật</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-700">
             <div className="flex gap-4">
               {/* Social Icons giữ nguyên */}
                <Link href="#" className="text-gray-400 hover:text-white"><Facebook className="w-6 h-6" /></Link>
                <Link href="#" className="text-gray-400 hover:text-white"><Twitter className="w-6 h-6" /></Link>
                <Link href="#" className="text-gray-400 hover:text-white"><Instagram className="w-6 h-6" /></Link>
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}