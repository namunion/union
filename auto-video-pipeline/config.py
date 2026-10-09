"""
Module quản lý cấu hình tập trung cho toàn bộ hệ sinh thái Auto Video Pipeline.
Tải các giá trị từ file .env và cung cấp cấu hình chuẩn hóa với kiểu dữ liệu rõ ràng.
"""

import os
from pathlib import Path
from typing import List

# Nạp file .env an toàn (nếu thư viện python-dotenv đã được cài đặt)
ENV_PATH = Path(__file__).resolve().parent / ".env"
try:
    from dotenv import load_dotenv
    if ENV_PATH.exists():
        load_dotenv(dotenv_path=ENV_PATH)
    else:
        load_dotenv()
except ImportError:
    # Nếu chưa chạy 'pip install -r requirements.txt', tự đọc file .env thủ công
    if ENV_PATH.exists():
        try:
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception:
            pass


class AppConfig:
    """
    Lớp chứa toàn bộ thông số cấu hình của ứng dụng.
    Mọi thông số đều được nạp từ biến môi trường (.env), kèm giá trị mặc định an toàn.
    """

    def __init__(self) -> None:
        # Đường dẫn gốc của project
        self.BASE_DIR: Path = Path(__file__).resolve().parent

        # 1. Cấu hình AI (DeepSeek & Google Gemini)
        self.DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "").strip()
        self.DEEPSEEK_BASE_URL: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").strip()
        self.DEEPSEEK_MODEL: str = os.getenv("DEEPSEEK_MODEL", "deepseek-chat").strip()

        self.GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
        self.GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()

        # 2. Cấu hình lịch chạy tự động 24/7 (Scheduler)
        schedule_hours_raw: str = os.getenv("SCHEDULE_HOURS", "8,12,18")
        self.SCHEDULE_HOURS: List[int] = self._parse_int_list(schedule_hours_raw, default=[8, 12, 18])
        self.TIMEZONE: str = os.getenv("TIMEZONE", "Asia/Ho_Chi_Minh").strip()

        # 3. Nguồn tải video (YouTube Channels & RSS Feeds)
        yt_channels_raw: str = os.getenv("YOUTUBE_CHANNELS", "")
        self.YOUTUBE_CHANNELS: List[str] = self._parse_string_list(yt_channels_raw)

        rss_feeds_raw: str = os.getenv("RSS_FEEDS", "")
        self.RSS_FEEDS: List[str] = self._parse_string_list(rss_feeds_raw)

        # 4. Cấu hình Render Video & TTS
        self.WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "base").strip()
        self.WHISPER_DEVICE: str = os.getenv("WHISPER_DEVICE", "cpu").strip()
        self.TTS_VOICE: str = os.getenv("TTS_VOICE", "vi-VN-HoaiMyNeural").strip()
        self.TTS_RATE: str = os.getenv("TTS_RATE", "+0%").strip()

        # Phụ đề và Fonts
        font_rel_path = os.getenv("SUBTITLE_FONT_PATH", "assets/fonts/BeVietnamPro-Bold.ttf").strip()
        self.SUBTITLE_FONT_PATH: Path = self.BASE_DIR / font_rel_path
        self.SUBTITLE_FONT_SIZE: int = int(os.getenv("SUBTITLE_FONT_SIZE", "24"))
        self.SUBTITLE_PRIMARY_COLOR: str = os.getenv("SUBTITLE_PRIMARY_COLOR", "&H00FFFFFF").strip()
        self.SUBTITLE_OUTLINE_COLOR: str = os.getenv("SUBTITLE_OUTLINE_COLOR", "&H00000000").strip()

        # 5. Cấu hình Facebook Fanpage (3 Fanpages)
        self.FB_PAGE_1_ID: str = os.getenv("FB_PAGE_1_ID", "").strip()
        self.FB_PAGE_1_TOKEN: str = os.getenv("FB_PAGE_1_TOKEN", "").strip()

        self.FB_PAGE_2_ID: str = os.getenv("FB_PAGE_2_ID", "").strip()
        self.FB_PAGE_2_TOKEN: str = os.getenv("FB_PAGE_2_TOKEN", "").strip()

        self.FB_PAGE_3_ID: str = os.getenv("FB_PAGE_3_ID", "").strip()
        self.FB_PAGE_3_TOKEN: str = os.getenv("FB_PAGE_3_TOKEN", "").strip()

        # 6. Các thư mục làm việc (tự động tạo nếu chưa có)
        self.INPUT_DIR: Path = self.BASE_DIR / os.getenv("INPUT_DIR", "input").strip()
        self.OUTPUT_DIR: Path = self.BASE_DIR / os.getenv("OUTPUT_DIR", "output").strip()
        self.POSTED_DIR: Path = self.BASE_DIR / os.getenv("POSTED_DIR", "output/posted").strip()
        self.LOGS_DIR: Path = self.BASE_DIR / os.getenv("LOGS_DIR", "logs").strip()
        self.ASSETS_DIR: Path = self.BASE_DIR / os.getenv("ASSETS_DIR", "assets").strip()

        # Tạo sẵn các thư mục cần thiết
        self._ensure_directories()

    def _parse_string_list(self, raw_str: str) -> List[str]:
        """Tách chuỗi ngăn cách bởi dấu phẩy thành danh sách các chuỗi con đã cắt khoảng trắng."""
        if not raw_str:
            return []
        return [item.strip() for item in raw_str.split(",") if item.strip()]

    def _parse_int_list(self, raw_str: str, default: List[int]) -> List[int]:
        """Tách chuỗi số ngăn cách bởi dấu phẩy thành danh sách số nguyên."""
        if not raw_str:
            return default
        items: List[int] = []
        for x in raw_str.split(","):
            cleaned = x.strip()
            if cleaned.isdigit():
                items.append(int(cleaned))
        return items if items else default

    def _ensure_directories(self) -> None:
        """Tự động kiểm tra và tạo các thư mục lưu trữ nếu chưa tồn tại."""
        for path in [self.INPUT_DIR, self.OUTPUT_DIR, self.POSTED_DIR, self.LOGS_DIR, self.ASSETS_DIR]:
            path.mkdir(parents=True, exist_ok=True)

    def validate_for_pipeline(self) -> List[str]:
        """
        Kiểm tra tính hợp lệ của cấu hình trước khi chạy pipeline.
        Trả về danh sách các cảnh báo hoặc thiếu sót (nếu có).
        """
        warnings: List[str] = []
        if not self.DEEPSEEK_API_KEY:
            warnings.append("Thiếu DEEPSEEK_API_KEY trong file .env (cần để viết lại kịch bản & caption)")
        if not self.GEMINI_API_KEY:
            warnings.append("Thiếu GEMINI_API_KEY trong file .env (cần để phân tích hình ảnh video)")
        if not (self.FB_PAGE_1_TOKEN or self.FB_PAGE_2_TOKEN or self.FB_PAGE_3_TOKEN):
            warnings.append("Chưa cấu hình ít nhất 1 Facebook Page Access Token trong .env")
        return warnings


# Biến cấu hình toàn cục dùng chung cho toàn dự án
config = AppConfig()
