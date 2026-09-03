# XSKT Forecast Lab

Phòng thí nghiệm thống kê và kiểm định dự báo Xổ số Kiến thiết, bắt đầu với XSMN.

> Mục tiêu của dự án là đo xem một phương pháp có vượt baseline ngoài mẫu hay không. Đây không phải công cụ cam kết trúng thưởng; mỗi kỳ quay là một biến cố ngẫu nhiên.

## Điểm khác với phiên bản tham khảo

- Kiến trúc tách biệt dữ liệu, mô hình, backtest và giao diện.
- Walk-forward backtest: mỗi kỳ chỉ dùng dữ liệu đã có trước kỳ đó.
- So sánh trực tiếp với baseline tần suất và baseline ngẫu nhiên.
- Lưu dự báo bất biến trước kỳ quay để đối chiếu về sau.
- Báo cáo Hit@K, MRR và Brier score thay vì chỉ đếm số lần trúng.
- Mô hình và cấu hình có version để tái lập kết quả.
- Giao diện mobile-first, có thể cài như PWA.

## Chạy thử

Mở `index.html` qua một HTTP server hoặc bật GitHub Pages cho nhánh `main`.

Dữ liệu mặc định được đọc ở chế độ chỉ đọc từ repo tham khảo `Thienlee86/du-bao-xsmn`. Người dùng cũng có thể nhập file JSON riêng trong ứng dụng.

## Nguyên tắc kiểm định

1. Không dùng dữ liệu tương lai.
2. Không chọn mô hình dựa trên chính tập dùng để báo cáo.
3. Luôn so với baseline.
4. Không gọi điểm xếp hạng là “xác suất trúng” nếu chưa hiệu chỉnh.
5. Chỉ nâng challenger thành champion sau khi đủ cỡ mẫu và có cải thiện ổn định.

## Cấu trúc

- `src/data.js`: chuẩn hóa và kiểm tra dữ liệu.
- `src/model.js`: baseline và mô hình ensemble.
- `src/backtest.js`: walk-forward evaluation.
- `src/storage.js`: lưu dự báo và đối chiếu thực tế.
- `src/app.js`: điều phối giao diện.
- `docs/METHODOLOGY.md`: phương pháp và lộ trình nâng cấp.

## Nguồn ý tưởng

Tham khảo cấu trúc nghiệp vụ và dữ liệu từ [du-bao-xsmn](https://github.com/Thienlee86/du-bao-xsmn), sau đó thiết kế lại để kiểm định rõ ràng và dễ bảo trì.
