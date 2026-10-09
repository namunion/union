"""
Module cấu hình logging cho hệ thống Auto Video Pipeline.
Sử dụng thư viện loguru để ghi log chi tiết cả ra màn hình console và file lưu trữ.
"""

import sys
from pathlib import Path

try:
    from loguru import logger
    HAS_LOGURU = True
except ImportError:
    HAS_LOGURU = False
    import logging

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
    )
    _raw_logger = logging.getLogger("pipeline")

    class _LoguruFallbackWrapper:
        """Lớp bọc tương thích định dạng chuỗi {} của loguru khi chưa cài loguru."""
        def _format_msg(self, msg: str, args: tuple) -> str:
            if args:
                try:
                    if "{}" in msg or "{" in msg:
                        return msg.format(*args)
                    return msg % args
                except Exception:
                    return f"{msg} {' '.join(str(a) for a in args)}"
            return msg

        def info(self, msg: str, *args, **kwargs) -> None:
            _raw_logger.info(self._format_msg(msg, args), **kwargs)

        def debug(self, msg: str, *args, **kwargs) -> None:
            _raw_logger.debug(self._format_msg(msg, args), **kwargs)

        def warning(self, msg: str, *args, **kwargs) -> None:
            _raw_logger.warning(self._format_msg(msg, args), **kwargs)

        def error(self, msg: str, *args, **kwargs) -> None:
            _raw_logger.error(self._format_msg(msg, args), **kwargs)

        def exception(self, msg: str, *args, **kwargs) -> None:
            _raw_logger.exception(self._format_msg(msg, args), **kwargs)

        def remove(self) -> None:
            pass

        def add(self, *args, **kwargs) -> None:
            pass

    logger = _LoguruFallbackWrapper()


def setup_logger(log_dir: str = "logs", log_level: str = "INFO"):
    """
    Khởi tạo và cấu hình hệ thống ghi log (Loguru).

    Hàm này thực hiện:
    1. Xóa các handler mặc định của loguru để tránh trùng lặp log.
    2. Ghi log ra màn hình console với màu sắc trực quan.
    3. Ghi log ra file xoay vòng (rotation: mỗi ngày một file hoặc khi vượt 10MB).
    4. Ghi riêng các lỗi nghiêm trọng (ERROR/CRITICAL) ra file errors.log.

    Args:
        log_dir: Đường dẫn thư mục chứa các file log (mặc định là 'logs').
        log_level: Mức độ log tối thiểu ('DEBUG', 'INFO', 'WARNING', 'ERROR').

    Returns:
        Đối tượng logger đã được cấu hình sẵn sàng sử dụng.
    """
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    if not HAS_LOGURU:
        return logger

    # Xóa các handler cũ để tránh in lặp log
    logger.remove()

    # Định dạng hiển thị log rõ ràng, thân thiện
    console_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>"
    )

    file_format = (
        "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
        "{level: <8} | "
        "{name}:{function}:{line} - "
        "{message}"
    )

    # 1. Ghi log ra màn hình Console (màu mè đẹp mắt)
    logger.add(
        sys.stderr,
        format=console_format,
        level=log_level,
        colorize=True,
    )

    # 2. Ghi toàn bộ log ra file theo ngày, tự động nén zip file cũ sau 30 ngày
    info_log_file = log_path / "pipeline_{time:YYYY-MM-DD}.log"
    logger.add(
        str(info_log_file),
        format=file_format,
        level=log_level,
        rotation="00:00",         # Tự đổi sang file mới vào nửa đêm
        retention="30 days",      # Giữ lại log trong 30 ngày rồi tự dọn dẹp
        compression="zip",        # Nén log cũ thành zip để tiết kiệm dung lượng VPS
        encoding="utf-8",
        enqueue=True,             # Đảm bảo an toàn khi chạy đa luồng
    )

    # 3. Ghi riêng các sự cố lỗi ra file error.log để dễ kiểm tra sự cố
    error_log_file = log_path / "errors.log"
    logger.add(
        str(error_log_file),
        format=file_format,
        level="ERROR",
        rotation="10 MB",
        retention="60 days",
        encoding="utf-8",
        enqueue=True,
    )

    logger.info("Đã khởi tạo hệ thống logging thành công tại thư mục: {}", log_dir)
    return logger


# Tạo sẵn một instance logger mặc định
app_logger = setup_logger()
