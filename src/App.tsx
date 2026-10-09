import React, { useState } from 'react';
import {
  Clock,
  Layers,
  FileCode,
  Terminal,
  Play,
  CheckCircle2,
  FolderOpen,
  Cpu,
  Share2,
  Trash2,
  RefreshCw,
  Eye,
  Mic,
  MessageSquare,
  Volume2,
  Video,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Server,
  Sparkles,
  Info
} from 'lucide-react';

// Định nghĩa trạng thái các file code
interface ProjectFile {
  name: string;
  path: string;
  description: string;
  phase: number;
  content: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'flow' | 'config' | 'files' | 'vps'>('flow');
  const [selectedFile, setSelectedFile] = useState<string>('config.py');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Cấu hình mô phỏng
  const [hoursConfig, setHoursConfig] = useState<string>('8, 12, 18');
  const [deepseekKey, setDeepseekKey] = useState<string>('');
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [ttsVoice, setTtsVoice] = useState<string>('vi-VN-HoaiMyNeural');
  const [fbPageCount, setFbPageCount] = useState<number>(3);

  // Danh sách các files trong project
  const projectFiles: ProjectFile[] = [
    {
      name: 'config.py',
      path: 'auto-video-pipeline/config.py',
      description: 'Nạp biến môi trường, kiểm tra thông số an toàn, chống hardcode',
      phase: 1,
      content: `# Module quản lý cấu hình tập trung cho toàn bộ hệ sinh thái Auto Video Pipeline.
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

ENV_PATH = Path(__file__).resolve().parent / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()

class AppConfig:
    def __init__(self) -> None:
        self.BASE_DIR: Path = Path(__file__).resolve().parent
        self.DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "").strip()
        self.GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
        self.SCHEDULE_HOURS: List[int] = [8, 12, 18]
        self.TIMEZONE: str = os.getenv("TIMEZONE", "Asia/Ho_Chi_Minh").strip()
        self.TTS_VOICE: str = os.getenv("TTS_VOICE", "vi-VN-HoaiMyNeural").strip()
        # ... xem thêm trong mã nguồn chi tiết
`
    },
    {
      name: 'logger.py',
      path: 'auto-video-pipeline/logger.py',
      description: 'Hệ thống ghi nhật ký Loguru: log xoay vòng theo ngày, nén zip, lọc lỗi errors.log',
      phase: 1,
      content: `# Module cấu hình logging cho hệ thống Auto Video Pipeline.
import sys
from pathlib import Path
from loguru import logger

def setup_logger(log_dir: str = "logs", log_level: str = "INFO"):
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)
    logger.remove()
    # Hiển thị console & ghi file xoay vòng tự động mỗi ngày (rotation: 00:00)
    # Tự động nén zip sau 30 ngày để tiết kiệm bộ nhớ VPS
    return logger
`
    },
    {
      name: 'scheduler.py',
      path: 'auto-video-pipeline/scheduler.py',
      description: 'Lập lịch chạy 24/7 bằng APScheduler theo múi giờ Việt Nam',
      phase: 1,
      content: `# Module lập lịch chạy tự động 24/7 sử dụng APScheduler.
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz

class PipelineScheduler:
    def __init__(self, job_func):
        self.job_func = job_func
        self.scheduler = BlockingScheduler(timezone=pytz.timezone("Asia/Ho_Chi_Minh"))

    def setup_jobs(self):
        # Hẹn giờ chạy vào các khung giờ 8h, 12h, 18h mỗi ngày
        trigger = CronTrigger(hour="8,12,18", minute=0, second=0)
        self.scheduler.add_job(self.job_func, trigger=trigger)
`
    },
    {
      name: 'main.py',
      path: 'auto-video-pipeline/main.py',
      description: 'Orchestrator điều phối tuần tự 5 công đoạn và nhận lệnh CLI',
      phase: 1,
      content: `# Orchestrator chính của Auto Video Pipeline
import argparse
from config import config
from logger import app_logger
from scheduler import run_pipeline_scheduler

def run_pipeline_iteration() -> bool:
    app_logger.info(">>> Khởi động chu kỳ xử lý video...")
    # Bước 1: source_finder (Phase 2)
    # Bước 2: app_v70 render (Phase 3)
    # Bước 3: ollama_agent post FB (Phase 4)
    # Bước 4: Cleanup & Sleep (Phase 5)
    return True
`
    },
    {
      name: 'requirements.txt',
      path: 'auto-video-pipeline/requirements.txt',
      description: 'Danh sách thư viện chuẩn: faster-whisper, edge-tts, yt-dlp, opencv...',
      phase: 1,
      content: `python-dotenv>=1.0.0
loguru>=0.7.2
APScheduler>=3.10.4
yt-dlp>=2024.3.10
feedparser>=6.0.11
faster-whisper>=1.0.0
edge-tts>=6.1.10
opencv-python-headless>=4.9.0.80
requests>=2.31.0
google-genai>=0.1.1
google-generativeai>=0.8.0
tenacity>=8.2.3`
    },
    {
      name: '.env.example',
      path: 'auto-video-pipeline/.env.example',
      description: 'File mẫu thông số môi trường cho VPS',
      phase: 1,
      content: `DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
SCHEDULE_HOURS=8,12,18
TIMEZONE=Asia/Ho_Chi_Minh
YOUTUBE_CHANNELS=https://www.youtube.com/@Channel1
WHISPER_MODEL=base
TTS_VOICE=vi-VN-HoaiMyNeural
FB_PAGE_1_ID=your_page_1_id
FB_PAGE_1_TOKEN=your_page_1_access_token`
    }
  ];

