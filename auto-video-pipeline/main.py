"""
Orchestrator chính (Điều phối viên) của hệ thống Auto Video Pipeline.
Tập hợp và điều khiển tuần tự 5 công đoạn:
1. Tìm video nguồn (source_finder)
2. Render video hoàn chỉnh (app_v70)
3. Sinh caption và đăng bài lên 3 Fanpage Facebook (ollama_agent)
4. Dọn dẹp tài nguyên (cleanup)
5. Lặp lại 24/7 theo lịch biểu (scheduler)
"""

import sys
import argparse
from pathlib import Path
from typing import Optional

from config import config
from logger import app_logger
from scheduler import run_pipeline_scheduler


def run_pipeline_iteration() -> bool:
    """
    Thực thi 1 chu kỳ hoàn chỉnh của Pipeline từ tìm video đến khi đăng Facebook.

    Returns:
        bool: True nếu quy trình chạy thành công, False nếu gặp lỗi gián đoạn.
    """
    app_logger.info(">>> [BƯỚC 1/5] Khởi động chu kỳ xử lý video...")

    # Kiểm tra cấu hình trước khi thực hiện
    warnings = config.validate_for_pipeline()
    if warnings:
        for w in warnings:
            app_logger.warning("Cảnh báo cấu hình: {}", w)

    # Các module tiếp theo sẽ được tích hợp đầy đủ ở Phase 2, 3, 4:
    app_logger.info(">>> [BƯỚC 2/5] Đang chờ module source_finder (Phase 2)...")
    app_logger.info(">>> [BƯỚC 3/5] Đang chờ module app_v70 render pipeline (Phase 3)...")
    app_logger.info(">>> [BƯỚC 4/5] Đang chờ module ollama_agent caption & post FB (Phase 4)...")
    app_logger.info(">>> [BƯỚC 5/5] Hoàn tất và dọn dẹp (Phase 5)...")

    return True


def main() -> None:
    """
    Điểm vào chính (Entry point) khi chạy chương trình từ dòng lệnh.
    Hỗ trợ 2 chế độ:
    - Chạy thử nghiệm ngay 1 lần: python main.py --run-once
    - Chạy chế độ 24/7 theo lịch: python main.py --schedule (hoặc mặc định không truyền cờ)
    """
    parser = argparse.ArgumentParser(
        description="Auto Video Pipeline 24/7 - Hệ thống sản xuất và đăng video tự động lên Facebook"
    )
    parser.add_argument(
        "--run-once",
        action="store_true",
        help="Chạy thử nghiệm ngay lập tức 1 chu kỳ rồi thoát (không đợi lịch hẹn)",
    )
    parser.add_argument(
        "--schedule",
        action="store_true",
        help="Khởi chạy tiến trình lập lịch 24/7 (mặc định)",
    )

    args = parser.parse_args()

    app_logger.info("Khởi động hệ thống Auto Video Pipeline...")
    app_logger.info("Thư mục gốc: {}", config.BASE_DIR)

    if args.run_once:
        app_logger.info("Chế độ: Chạy thử nghiệm 1 lần (--run-once)")
        success = run_pipeline_iteration()
        if success:
            app_logger.info("Chu kỳ chạy thử nghiệm kết thúc thành công.")
            sys.exit(0)
        else:
            app_logger.error("Chu kỳ chạy thử nghiệm thất bại.")
            sys.exit(1)
    else:
        app_logger.info("Chế độ: Chạy tự động 24/7 theo lịch hẹn ({})", config.SCHEDULE_HOURS)
        run_pipeline_scheduler(task_callback=run_pipeline_iteration)


if __name__ == "__main__":
    main()
