"""
Module lập lịch chạy tự động 24/7 (Scheduler) sử dụng APScheduler.
Tự động kích hoạt toàn bộ quy trình xử lý và đăng video vào các khung giờ cố định trong ngày (ví dụ: 8h, 12h, 18h).
"""

from typing import Callable, Optional

try:
    from apscheduler.schedulers.blocking import BlockingScheduler
    from apscheduler.triggers.cron import CronTrigger
    import pytz
    HAS_SCHEDULER = True
except ImportError:
    HAS_SCHEDULER = False
    BlockingScheduler = None
    CronTrigger = None
    pytz = None

from config import config
from logger import app_logger


class PipelineScheduler:
    """
    Trình quản lý lịch biểu định kỳ cho Auto Video Pipeline.
    Đảm bảo quy trình được đánh thức đúng giờ và xử lý tuần tự.
    """

    def __init__(self, job_func: Callable[[], None]) -> None:
        """
        Khởi tạo Scheduler với hàm công việc sẽ được kích hoạt mỗi khi tới giờ.

        Args:
            job_func: Hàm (function) không tham số đại diện cho chu trình chạy pipeline.
        """
        self.job_func = job_func
        if HAS_SCHEDULER:
            self.scheduler = BlockingScheduler(timezone=pytz.timezone(config.TIMEZONE))
        else:
            self.scheduler = None

    def setup_jobs(self) -> None:
        """
        Cài đặt các mốc thời gian kích hoạt trong ngày dựa trên config.SCHEDULE_HOURS.
        Ví dụ: nếu config là [8, 12, 18], hệ thống sẽ tạo CronTrigger vào lúc 08:00, 12:00, 18:00.
        """
        if not HAS_SCHEDULER:
            app_logger.warning("Thư viện apscheduler hoặc pytz chưa được cài đặt. Vui lòng chạy: pip install -r requirements.txt")
            return

        hours_str = ",".join(str(h) for h in config.SCHEDULE_HOURS)
        trigger = CronTrigger(
            hour=hours_str,
            minute=0,
            second=0,
            timezone=pytz.timezone(config.TIMEZONE),
        )

        self.scheduler.add_job(
            func=self._safe_job_wrapper,
            trigger=trigger,
            id="video_pipeline_daily_job",
            name="Quy trình tự động hóa video định kỳ",
            replace_existing=True,
            misfire_grace_time=3600,  # Cho phép kích hoạt trễ tối đa 1 tiếng nếu máy vừa khởi động lại
        )

        app_logger.info(
            "Đã cài đặt lịch chạy tự động vào các khung giờ [{}] hàng ngày (Múi giờ: {})",
            hours_str,
            config.TIMEZONE,
        )

    def _safe_job_wrapper(self) -> None:
        """
        Hàm bọc bảo vệ khi chạy job:
        Bắt toàn bộ ngoại lệ chưa lường trước để scheduler không bao giờ bị dừng đột ngột.
        """
        app_logger.info("========== BẮT ĐẦU CHU KỲ PIPELINE MỚI THEO LỊCH HẸN ==========")
        try:
            self.job_func()
            app_logger.info("========== HOÀN THÀNH CHU KỲ PIPELINE THEO LỊCH HẸN ==========")
        except Exception as exc:
            app_logger.error("Đã xảy ra lỗi không mong muốn trong chu kỳ pipeline: {}", str(exc))
            app_logger.exception(exc)

    def start(self) -> None:
        """
        Bắt đầu chạy scheduler ở chế độ blocking (giữ tiến trình chạy 24/7).
        """
        if not self.scheduler:
            app_logger.error("Không thể khởi động scheduler vì thiếu thư viện. Hãy cài: pip install apscheduler pytz")
            return

        self.setup_jobs()
        app_logger.info("Scheduler đã bắt đầu chạy ở chế độ 24/7. Nhấn Ctrl+C để dừng.")
        try:
            self.scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            app_logger.warning("Nhận tín hiệu dừng từ người dùng. Scheduler đang tắt dần...")
            self.scheduler.shutdown()
            app_logger.info("Scheduler đã tắt an toàn.")


def run_pipeline_scheduler(task_callback: Callable[[], None]) -> None:
    """
    Hàm tiện ích khởi chạy nhanh scheduler từ bên ngoài.

    Args:
        task_callback: Hàm thực thi chuỗi tác vụ của pipeline.
    """
    scheduler_instance = PipelineScheduler(job_func=task_callback)
    scheduler_instance.start()