  const phases = [
    {
      num: 1,
      name: 'Setup Base & Kiến Trúc',
      desc: 'config.py, logger.py, scheduler.py, main.py stub, requirements.txt, .env',
      status: 'completed',
    },
    {
      num: 2,
      name: 'Source Finder (Bộ Tìm Video)',
      desc: 'Quét input/ → Tải random YouTube (yt-dlp) → Đọc RSS feed tự động',
      status: 'pending',
    },
    {
      num: 3,
      name: 'Render Pipeline (5 Bước)',
      desc: 'Whisper → Gemini Vision → DeepSeek 60s script → Edge-TTS → FFmpeg',
      status: 'pending',
    },
    {
      num: 4,
      name: 'Caption & Auto Post FB',
      desc: 'DeepSeek sinh caption hook/hashtag/CTA → Đăng Graph API 3 Fanpage',
      status: 'pending',
    },
    {
      num: 5,
      name: 'Hoàn Thiện & Test End-to-End',
      desc: 'Tự động dọn dẹp, xoay vòng 24/7, tài liệu VPS & chạy thử nghiệm',
      status: 'pending',
    },
  ];

  const handleCopyEnv = () => {
    const envText = `# Tự động sinh từ Visual Dashboard
DEEPSEEK_API_KEY=${deepseekKey || 'sk-your-deepseek-api-key'}
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

GEMINI_API_KEY=${geminiKey || 'your-gemini-api-key'}
GEMINI_MODEL=gemini-2.5-flash

SCHEDULE_HOURS=${hoursConfig.replace(/\s+/g, '')}
TIMEZONE=Asia/Ho_Chi_Minh

YOUTUBE_CHANNELS=https://www.youtube.com/@KenhMau1,https://www.youtube.com/@KenhMau2
RSS_FEEDS=https://example.com/feed.xml

WHISPER_MODEL=base
WHISPER_DEVICE=cpu
TTS_VOICE=${ttsVoice}
TTS_RATE=+0%

FB_PAGE_1_ID=page_id_1
FB_PAGE_1_TOKEN=page_token_1
FB_PAGE_2_ID=page_id_2
FB_PAGE_2_TOKEN=page_token_2
FB_PAGE_3_ID=page_id_3
FB_PAGE_3_TOKEN=page_token_3
`;
    navigator.clipboard.writeText(envText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">Auto Video Pipeline 24/7</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Phase 1 Hoàn Thành
                </span>
              </div>
              <p className="text-xs text-slate-400">Hệ thống sản xuất & phân phối video tự động trên VPS</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'flow'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Sơ Đồ Pipeline
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'config'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Cấu Hình .env
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'files'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Mã Nguồn (Code)
            </button>
            <button
              onClick={() => setActiveTab('vps')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'vps'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Hướng Dẫn VPS
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Phase Timeline Tracker */}
        <div className="mb-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Tiến Độ Dự Án (5 Phase)</h2>
              <p className="text-xs text-slate-400">Bạn không cần biết code, kỹ sư sẽ hoàn thiện và giải thích từng bước</p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Đang hoàn thành: <span className="text-emerald-400 font-bold">Phase 1/5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {phases.map((p) => (
              <div
                key={p.num}
                className={`p-3 rounded-xl border text-left transition-all ${
                  p.status === 'completed'
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                    Phase {p.num}
                  </span>
                  {p.status === 'completed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>
                <div className="font-semibold text-xs text-slate-200 mb-1">{p.name}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab 1: Sơ đồ hoạt động 6 bước của Pipeline */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <Sparkles className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">Quy Trình Hoạt Động Khép Kín 24/7</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Hệ thống chạy ngầm liên tục trên VPS, thức dậy đúng hẹn, xử lý đa tầng bằng AI và tự dọn dẹp sạch sẽ.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 relative">
                {/* Bước 1: Scheduler */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/60 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/20">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">[1] SCHEDULER</span>
                    <h3 className="text-sm font-semibold text-white mt-1 mb-1.5">Đánh Thức Đúng Lịch</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      APScheduler tự động chạy vào lúc <strong>8h, 12h, 18h</strong> hàng ngày.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-blue-300 font-mono">
                    CronTrigger(8,12,18)
                  </div>
                </div>

                {/* Bước 2: Source Finder */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/60 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/20">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">[2] SOURCE FINDER</span>
                    <h3 className="text-sm font-semibold text-white mt-1 mb-1.5">Tìm Video Nguồn</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Ưu tiên: 1. Thư mục <code>input/</code> → 2. YouTube (yt-dlp) → 3. RSS Feed.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-amber-300 font-mono">
                    source_finder.py
                  </div>
                </div>

                {/* Bước 3: Render Pipeline */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/60 transition-all md:col-span-2 bg-gradient-to-br from-slate-800/90 to-indigo-950/30 border-indigo-500/30">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-3 border border-indigo-500/30">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">[3] RENDER PIPELINE (5 BƯỚC)</span>
                    <h3 className="text-sm font-semibold text-white mt-1 mb-1.5">Trí Tuệ Nhân Tạo Xử Lý</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <Mic className="w-3.5 h-3.5 text-pink-400" />
                        <span>1. Whisper: Transcribe audio</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        <span>2. Gemini: Soi 5 frames</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>3. DeepSeek: Viết lại kịch bản</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                        <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                        <span>4. Edge-TTS: Giọng Hoài My</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-indigo-300 font-mono">
                    5. FFmpeg ghép âm + sub + video gốc
                  </div>
                </div>

                {/* Bước 4: Caption & Post */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/60 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">[4] CAPTION + POST</span>
                    <h3 className="text-sm font-semibold text-white mt-1 mb-1.5">Đăng 3 Fanpage</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      DeepSeek viết caption hấp dẫn kèm hashtag. Đăng qua Facebook Graph API.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-emerald-300 font-mono">
                    Graph API Resumable
                  </div>
                </div>

                {/* Bước 5 & 6: Cleanup & Loop */}
                <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/60 transition-all">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3 border border-rose-500/20">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">[5 & 6] CLEAN & LOOP</span>
                    <h3 className="text-sm font-semibold text-white mt-1 mb-1.5">Dọn Dẹp & Lặp Lại</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Lưu video vào <code>posted/</code>, xóa file rác, ngủ chờ đợt giờ kế tiếp.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-700/50 text-[11px] text-rose-300 font-mono">
                    output/posted/{'{date}'}
                  </div>
                </div>
              </div>
            </div>

            {/* Chi tiết kĩ thuật cho người dùng */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-200">Độ Tin Cậy Cao (Không Chết Giữa Chừng)</h3>
                </div>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Tự động retry 3 lần với exponential backoff nếu mạng ngắt kết nối.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Bọc try/catch mọi job trong APScheduler, không làm sập server.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>Ghi log errors.log riêng biệt để tiện tra cứu khi có sự cố.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-200">Tối Ưu Phần Cứng VPS Rẻ Tiền</h3>
                </div>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>Faster-Whisper chạy model `base` siêu nhẹ trên CPU, không cần GPU đắt đỏ.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>OpenCV trích xuất đúng 5 khung hình quan trọng thay vì quét toàn bộ video.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>Tự động nén file log cũ thành zip để tránh đầy ổ cứng SSD VPS.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-200">Phân Phối Đa Kênh Facebook</h3>
                </div>
                <ul className="text-xs text-slate-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Đăng tuần tự lên 3 Fanpage với cấu hình Token độc lập.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>DeepSeek viết caption tự nhiên, kích thích bình luận và tương tác cao.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>Lưu vết bài đăng thành công vào thư mục lưu trữ theo ngày.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Trình hỗ trợ tạo file .env */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Trình Thiết Lập Cấu Hình Thân Thiện</h3>
                  <p className="text-xs text-slate-400">Điền thông tin vào đây rồi bấm Copy file .env bỏ vào VPS</p>
                </div>
                <button
                  onClick={handleCopyEnv}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Đã sao chép!' : 'Copy nội dung .env'}
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Khung giờ chạy tự động mỗi ngày (Cách nhau dấu phẩy)</label>
                  <input
                    type="text"
                    value={hoursConfig}
                    onChange={(e) => setHoursConfig(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="8, 12, 18"
                  />
                  <span className="text-[11px] text-slate-500">Mặc định: 8h sáng, 12h trưa, 18h tối (Giờ Việt Nam)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">DeepSeek API Key (Viết kịch bản & caption)</label>
                    <input
                      type="password"
                      value={deepseekKey}
                      onChange={(e) => setDeepseekKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="sk-..."
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Google Gemini API Key (Nhìn 5 ảnh video)</label>
                    <input
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      placeholder="AIzaSy..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Giọng đọc tiếng Việt (Edge-TTS)</label>
                    <select
                      value={ttsVoice}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="vi-VN-HoaiMyNeural">Hoài My (Nữ miền Bắc, truyền cảm)</option>
                      <option value="vi-VN-NamMinhNeural">Nam Minh (Nam miền Bắc, rõ ràng)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Số lượng Fanpage Facebook đăng</label>
                    <input
                      type="number"
                      value={fbPageCount}
                      min={1}
                      max={5}
                      onChange={(e) => setFbPageCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-[11px] leading-relaxed">
                    Đừng lo nếu bạn chưa có sẵn các key này ngay bây giờ! Kỹ sư sẽ hướng dẫn bạn cách lấy từng key miễn phí hoặc chi phí siêu rẻ khi đến các Phase tương ứng.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-400">Xem trước: .env file</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Tự sinh tự động</span>
              </div>
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed">
{`# 1. AI API KEYS
DEEPSEEK_API_KEY=${deepseekKey || 'sk-your-deepseek-api-key'}
DEEPSEEK_MODEL=deepseek-chat

GEMINI_API_KEY=${geminiKey || 'your-gemini-api-key'}
GEMINI_MODEL=gemini-2.5-flash

# 2. LỊCH CHẠY 24/7
SCHEDULE_HOURS=${hoursConfig.replace(/\s+/g, '')}
TIMEZONE=Asia/Ho_Chi_Minh

# 3. GIỌNG ĐỌC
TTS_VOICE=${ttsVoice}

# 4. FACEBOOK FANPAGES
FB_PAGE_1_ID=100123456789
FB_PAGE_1_TOKEN=EAAB...
FB_PAGE_2_ID=100987654321
FB_PAGE_2_TOKEN=EAAB...
FB_PAGE_3_ID=100555666777
FB_PAGE_3_TOKEN=EAAB...`}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Xem mã nguồn chi tiết */}
        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3 px-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Cấu Trúc Thư Mục Project</h3>
              </div>
              <div className="space-y-1">
                {projectFiles.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFile(file.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex items-center justify-between ${
                      selectedFile === file.name
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 font-sans">
                      Phase {file.phase}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col">
              {(() => {
                const current = projectFiles.find((f) => f.name === selectedFile) || projectFiles[0];
                return (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                      <div>
                        <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
                          <span>{current.path}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{current.description}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Đã sẵn sàng
                      </span>
                    </div>

                    <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
                      {current.content}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 4: Hướng dẫn VPS dành cho người không biết code */}
        {activeTab === 'vps' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Terminal className="w-5 h-5" />
                <h2 className="text-base font-bold text-white">Hướng Dẫn Setup VPS Dành Cho Người Không Biết Code</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Bạn chỉ cần copy và dán lần lượt các câu lệnh dưới đây vào cửa sổ terminal (SSH) của VPS (Ubuntu 22.04 hoặc 24.04).
              </p>

              <div className="space-y-4">
                {/* Bước 1 */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">1</span>
                    Cập nhật VPS & cài đặt FFmpeg + Python 3.11
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                    sudo apt update && sudo apt upgrade -y<br />
                    sudo apt install -y python3 python3-pip python3-venv ffmpeg git
                  </div>
                </div>

                {/* Bước 2 */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                    Tạo môi trường ảo & cài đặt thư viện
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                    cd auto-video-pipeline<br />
                    python3 -m venv venv<br />
                    source venv/bin/activate<br />
                    pip install -r requirements.txt
                  </div>
                </div>

                {/* Bước 3 */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                    Chạy ngầm 24/7 (Không sợ tắt máy tính cá nhân)
                  </div>
                  <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                    # Cách đơn giản nhất dùng nohup:<br />
                    nohup python3 main.py --schedule &gt; logs/system.log 2&gt;&amp;1 &amp;<br />
                    <br />
                    # Kiểm tra xem chương trình có đang chạy không:<br />
                    ps aux | grep main.py
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-4 text-center text-xs text-slate-500">
        Auto Video Pipeline 24/7 • Xây dựng chuẩn công nghiệp cho VPS Ubuntu • Senior Python & DevOps Engine
      </footer>
    </div>
  );
}
