# Phương pháp dự báo và kiểm định

## Mô hình 2 số cuối

Ensemble đối chứng kết hợp tần suất có làm trơn, trọng số thời gian, chuyển tiếp bậc một và phân bố chữ số. Điểm là điểm xếp hạng chuẩn hóa, không phải cam kết xác suất trúng.

## Mô hình phân cấp 6 số

Giải đặc biệt được biểu diễn là `ABCDEF`. V1.1 kết hợp:

- Sáu phân bố theo vị trí `A…F`.
- Năm cặp liền nhau `AB, BC, CD, DE, EF`.
- Bốn bộ ba liền nhau `ABC, BCD, CDE, DEF`.
- Phân bố tổng sáu chữ số.
- Beam search từ các chữ số dẫn đầu ở từng vị trí.

Tần suất cặp và bộ ba dùng additive smoothing. Mô hình áp dụng backoff về phân bố từng vị trí khi mẫu kết hợp chưa đủ dữ liệu. Không dùng tần suất thô của toàn bộ số 6 chữ số vì không gian có 1.000.000 khả năng trong khi số kỳ quan sát nhỏ.

## Walk-forward backtest

Khi kiểm tra kỳ `i`, mọi đặc trưng chỉ được xây dựng từ `[0,i)`. Kết quả kỳ `i` không được dùng để chọn ứng viên, trọng số hoặc cửa sổ.

### Chỉ số 6 số

- Exact@10 và Exact@50.
- Tỷ lệ chữ số đúng vị trí.
- Tỷ lệ đúng ít nhất 3/6 vị trí.
- Tỷ lệ cặp thật `AB/CD/EF` xuất hiện trong Top 10.
- Kết quả phải được đọc cùng cỡ mẫu.

### Chỉ số 2 số

- Hit@1/5/10.
- MRR.
- Brier score đa lớp.
- So sánh ensemble với baseline tần suất và ngẫu nhiên.

## Quy tắc nâng mô hình

Challenger chỉ được nâng thành champion khi vượt baseline ngoài mẫu, cải thiện trên nhiều tỉnh/giai đoạn, không làm xấu chỉ số hiệu chỉnh nghiêm trọng, đủ cỡ mẫu và tái lập được từ version dữ liệu + cấu hình.

## Lưu ý

Các trọng số V1.1 là cấu hình khởi đầu. Việc tối ưu tiếp theo phải dùng nested walk-forward validation; không chọn trọng số bằng chính tập kỳ dùng để báo cáo thành tích.
